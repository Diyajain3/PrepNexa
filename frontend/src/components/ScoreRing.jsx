import { motion } from 'framer-motion';

export default function ScoreRing({ score = 0, size = 132, label = '/100' }) {
  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(58,15,52,0.14)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#EAAA00" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-3xl font-bold text-aubergine">{Math.round(score)}</div>
        <div className="text-xs font-semibold text-aubergine/60">{label}</div>
      </div>
    </div>
  );
}