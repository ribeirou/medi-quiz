import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const SPACING = 130
const TILT_DEG = 42
const SWIPE_THRESHOLD = 60

export default function SubjectCoverflow({ items, onSelect }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const lastIndex = items.length - 1

  const goTo = (index) => setActiveIndex(Math.min(lastIndex, Math.max(0, index)))

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'ArrowLeft') goTo(activeIndex - 1)
      if (e.key === 'ArrowRight') goTo(activeIndex + 1)
      if (e.key === 'Enter') onSelect(items[activeIndex].subject.id)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, items, onSelect])

  return (
    <div>
      <div
        className="relative h-72 sm:h-80 select-none overflow-x-hidden"
        style={{ perspective: 1200 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -SWIPE_THRESHOLD) goTo(activeIndex + 1)
          else if (info.offset.x > SWIPE_THRESHOLD) goTo(activeIndex - 1)
        }}
      >
        {items.map((item, index) => {
          const offset = index - activeIndex
          const isCenter = offset === 0
          const total = item.stats.correct + item.stats.wrong
          const accuracy = total > 0 ? Math.round((item.stats.correct / total) * 100) : null

          return (
            <motion.button
              key={item.subject.id}
              drag={isCenter ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (info.offset.x < -SWIPE_THRESHOLD) goTo(activeIndex + 1)
                else if (info.offset.x > SWIPE_THRESHOLD) goTo(activeIndex - 1)
              }}
              onClick={() => (isCenter ? onSelect(item.subject.id) : goTo(index))}
              animate={{
                x: offset * SPACING,
                rotateY: isCenter ? 0 : offset > 0 ? -TILT_DEG : TILT_DEG,
                scale: isCenter ? 1 : 0.78,
                opacity: Math.abs(offset) > 3 ? 0 : 1 - Math.abs(offset) * 0.22,
                zIndex: 20 - Math.abs(offset),
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="absolute left-1/2 top-1/2 w-48 sm:w-56 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-lg dark:shadow-black/30 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-semibold shrink-0"
                style={{ backgroundColor: item.subject.color }}
                aria-hidden="true"
              >
                {item.subject.name.charAt(0)}
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white text-left">
                {item.subject.name}
              </h3>
              {isCenter && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 text-left">
                  {item.questionCount} questões{total > 0 ? ` · ${total} respondidas` : ''}
                </p>
              )}
              {isCenter && accuracy !== null && (
                <span className="mt-2 inline-block text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {accuracy}% acerto
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Matéria anterior"
          className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-blue-200 dark:hover:border-blue-700"
        >
          ‹
        </button>
        <div className="flex gap-1.5">
          {items.map((item, index) => (
            <button
              key={item.subject.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ir para ${item.subject.name}`}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex ? 'w-5 bg-blue-600 dark:bg-blue-400' : 'w-1.5 bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex === lastIndex}
          aria-label="Próxima matéria"
          className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-blue-200 dark:hover:border-blue-700"
        >
          ›
        </button>
      </div>
    </div>
  )
}
