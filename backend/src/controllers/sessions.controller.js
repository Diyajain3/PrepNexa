import { prisma } from '../config/db.js';
import { generateQuestion, scoreAnswer } from '../services/ai.service.js';
import {
  createSessionState, getSessionState, clearSessionState,
  advanceSession, acquireLock, releaseLock, addToLeaderboard,
} from '../services/session.service.js';

const MAX_MANUAL_QUESTIONS = 10;

const httpError = (status, message) => Object.assign(new Error(message), { status });
const round1 = (n) => Math.round(n * 10) / 10;

async function getOwnedSession(id, userId) {
  const session = await prisma.interviewSession.findUnique({ where: { id } });
  if (!session || session.userId !== userId) throw httpError(404, 'Session not found');
  return session;
}

/* POST /api/sessions/start
   body: { mode: 'MANUAL' | 'COMPANY_SET', topicId?, practiceSetId?, difficulty?, language? } */
export async function startSession(req, res) {
  const { mode, topicId, practiceSetId, difficulty = 'MEDIUM', language = 'Python' } = req.body;

  let category, topicName = null, questionIds, firstQuestion, total;

  if (mode === 'COMPANY_SET') {
    const set = await prisma.practiceSet.findUnique({
      where: { id: practiceSetId },
      include: { questions: { select: { id: true, text: true }, orderBy: { id: 'asc' } } },
    });
    if (!set || set.questions.length === 0) throw httpError(404, 'Practice set not found or empty');

    category = set.category;
    questionIds = set.questions.map((q) => q.id);
    firstQuestion = set.questions[0];
    total = questionIds.length;
  } else {
    let topic = null;
    const requestedCat = String(req.body.category || 'DSA').toUpperCase();
    const rawName = (req.body.topicName || req.body.topic || '').trim();

    if (topicId) {
      topic = await prisma.topic.findUnique({ where: { id: topicId } }).catch(() => null);
    }

    if (!topic && rawName) {
      topic = await prisma.topic.findUnique({ where: { name: rawName } }).catch(() => null);
      if (!topic) {
        topic = await prisma.topic.create({
          data: { name: rawName, category: requestedCat },
        });
      }
    }

    if (!topic) {
      topic = await prisma.topic.findFirst({ where: { category: requestedCat } });
      if (!topic) {
        const defaultNames = {
          DSA: 'Data Structures & Algorithms',
          SYSTEM_DESIGN: 'System Architecture & Scaling',
          DBMS: 'Database Indexing & Optimization',
          OS: 'Operating Systems & Concurrency',
          NETWORKS: 'TCP/IP & Network Protocols',
          HR: 'Behavioral & Leadership Scenarios',
        };
        const name = defaultNames[requestedCat] || `${requestedCat} Core Concepts`;
        topic = await prisma.topic.create({
          data: { name, category: requestedCat },
        });
      }
    }

    category = topic.category;
    topicName = topic.name;

    // Generate BEFORE creating the session, so an AI failure leaves no empty session behind
    const text = await generateQuestion(topic.name, difficulty, [], category);
    firstQuestion = await prisma.question.create({
      data: { text, difficulty, source: 'AI_GENERATED', topicId: topic.id },
      select: { id: true, text: true },
    });
    questionIds = [firstQuestion.id];
    total = MAX_MANUAL_QUESTIONS;
  }

  const effectiveTopicId = mode === 'MANUAL' ? (topicName ? (await prisma.topic.findUnique({ where: { name: topicName } }))?.id : topicId) : null;

  const session = await prisma.interviewSession.create({
    data: {
      userId: req.user.id,
      mode,
      topicId: effectiveTopicId,
      practiceSetId: mode === 'COMPANY_SET' ? practiceSetId : null,
    },
  });

  await createSessionState(session.id, {
    userId: req.user.id,
    mode,
    topicId: effectiveTopicId,
    topicName,
    practiceSetId: practiceSetId ?? null,
    category,
    difficulty,
    language,
    questionIds,
    currentIndex: 0,
    total,
    scores: [],
  });

  res.status(201).json({ sessionId: session.id, question: firstQuestion, total, category, language });
}

