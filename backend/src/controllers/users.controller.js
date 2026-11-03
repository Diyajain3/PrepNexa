import {prisma} from '../config/db.js';

const round1=(n)=> (n=== null ? null :Math.round(n*10)/10);

//GET /api/users/me
export async function getMe(req,res)
{
  const userId=req.user.id;

  const[user,sessions, answers]=await promise.all([
    prisma.user.findUnique({
      where:{id:userId},
      select:{id:true, email:true, createdAt:true, name:true},
    }),
    prisma.interviewSession.count({where:{userId}}),
    prisma.answer.aggregate({
      where: {session:{userId}},
      _avg:{score:true},
      _count:true,
    }),
  ]);

  if(!user) return res.status(404).json({message: 'User not found'});

  res.json({
    ...user,
    stats:{
      sessions,
      answers: answers._count,
      avgScore: round1(answers._avg.score),
    }
  })
}