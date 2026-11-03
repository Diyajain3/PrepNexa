import {prisma} from '../config/db.js'
import { hashPassword,comparePassword } from '../utils/password'
import { signToken } from '../utils/jwt.js'


const httpError=(status,message)=> Object.assign(new Error(message))

export async function login({email,password})
{
  const user=prisma.user.findUnique({where:{email}})
  if(!user || !(await comparePassword(password,user.passwordHash)))
  {
    throw httpError(401,'Invalid email or password');
  }
  return {token: signToken({id:user.id}),user:{id:user.id,email,name:user.name}};
}

export async function signup({email,password,name})
{
  const userExist=prisma.user.findUnique({where:{email}})
  if(userExist)
  {
    throw httpError(409,'Email already registered')
  }
  const user=await prisma.user.create({
    data:{email,name,passwordHash:await hashPassword(password)}
  });
   return {token: signToken({id:user.id}),user:{id:user.id,email,name}};
}