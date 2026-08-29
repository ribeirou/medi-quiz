import { motion } from 'framer-motion'

const ICONS = [
  { icon: '🩺', top: '18%', left: '8%', size: 28, duration: 6, delay: 0 },
  { icon: '🧬', top: '72%', left: '10%', size: 24, duration: 7, delay: 0.6 },
  { icon: '💊', top: '15%', left: '90%', size: 26, duration: 5.5, delay: 1.1 },
  { icon: '🫀', top: '68%', left: '90%', size: 30, duration: 6.5, delay: 0.3 },
  { icon: '🔬', top: '88%', left: '50%', size: 22, duration: 5, delay: 0.9 },
  { icon: '📋', top: '10%', left: '50%', size: 20, duration: 6.2, delay: 1.4 },
]

export default function FloatingIcons() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {ICONS.map((item, i) => (
        <motion.span
          key={i}
          className="absolute text-slate-300/50 dark:text-slate-600/40 select-none"
          style={{ top: item.top, left: item.left, fontSize: item.size }}
          animate={{ y: [0, -14, 0], rotate: [0, 6, -6, 0] }}
          transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          {item.icon}
        </motion.span>
      ))}
    </div>
  )
}
