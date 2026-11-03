import "dotenv/config";
 const required=['DATABASE_URL','REDIS_URL','JWT_SECRET','GROQ_API_KEY'];

 for(const key of required)
 {
  if(process.env[key])throw new Error (`Missing env variable: ${key}`);
 }

 export const env={
  port:process.env.port || 4000,
  jwtSecret:process.env.JWT_SECRET,
  jwtExpiresIn:process.env.JWT_EXPIRES_IN || '7d',
  groqKey:process.env.GROQ_API_KEY,
  groqModel:process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  clientUrl:process.env.FRONTEND_URL || 'http://localhost:5173',
  redisUrl: process.env.REDISS_URL,
 };