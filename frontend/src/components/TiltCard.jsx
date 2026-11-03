import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

export default function TiltCard({ children, className = '', max = 7 }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 22 });
  const sy = useSpring(y, { stiffness: 200, damping: 22 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max]);

  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      className={`card will-change-transform ${className}`}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={reduce ? undefined : onMove}
      onMouseLeave={onLeave}
      whileHover={reduce ? undefined : { y: -4 }}
    >
      {children}
    </motion.div>
  );
}