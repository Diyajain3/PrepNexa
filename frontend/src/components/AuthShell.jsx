import { motion } from 'framer-motion';

export default function AuthShell({ title, subtitle, children, footer, sideTitle, sidePoints }) {
  return (
    <div className="container-wire py-10">
      <motion.div
        className="wire-box"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Side: Form */}
          <div className="wire-sub-box p-6 sm:p-8">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mb-1">{title}</h1>
            <p className="text-xs text-stone-600 mb-5">{subtitle}</p>
            {children}
            <div className="mt-4 border-t border-border pt-3 text-xs text-center text-stone-600">
              {footer}
            </div>
          </div>

          {/* Right Side: Info / Specs */}
          <div className="wire-sub-box p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-bold uppercase text-stone-600 mb-1">
                Platform Overview
              </div>
              <h2 className="text-lg font-bold text-stone-900 mb-3">
                {sideTitle || 'Why Practice on IntroAI'}
              </h2>
              <ul className="space-y-3 text-xs leading-relaxed text-stone-700">
                {(sidePoints || [
                  '1. Language choices: Code in Python, C++, Java, or JavaScript.',
                  '2. Algorithmic accuracy: Automated syntax and edge-case checking.',
                  '3. Complexity evaluation: Big-O time and space analysis on every submit.',
                  '4. Immediate feedback: Clear strengths, gaps, and concrete code improvements.',
                ]).map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 border-t border-border pt-3 text-[0.72rem] font-mono text-stone-500">
              Encrypted session security
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
