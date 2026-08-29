import { motion } from 'framer-motion'
import { getFaseProgress } from '../lib/progress'

const OFFSETS = [0, 72, 0, -72]

export default function TrilhaScreen({ subject, fases, onSelectFase, onExit }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onExit}
          className="text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1"
        >
          ← Matérias
        </button>
        <span className="text-sm font-semibold" style={{ color: subject.color }}>
          {subject.name}
        </span>
      </div>

      <div className="relative flex flex-col items-center gap-6 pb-12">
        <div
          className="absolute top-0 bottom-0 border-l-2 border-dashed"
          style={{ borderColor: `${subject.color}33`, left: '50%' }}
          aria-hidden="true"
        />
        {fases.map((fase, index) => {
          const { answered, total } = getFaseProgress(fase, subject.id)
          const isDone = total > 0 && answered === total
          const fraction = total > 0 ? answered / total : 0
          const radius = 28
          const circumference = 2 * Math.PI * radius

          return (
            <motion.button
              key={fase.number}
              onClick={() => onSelectFase(index)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, x: OFFSETS[index % OFFSETS.length] }}
              transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 cursor-pointer"
              aria-label={`Fase ${fase.number}${isDone ? ', concluída' : ''}`}
            >
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4" />
                {fraction > 0 && (
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    fill="none"
                    stroke={subject.color}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - fraction)}
                    strokeLinecap="round"
                    transform="rotate(-90 32 32)"
                  />
                )}
                <circle
                  cx="32"
                  cy="32"
                  r="22"
                  fill={isDone ? subject.color : 'white'}
                  stroke={isDone ? subject.color : '#cbd5e1'}
                  strokeWidth="2"
                />
                <text
                  x="32"
                  y="32"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isDone ? 20 : 16}
                  fontWeight="600"
                  fill={isDone ? 'white' : '#334155'}
                >
                  {isDone ? '✓' : fase.number}
                </text>
              </svg>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
