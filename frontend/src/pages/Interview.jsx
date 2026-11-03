import { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api.js';
import Button from '../components/Button.jsx';
import ScoreRing from '../components/ScoreRing.jsx';

const MAX_CHARS = 10000;
// "edgeCases" -> "Edge cases"
const humanize = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

export default function Interview() {
  const { sessionId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(state?.question ?? null); // { id, text }
  const [total, setTotal] = useState(state?.total ?? 0);
  const [answered, setAnswered] = useState(0);
  const [booting, setBooting] = useState(!state?.question);

  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);       // { score, breakdown, feedback, strengths, gaps }
  const [nextQuestion, setNextQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);         // { avgScore, answered }

  // After a page refresh the router state is gone, so ask the server where we were
  useEffect(() => {
    if (state?.question) return;
    api(`/sessions/${sessionId}/current`)
      .then((r) => { setQuestion(r.question); setAnswered(r.answered); setTotal(r.total); })
      .catch((e) => setError(e.message))
      .finally(() => setBooting(false));
  }, []);

  async function submit() {
    setError('');
    setLoading(true);
    try {
      const res = await api(`/sessions/${sessionId}/answer`, {
        method: 'POST',
        body: { questionId: question.id, text: answer },
      });
      setFeedback(res.feedback);
      setNextQuestion(res.nextQuestion);
      setAnswered(res.progress.answered);
      setTotal(res.progress.total);
    } catch (e) {
      setError(e.message); // rate limits and AI failures arrive as readable messages
    } finally {
      setLoading(false);
    }
  }

  function goNext() {
    setQuestion(nextQuestion);
    setNextQuestion(null);
    setFeedback(null);
    setAnswer('');
  }

  async function finish() {
    setError('');
    setLoading(true);
    try {
      setSummary(await api(`/sessions/${sessionId}/end`, { method: 'POST' }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Views ---------- */
  if (booting) return <p className="py-24 text-center font-semibold">Loading your session...</p>;

  if (summary) {
    return (
      <div className="container-x grid min-h-[70vh] place-items-center py-12">
        <motion.div className="card-dark w-full max-w-lg text-center" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <span className="eyebrow !text-silver before:!bg-marigold">Session complete</span>
          <div className="my-6 grid place-items-center">
            {summary.avgScore != null
              ? <ScoreRing score={summary.avgScore} size={160} label="avg score" />
              : <p>No answers were submitted.</p>}
          </div>
          <p className="mb-6 text-silver/80">You answered {summary.answered} question{summary.answered === 1 ? '' : 's'}.</p>
          <Button variant="cta" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
        </motion.div>
      </div>
    );
  }

  const isLast = !nextQuestion;
  const pct = total ? Math.min(100, (answered / total) * 100) : 0;

  return (
    <div className="container-x max-w-3xl py-8 sm:py-12">
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm font-semibold text-aubergine">
          <span>Question {Math.min(answered + (feedback ? 0 : 1), total || 1)} of {total || '-'}</span>
          <button onClick={finish} disabled={loading} className="cursor-pointer underline decoration-marigold decoration-2 underline-offset-4 disabled:opacity-50">
            End session
          </button>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-aubergine/15">
          <div className="h-full rounded-full bg-linear-to-r from-aubergine to-marigold transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {error && <p className="notice" role="alert">{error}</p>}

      {!question ? (
        <div className="card text-center">
          <h3 className="mb-2">All questions answered</h3>
          <p className="mb-5 text-sm">Finish the session to see your average score.</p>
          <Button variant="cta" onClick={finish} disabled={loading}>Finish session</Button>
        </div>
      ) : (
        <>
          <motion.div key={question.id} className="card-dark" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge mb-3">Interviewer</span>
            <p className="font-display text-xl leading-snug text-silver sm:text-2xl">{question.text}</p>
          </motion.div>

          <div className="card mt-6">
            <label htmlFor="answer" className="label">Your answer</label>
            <textarea
              id="answer" rows={8} maxLength={MAX_CHARS} disabled={!!feedback || loading}
              className="input min-h-44 resize-y leading-relaxed disabled:opacity-70"
              placeholder="Explain your approach step by step, as you would in a real interview..."
              value={answer} onChange={(e) => setAnswer(e.target.value)}
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-aubergine/60">{answer.length}/{MAX_CHARS}</span>
              {!feedback && (
                <Button variant="cta" onClick={submit} disabled={loading || !answer.trim()}>
                  {loading ? 'Scoring your answer...' : 'Submit answer'}
                </Button>
              )}
            </div>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div className="card mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  <ScoreRing score={feedback.score} />
                  <div className="flex-1">
                    <h3 className="mb-2">Feedback</h3>
                    <p className="text-sm leading-relaxed">{feedback.feedback}</p>
                  </div>
                </div>

                {/* Score breakdown */}
                {Object.keys(feedback.breakdown || {}).length > 0 && (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {Object.entries(feedback.breakdown).map(([key, value]) => (
                      <div key={key}>
                        <div className="mb-1 flex justify-between text-xs font-semibold text-aubergine">
                          <span>{humanize(key)}</span><span>{value}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-aubergine/15">
                          {/* width is relative to the largest part (parts have different maximums) */}
                          <div className="h-full rounded-full bg-marigold" style={{ width: `${Math.min(100, value * 2.5)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 !font-sans !text-sm font-bold"><CheckCircle2 size={16} className="text-marigold" /> Strengths</h4>
                    <ul className="grid gap-1.5 text-sm">
                      {feedback.strengths.length
                        ? feedback.strengths.map((s, i) => <li key={i} className="border-l-2 border-marigold pl-3">{s}</li>)
                        : <li className="text-aubergine/60">None identified.</li>}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 !font-sans !text-sm font-bold"><AlertCircle size={16} className="text-aubergine" /> To improve</h4>
                    <ul className="grid gap-1.5 text-sm">
                      {feedback.gaps.length
                        ? feedback.gaps.map((g, i) => <li key={i} className="border-l-2 border-aubergine pl-3">{g}</li>)
                        : <li className="text-aubergine/60">Nothing major.</li>}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  {isLast
                    ? <Button variant="cta" onClick={finish} disabled={loading}>Finish and see results</Button>
                    : <Button variant="cta" onClick={goNext}>Next question <ArrowRight size={18} /></Button>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}