import Groq from "groq-sdk"
import { env } from "../config/env"
import { questionPrompt,scorePrompt } from "../utils/prompts"
import { questionSchema,scoreSchemaFor } from "../utils/ai.schema";

const groq=new Groq({apiKey:env.groqKey});

class AiOutputError extends Error {}
const httpError=(status, message)=> Object.assign(new Error(message),{status})

/*---core helpers---*/
async function askJson({system, user},schema, temperature)
{
  let raw;
  try{
    const completion=await groq.chat.completions.create({
      model:env.groqModel,
      messages:[
        {role:'system',content:system},
        {role:'user',content:'user'},
      ],
      response_format:{type:'json_object'},
      temperature,
    });
    raw=completion.choices[0]?.message?.content??'';
  }catch{
    throw new AiOutputError('Model returned invalid JSON');
  }

  const result=schema.safeParse(json);
  if(!result.success)
  {
    throw new AiOutputError('Model output failed validation');
  }
  return result.data;
}

//retries only bad output. Rate limits and outages are thrown straight away.
async function withRetry(fn,attempts=2)
{
  for(let i=0;i<attempts;i++)
  {
    try{
      return await fn();
    }catch(err)
    {
      if(!(err instanceof AiOutputError)) throw err;
    }
  }
  throw httpError(502,'The AI returned an unusable response. Please try again.');
}

/*-------Duplicate check------*/
const normalize=(s)=>s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const isDuplicate=(q,previous)=>
{
  const a=normalize(q);
  return previous.some((p)=>
  {
    const b=normalize(p);
    if(!b) return false;//an empty string would match everything
    //includes() only counts when the shorter text is long enough to be meaningful

    const shortLen=Math.min(a.length, b.length);
    return a===b || (shortLen>30 && (a.includes(b) || b.includes(a)));
    });
}

/*-----public api-----*/
export async function generateQuestion(topic, difficulty,previousQuestion=[],category='DSA',context={})
{
  return withRetry(async()=>
  {
    const {question}=await askJson(
      questionPrompt(topic,difficulty,previousQuestion,category,context),
      questionSchema,
      0.8
    );
    if(isDuplicate(question,previousQuestion))
    {
      throw new AiOutputError('Duplicate question')
    }
    return question;
  },3);
}

export async function scoreAnswer(question, answer, context={})
{
  //Skip the API call (and the token cost) for empty answers

  if(!answer || answer.trim().length<5)
  {
    return {
      score:0,
      breakdown:{},
      feedback:'No answer was provided. Try writing out your approach step by step.',
      strengths:[],
      gaps:['No answer submitted'],
    };
  }

  const schema=scoreSchemaFor(context.category);

  return withRetry(async()=>
  {
    const data=await askJson(scorePrompt(question,answer,context),schema,0.2);

    //zod has already clamped each part , os adding them up is safe
    const score=Object.values(data.scores).reduce((sum,n)=>sum+n,0);

    return {
      score,
      breakdown:data.scores,
      feedback:data.feedback,
      strengths:data.strengths,
      gaps:data.gaps,
    };
  });
}