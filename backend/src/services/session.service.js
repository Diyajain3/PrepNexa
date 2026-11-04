import { redis } from '../config/redis.js';

const TTL_SECONDS = 60 * 60 * 2; // 2 hrs
const key = (id) => `session:${id}`;

/* State stored in Redis / In-memory:
{
 userId, mode, topicId, topicName, practiceSetId, category, difficulty, questionIds: [],
 currentIndex: 0,
 total: 10,
 scores: []
}
*/

// In-memory fallback if Redis is unavailable
const memorySessions = new Map();
const memoryLocks = new Set();
const memoryLeaderboards = new Map();

let redisAvailable = true;
redis.on('error', () => {
  redisAvailable = false;
});
redis.on('connect', () => {
  redisAvailable = true;
});

export async function createSessionState(sessionId, state) {
  memorySessions.set(key(sessionId), { state, expiresAt: Date.now() + TTL_SECONDS * 1000 });
  try {
    if (redisAvailable) {
      await redis.set(key(sessionId), JSON.stringify(state), 'EX', TTL_SECONDS);
    }
  } catch {
    redisAvailable = false;
  }
}

export async function getSessionState(sessionId) {
  try {
    if (redisAvailable) {
      const raw = await redis.get(key(sessionId));
      if (raw) return JSON.parse(raw);
    }
  } catch {
    redisAvailable = false;
  }
  const entry = memorySessions.get(key(sessionId));
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memorySessions.delete(key(sessionId));
    return null;
  }
  return entry.state;
}

export async function saveSessionState(sessionId, state) {
  memorySessions.set(key(sessionId), { state, expiresAt: Date.now() + TTL_SECONDS * 1000 });
  try {
    if (redisAvailable) {
      await redis.set(key(sessionId), JSON.stringify(state), 'EX', TTL_SECONDS);
    }
  } catch {
    redisAvailable = false;
  }
}

export async function clearSessionState(sessionId) {
  memorySessions.delete(key(sessionId));
  try {
    if (redisAvailable) {
      await redis.del(key(sessionId));
    }
  } catch {
    redisAvailable = false;
  }
}

// Moves the session forward after an answer is scored
export async function advanceSession(sessionId, state, score, nextQuestionId = null) {
  state.scores.push(score);
  state.currentIndex += 1;
  if (nextQuestionId) state.questionIds.push(nextQuestionId);
  await saveSessionState(sessionId, state);
  return state;
}

/*---Lock: stops double-submits from being scored (and billed) twice ----*/
export async function acquireLock(sessionId) {
  const lockKey = `lock:${sessionId}`;
  try {
    if (redisAvailable) {
      const ok = await redis.set(lockKey, '1', 'EX', 60, 'NX');
      return ok === 'OK';
    }
  } catch {
    redisAvailable = false;
  }
  if (memoryLocks.has(lockKey)) return false;
  memoryLocks.add(lockKey);
  setTimeout(() => memoryLocks.delete(lockKey), 60000);
  return true;
}

export async function releaseLock(sessionId) {
  const lockKey = `lock:${sessionId}`;
  memoryLocks.delete(lockKey);
  try {
    if (redisAvailable) {
      await redis.del(lockKey);
    }
  } catch {
    redisAvailable = false;
  }
}

/*--- Weekly leaderboard (redis sorted set or in-memory fallback)----*/
function weekKey() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return `leaderboard:weekly:${d.toISOString().slice(0, 10)}`;
}

export async function addToLeaderboard(userId, points) {
  const k = weekKey();
  try {
    if (redisAvailable) {
      await redis.zincrby(k, points, userId);
      await redis.expire(k, 60 * 60 * 24 * 14); // keep 2 weeks
      return;
    }
  } catch {
    redisAvailable = false;
  }
  const board = memoryLeaderboards.get(k) || new Map();
  board.set(userId, (board.get(userId) || 0) + points);
  memoryLeaderboards.set(k, board);
}

// Returns [{userId, points}]
export async function getTopLeaderboard(limit = 10) {
  const k = weekKey();
  try {
    if (redisAvailable) {
      const flat = await redis.zrevrange(k, 0, limit - 1, 'WITHSCORES');
      const rows = [];
      for (let i = 0; i < flat.length; i += 2) {
        rows.push({ userId: flat[i], points: Number(flat[i + 1]) });
      }
      return rows;
    }
  } catch {
    redisAvailable = false;
  }
  const board = memoryLeaderboards.get(k) || new Map();
  return Array.from(board.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([userId, points]) => ({ userId, points }));
}
