import { motion } from 'framer-motion'
import { getFaseProgress, getWrongIds } from '../lib/progress'

export default function TopicScreen({ subject, topics, onSelectTopic, onExit, onReviewErrors }) {
  const wrongCount = getWrongIds(subject.id).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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

      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4 text-center">
        Escolha um tópico
      </h2>

      {wrongCount > 0 && (
        <motion.button
          onClick={onReviewErrors}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mb-6 rounded-2xl border-2 border-dashed p-4 flex items-center justify-between gap-3 cursor-pointer transition-colors"
          style={{ borderColor: subject.color }}
        >
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            🔁 Revisar {wrongCount} {wrongCount === 1 ? 'questão' : 'questões'} que você errou
          </span>
          <span className="text-sm font-semibold" style={{ color: subject.color }}>
            Revisar →
          </span>
        </motion.button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {topics.map((topic, index) => {
          const { answered, total } = getFaseProgress({ questions: topic.questions }, subject.id)
          const isDone = total > 0 && answered === total

          return (
            <motion.button
              key={topic.name}
              onClick={() => onSelectTopic(index)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="text-left w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600"
              style={{ borderColor: isDone ? subject.color : undefined }}
            >
              <div className="flex items-start justify-between gap-3">
                <motion.span
                  className="text-2xl inline-block"
                  aria-hidden="true"
                  whileHover={{ rotate: [0, -10, 10, -6, 0], scale: 1.15 }}
                  transition={{ duration: 0.5 }}
                >
                  {topic.icon}
                </motion.span>
                {isDone && (
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: subject.color }}
                  >
                    ✓ Completo
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                {topic.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {topic.questions.length} questões{answered > 0 ? ` · ${answered} respondidas` : ''}
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
