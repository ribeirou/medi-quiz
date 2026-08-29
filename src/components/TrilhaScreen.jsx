import { motion } from 'framer-motion'
import { getFaseProgress } from '../lib/progress'

const OFFSETS = [0, 72, 0, -72]
const NODE_SIZE = 64
const NODE_GAP = 24
const NODE_STEP = NODE_SIZE + NODE_GAP
const NODE_RADIUS = 32
// Horizontal span of the zigzag itself (independent of the container's
// actual rendered width), centered the same way the nodes are centered
// (flex items-center + a fixed-px x offset), so the path can be centered
// with the same left-1/2 / -translate-x-1/2 trick and line up 1:1 with
// the node centers at any viewport width.
const TRACK_WIDTH = NODE_SIZE + 2 * Math.max(...OFFSETS.map(Math.abs))
const TRACK_CENTER = TRACK_WIDTH / 2

function buildTrilhaPoints(count) {
  return Array.from({ length: count }, (_, i) => ({
    x: TRACK_CENTER + OFFSETS[i % OFFSETS.length],
    y: i * NODE_STEP + NODE_RADIUS,
  }))
}

function pointsToPath(points) {
  if (points.length === 0) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
}

export default function TrilhaScreen({ subject, fases, onSelectFase, onExit }) {
  const points = buildTrilhaPoints(fases.length)
  const trackHeight = fases.length > 0 ? (fases.length - 1) * NODE_STEP + NODE_SIZE : 0
  const pathD = pointsToPath(points)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onExit}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer flex items-center gap-1"
        >
          ← Matérias
        </button>
        <span className="text-sm font-semibold" style={{ color: subject.color }}>
          {subject.name}
        </span>
      </div>

      <div className="relative flex flex-col items-center gap-6 pb-12">
        {pathD && (
          <svg
            className="absolute top-0 left-1/2 -translate-x-1/2 z-0"
            width={TRACK_WIDTH}
            height={trackHeight}
            viewBox={`0 0 ${TRACK_WIDTH} ${trackHeight}`}
            aria-hidden="true"
          >
            <path
              d={pathD}
              stroke={`${subject.color}33`}
              strokeWidth="3"
              strokeDasharray="6 6"
              fill="none"
            />
          </svg>
        )}
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
              className="relative z-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600"
              aria-label={`Fase ${fase.number}${isDone ? ', concluída' : answered > 0 ? `, ${answered} de ${total} respondidas` : ''}`}
            >
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={radius} fill="none" className="text-slate-200 dark:text-slate-700" stroke="currentColor" strokeWidth="4" />
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
                  fill={isDone ? subject.color : 'currentColor'}
                  className={isDone ? '' : 'text-white dark:text-slate-800'}
                />
                <circle
                  cx="32"
                  cy="32"
                  r="22"
                  fill="none"
                  stroke={isDone ? subject.color : 'currentColor'}
                  className={isDone ? '' : 'text-slate-300 dark:text-slate-600'}
                  strokeWidth="2"
                />
                <text
                  x="32"
                  y="32"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isDone ? 20 : 16}
                  fontWeight="600"
                  fill={isDone ? 'white' : 'currentColor'}
                  className={isDone ? '' : 'text-slate-700 dark:text-slate-200'}
                >
                  {isDone ? '✓' : fase.number}
                </text>
              </svg>
              {answered > 0 && !isDone && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-max text-xs text-slate-400 dark:text-slate-500 text-center">
                  {answered}/{total}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
