import {redis} from '../config/db.js';

const TTL_SECONDS= 60*60*2; //2 hrs
const key= (id)=>`session:${id}`;

/*State stored in Redis:
{
 userId, mode, topicId, topicName, practiceSetId, category, difficulty, questionIds: [], //COMPANY_SET: full list up front. MANUAL: grows as questions are generated.
 currentIndex:0,
 total:10,
 scores:[]
}
*/

export async function createSessionState(sessionId,state)
{
  await redis.set(key(sessionId),JSON.stringify(state),'EX',TTL_SECONDS)
}

export async function getSessionState(sessionId)
{
  const raw=await redis.get(key(sessionId));
  return raw? JSON.parse(raw):null;
}

export async function saveSessionState(sessionId, state)
{
  await redis.set(key(sessionId),JSON.stringify(state),'EX', TTL_SECONDS);
}

export async function clearSessionState(sessionId)
{
  await redis.del(key(sessionId));
}

//Moves the session forward after an answer is scored
//nextQuestionId is only passed in MANUAL mode, where the list grows as the AI generates.
export async function advanceSession(sessionId, state, score, nextQuestionId=null)
{
  state.scores.push(score);
  state.currentIndex+=1;
  if(nextQuestionId) state.questionIds.push(nextQuestionId);
  await saveSessionState(sessionId,state);
  return state;
}

/*---Lock: stops double-submits from being scored (and billed) twice ----*/
export async function acquireLock(sessionId)
{
  const ok=await redis.set(`lock:${sessionId}`,'1','EX',60,'NX');
  return ok==='OK';
}

export const releaseLock=(sessionId)=>redis.del(`lock:${sessionId}`);

/*--- Weekly leaderboard (redis sorted set)----*/
//key is the monday of the current week, so each week starts fresh
function weekKey()
{
  const d=new Date();
  d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));
  return `leaderboard:weekly:${d.toISOString().slice(0,10)}`;
}

export async function addToLeaderboard(userId, points)
{
  const k=weekKey();
  await redis.zincrby(k, points, userId);
  await redis.expire(k,60*60*24*14); //keep 2 weeks
}

//For the Phase 2 leaderboard endpoint: returns [{userId, points}]
export async function getTopLeaderboard(limit=10)
{
  const flat=await redis.zrevrange(weekKey(),0, limit-1,'WITHSCORES');
  const rows=[];
  for(let i=0;i<flat.length; i+=2)
  {
    rows.push({userId: flat[i],points:Number(flat[i+1])})
  }
  return rows;
}