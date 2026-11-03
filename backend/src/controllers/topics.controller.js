import {prisma} from '../config/db.js'

//GET /api/topics?category=DSA
export async function getTopics(req,res)
{
  const {category}=req.query;
  const topics=await prisma.topic.findMany({
    where: category ? {category: String(category).toUpperCase()}: {},
    orderBy: [{category: 'asc'},{name: 'asc'}],
  });
  res.json(topics);
}