/* POST /api/sessions/:id/answer   body: { questionId, text, language? } */
export async function submitAnswer(req, res) {
  const { id } = req.params;
  const { questionId, text, language } = req.body;

  const state = await getSessionState(id);
  if (!state || state.userId !== req.user.id) throw httpError(404, 'Session not found or expired');

  // Only the current question can be answered (blocks replays and skipping ahead)
  if (state.questionIds[state.currentIndex] !== questionId) {
    throw httpError(409, 'That is not the current question');
  }

  if (!(await acquireLock(id))) throw httpError(429, 'Your previous answer is still being scored');

  try {
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw httpError(404, 'Question not found');

    const nextIndex = state.currentIndex + 1;

    // MANUAL: start generating the next question while the answer is being scored
    let nextTextPromise = Promise.resolve(null);
    if (state.mode === 'MANUAL' && nextIndex < state.total) {
      const asked = await prisma.question.findMany({
        where: { id: { in: state.questionIds } },
        select: { text: true },
      });
      nextTextPromise = generateQuestion(
        state.topicName, state.difficulty, asked.map((q) => q.text), state.category
      );
    }

    const targetLanguage = language || state.language || 'Python';

    // Both AI calls finish BEFORE anything is saved. If either fails, nothing is written,
    // so the student can safely resubmit without creating duplicate answers.
    const [result, nextText] = await Promise.all([
      scoreAnswer(question.text, text, {
        category: state.category,
        difficulty: question.difficulty,
        language: targetLanguage,
      }),
      nextTextPromise,
    ]);

    let next = null;
    await prisma.$transaction(async (tx) => {
      await tx.answer.create({
        data: {
          sessionId: id,
          questionId,
          userText: text,
          score: result.score,
          breakdown: result.breakdown,
          feedback: result.feedback,
          strengths: result.strengths,
          gaps: result.gaps,
        },
      });
      if (nextText) {
        next = await tx.question.create({
          data: { text: nextText, difficulty: state.difficulty, source: 'AI_GENERATED', topicId: state.topicId },
          select: { id: true, text: true },
        });
      }
    });

    // COMPANY_SET: the next question is already in the list
    if (state.mode === 'COMPANY_SET' && nextIndex < state.questionIds.length) {
      next = await prisma.question.findUnique({
        where: { id: state.questionIds[nextIndex] },
        select: { id: true, text: true },
      });
    }

    await advanceSession(id, state, result.score, state.mode === 'MANUAL' ? next?.id : null);

    // A Redis hiccup here must not fail an answer that was already scored and saved
    await addToLeaderboard(req.user.id, result.score).catch(console.error);

    res.json({
      feedback: {
        score: result.score,
        breakdown: result.breakdown,
        feedback: result.feedback,
        strengths: result.strengths,
        gaps: result.gaps,
      },
      nextQuestion: next,
      progress: { answered: nextIndex, total: state.total },
    });
  } finally {
    await releaseLock(id);
  }
}

/* GET /api/sessions/:id/current  (used by the frontend after a page refresh) */
export async function getCurrentQuestion(req, res) {
  const state = await getSessionState(req.params.id);
  if (!state || state.userId !== req.user.id) throw httpError(404, 'Session not found or expired');

  const questionId = state.questionIds[state.currentIndex];
  const question = questionId
    ? await prisma.question.findUnique({ where: { id: questionId }, select: { id: true, text: true, difficulty: true } })
    : null;

  res.json({
    question,
    answered: state.currentIndex,
    total: state.total,
    category: state.category,
    language: state.language || 'Python',
  });
}

/* POST /api/sessions/:id/end */
export async function endSession(req, res) {
  const session = await getOwnedSession(req.params.id, req.user.id);

  // Calling end twice is harmless
  if (session.endedAt) return res.json({ avgScore: session.avgScore, alreadyEnded: true });

  // Average from the database, which is the source of truth (Redis may have expired)
  const agg = await prisma.answer.aggregate({
    where: { sessionId: session.id },
    _avg: { score: true },
    _count: true,
  });
  const avgScore = agg._avg.score === null ? null : round1(agg._avg.score);

  await prisma.interviewSession.update({
    where: { id: session.id },
    data: { endedAt: new Date(), avgScore },
  });
  await clearSessionState(session.id);

  res.json({ avgScore, answered: agg._count });
}

/* GET /api/sessions  -> history */
export async function getSessions(req, res) {
  res.json(
    await prisma.interviewSession.findMany({
      where: { userId: req.user.id },
      orderBy: { startedAt: 'desc' },
      take: 50,
      include: { _count: { select: { answers: true } } },
    })
  );
}

/* GET /api/sessions/:id  -> full review with every answer */
export async function getSession(req, res) {
  const session = await prisma.interviewSession.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: {
      answers: {
        orderBy: { createdAt: 'asc' },
        include: { question: { select: { text: true, difficulty: true } } },
      },
    },
  });
  if (!session) throw httpError(404, 'Session not found');
  res.json(session);
}