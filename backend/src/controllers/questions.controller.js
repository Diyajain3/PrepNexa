import {prisma} from '../config/db.js';

//GET /api/ questions?practiceSetId=...&topicId=...page=1 & limit=20
export async function getQuestions(req,res)
{
  const {practiceSetId, topicId}=req.query;
  const page=Math.max(1,Number(req.query.page) || 1);
  const limit=Math.min(50,Math.max(1,Number(req.query.limit)|| 20));

  const where={};
  if(practiceSetId) where.practiceSetId=String(practiceSetId);
  if(topicId) where.topicId=String(topicId);

  const [items,total]=await Promise.all([
    prisma.question.findMany({
      where,
      select: {id:true, text:true, difficulty:true},
      skip: (page-1)*limit,
      take:limit,
    }),
    prisma.question.count({where}),
  ]);
  res.json({items, total, page, limit})
}