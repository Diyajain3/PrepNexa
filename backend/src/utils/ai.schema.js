import {z} from 'zod';
import {rubricFor} from './propmt.js';

/* ---------- Question ---------- */
export const questionSchema=z.object({
  question:z.string().trim().min(15).max(2000),
})

/* ---------- Score ---------- */

// Accepts 35, "35", or 35.4. Clamps into 0..max. Missing or non-numeric values fail.

const rubricPart=(max)=>z.preprocess((v)=>(
  typeof v==='string' && v.trim()!== ''? Number(v):v),z.number().finite()
).transform((n)=>Math.min(max,Math.max(0,Math.round(n))));

// Build the schema from the same rubric the prompt uses, so they can never drift apart
export function scoreSchemaFor(category)
{
  const shape={};
  for(const [key,max] of rubricFor(category))
  {
    shape[key]=rubricPart(max);
  }

  return z.object({
    scores: z.object(shape),
    feedback:z.string().trim().min(1).transform((s)=>s.slice(0,1500)),

    strengths:z.array(z.string().trim().min(1).catch([]).transform((a)=>a.slice(0,5))),
  gap:z.array(z.string().trim().min(1).catch([]).transform((a)=>a.slice(0,5))),
  })
}

