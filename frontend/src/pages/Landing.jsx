import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Building2, Brain, FileText, Mic, Trophy, BarChart3, ArrowRight } from 'lucide-react';
import Button from '../components/Button.jsx';
import TiltCard from '../components/TiltCard.jsx';

// Loaded on demand so the 3D library doesn't slow down the first paint
const Hero3D = lazy(() => import('../components/Hero3D.jsx'));

const features = [
  { icon: Building2, title: 'Company practice sets', text: 'Curated question sets for specific companies and roles, in the order an interview flows.' },
  { icon: Brain, title: 'AI scoring with a rubric', text: 'Every answer is scored on clear criteria, with specific strengths and gaps, not just a number.' },
  { icon: BarChart3, title: 'Practice by topic', text: 'Pick DSA, system design, HR and more, choose a difficulty, and get fresh questions every time.' },
  { icon: FileText, title: 'Resume ATS checker', text: 'Match your resume against a job description and see what is missing.', soon: true },
  { icon: Mic, title: 'Voice interviews', text: 'Speak your answers and hear the questions, like a real interview.', soon: true },
  { icon: Trophy, title: 'Leaderboard and weak topics', text: 'Track your progress and see exactly which topics need work.', soon: true },
];

const steps = [
  { n: '01', title: 'Choose your practice', text: 'Select a company set, or pick a topic and difficulty.' },
  { n: '02', title: 'Answer the question', text: 'Write your answer the way you would say it in the room.' },
  { n: '03', title: 'Get scored feedback', text: 'See your score, what you did well, and what to improve next.' },
];

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

export default function Landing() {
  return (
    <>
      {/* HERO */}
      <section className="container-x grid items-center gap-8 py-12 sm:py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
          <motion.span variants={fade} className="eyebrow">AI interview practice</motion.span>
          <motion.h1 variants={fade} className="mt-4">
            Walk into your interview <span className="relative whitespace-nowrap">
              ready.
              <span className="absolute -bottom-1 left-0 h-2 w-full rounded-full bg-marigold/70 -z-10" />
            </span>
          </motion.h1>
          <motion.p variants={fade} className="mt-5 max-w-xl text-lg">
            Practice company-style questions, get scored on a clear rubric, and see exactly what to fix, one answer at a time.
          </motion.p>
          <motion.div variants={fade} className="mt-8 flex flex-wrap gap-3">
            <Button variant="cta" to="/signup">Start practicing free <ArrowRight size={18} /></Button>
            <Button variant="secondary" to="/login">I have an account</Button>
          </motion.div>
        </motion.div>

        <div className="relative h-80 sm:h-[460px] lg:h-[520px]">
          <Suspense fallback={<div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#EAAA00,#3A0F34_70%)] opacity-80" />}>
            <Hero3D />
          </Suspense>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section">
        <div className="container-x">
          <span className="eyebrow">Features</span>
          <h2 className="mt-3 mb-10 max-w-2xl">Everything you need to practice with purpose</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text, soon }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: (i % 3) * 0.08, duration: 0.5 }}
              >
                <TiltCard className="h-full">
                  <span className="icon-chip"><Icon size={22} /></span>
                  <h3 className="mb-2 flex items-center gap-2">
                    {title} {soon && <span className="badge">Soon</span>}
                  </h3>
                  <p className="text-sm">{text}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section pt-0">
        <div className="container-x">
          <span className="eyebrow">How it works</span>
          <h2 className="mt-3 mb-10">Three steps. Real feedback.</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="border-t-2 border-aubergine pt-5">
                <div className="font-display text-5xl font-bold text-marigold [-webkit-text-stroke:1.5px_#3A0F34]">{s.n}</div>
                <h3 className="mt-3 mb-1">{s.title}</h3>
                <p className="text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="container-x pb-16">
        <div className="card-dark relative overflow-hidden text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -top-24 -right-20 size-96 rounded-full bg-[radial-gradient(circle,rgba(234,170,0,0.45),transparent_65%)]" />
          <div className="relative">
            <h2 className="!text-silver">Your next interview starts here</h2>
            <p className="mx-auto mt-3 mb-7 max-w-lg text-silver/80">Create a free account and answer your first question in under a minute.</p>
            <Button variant="cta" to="/signup">Get started</Button>
          </div>
        </div>
      </section>
    </>
  );
}