import { generateQuestion } from "../services/ai.service";

const guard=(req,res)=>
{
  //these endpoints exist only for testing prompts,keep them off in production
  if(process.env.NODE_ENV === 'production')
  {
    res.status(404).json({message: 'Not found'});
    return false;
  }
  return true;
}

//POST /api/ai/test-question
// body: {topic, difficulty?, category?, previousQuestions?}

export async function testQuestion(req,res){
  if(!guard(req,res)) return;

  const {topic, difficulty='MEDIUM', category='DSA',previousQuestions=[]}=req.body;

  if(!topic)
  {
    return res.status(400).json({message: 'topic is required'});
  }

  const question=await generateQuestion(topic, difficulty,previousQuestions,category);

  res.json({question});
}
  //POST /api/ai/test-score
  //body: {question, answer, difficulty?, category?}
  export async function testScore(req,res)
  {
    if(!guard(req,res))return;

    const {question,answer,difficulty='MEDIUM', category='DSA'}=req.body;

    if(!question) return res.status(400).json({message: 'question is required'});

    const result=await scoreAnswer(question,answer ?? '',{category, difficulty});

    res.json(result);
  }