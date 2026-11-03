import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative grid min-h-[calc(100vh-72px)] place-items-center overflow-hidden px-4 py-12">
      {/* soft depth shapes behind the card */}
      <div className="pointer-events-none absolute -top-20 -right-24 size-80 rounded-full bg-marigold/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 size-96 rounded-full bg-aubergine/15 blur-3xl" />

      <motion.div
        className="glass relative w-full max-w-md rounded-3xl p-8 sm:p-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="icon-chip"><Mic size={22} /></span>
        <h1 className="!text-3xl sm:!text-4xl">{title}</h1>
        <p className="mt-2 mb-6 text-sm">{subtitle}</p>
        {children}
        <div className="mt-6 text-center text-sm">{footer}</div>
      </motion.div>
    </div>
  );
}