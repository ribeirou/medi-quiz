import { motion } from 'framer-motion'
import { getSubjectStats } from '../lib/progress'

export default function StatsScreen({ subjects, onExit }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onExit}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer flex items-center gap-1"
        >
          ← Início
        </button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Seu progresso
        </span>
      </div>

      <div className="space-y-5">
        {subjects.map((subject, i) => {
          const { correct, wrong } = getSubjectStats(subject.id)
          const total = correct + wrong
          const pct = total > 0 ? Math.round((100 * correct) / total) : 0

          return (
            <div key={subject.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {subject.name}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {pct}% · {correct}/{total} respondidas
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: subject.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
