import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Load from current working dir or from backend/.env relative to this file
dotenv.config();
const configDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(configDir, '../../.env') });

const required = ['DATABASE_URL', 'JWT_SECRET', 'GROQ_API_KEY'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing env variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT || process.env.port || 4000),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  groqKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  clientUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  redisUrl: process.env.REDIS_URL,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback',
};
