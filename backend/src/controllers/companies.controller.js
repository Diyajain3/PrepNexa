import {prisma} from '../config/db.js';

//GET /api/companies
export async function getCompanies(req,res)
{
  const companies= await prisma.company.findMany({
    include:{
      practiceSets:{
        select:{
          id:true,
          role:true,
          category:true,
          _count: {select: {questions:true}},
        },
      },
    },
    orderBy: {name: 'asc'},
  });
  res.json(companies);
}