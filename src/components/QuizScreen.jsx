import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { recordAnswer, getDraft, saveDraft, getXP, getStreak } from '../lib/progress'

export default function QuizScreen({ subject, questions, onExit, backLabel = '← Matérias' }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [xp, setXp] = useState(getXP())
  const [xpPop, setXpPop] = useState(null)

  const question = questions[index]
  const isLast = index === questions.length - 1
  const isFirst = index === 0
  const streak = getStreak()

  function goNext() {
    setSelected(null)
    setRevealed(false)
    setIndex((i) => Math.min(i + 1, questions.length - 1))
  }

  function goPrev() {
    setSelected(null)
    setRevealed(false)
    setIndex((i) => Math.max(i - 1, 0))
  }

  function celebrate(amount) {
    setXp(getXP())
    setXpPop(amount)
    setTimeout(() => setXpPop(null), 900)
  }

  function handleMcqSelect(optionIndex) {
    if (selected !== null) return
    setSelected(optionIndex)
    const wasCorrect = optionIndex === question.answerIndex
    recordAnswer(subject.id, question.id, wasCorrect)
    if (wasCorrect) celebrate(10)
  }

  function handleSelfCheck(wasCorrect) {
    recordAnswer(subject.id, question.id, wasCorrect)
    setRevealed('done')
    if (wasCorrect) celebrate(10)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer flex items-center gap-1"
        >
          {backLabel}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
            🔥 {streak.count}
          </span>
          <span className="relative text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">
            {xp} XP
            <AnimatePresence>
              {xpPop && (
                <motion.span
                  initial={{ opacity: 0, y: 0, scale: 0.8 }}
                  animate={{ opacity: 1, y: -22, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute left-1/2 -translate-x-1/2 -top-2 text-green-600 font-bold whitespace-nowrap"
                >
                  +{xpPop}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {index + 1}/{questions.length}
          </span>
        </div>
      </div>

      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: subject.color }}
          initial={false}
          animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          <span
            className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
            style={{ backgroundColor: `${subject.color}1a`, color: subject.color }}
          >
            {question.type === 'mcq' ? 'Múltipla escolha' : 'Dissertativa'}
          </span>

          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 leading-snug">
            {question.question}
          </h2>

          {question.image && (
            <div className="mb-6">
              <img
                src={question.image.url}
                alt={question.image.alt}
                className="w-full max-h-96 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-white"
              />
              {question.image.credit && (
                <p className="text-xs text-slate-400 mt-1.5">{question.image.credit}</p>
              )}
            </div>
          )}

          {question.type === 'mcq' ? (
            <McqBody
              question={question}
              selected={selected}
              onSelect={handleMcqSelect}
            />
          ) : (
            <DissertativaBody
              question={question}
              revealed={revealed}
              onReveal={() => setRevealed(true)}
              onSelfCheck={handleSelfCheck}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-0 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          Anterior
        </button>
        <button
          onClick={isLast ? onExit : goNext}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer"
          style={{ backgroundColor: subject.color }}
        >
          {isLast ? 'Finalizar' : 'Próxima'}
        </button>
      </div>
    </div>
  )
}

function McqBody({ question, selected, onSelect }) {
  return (
    <div className="space-y-2.5">
      {question.options.map((opt, i) => {
        const isSelected = selected === i
        const isCorrect = i === question.answerIndex
        const showState = selected !== null
        let stateClasses = 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
        if (showState && isCorrect) {
          stateClasses = 'border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-950/40'
        } else if (showState && isSelected && !isCorrect) {
          stateClasses = 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-950/40'
        }

        return (
          <motion.button
            key={i}
            onClick={() => onSelect(i)}
            disabled={selected !== null}
            whileTap={selected === null ? { scale: 0.98 } : {}}
            animate={showState && isCorrect ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors flex items-center justify-between gap-3 ${stateClasses} ${selected === null ? 'cursor-pointer' : ''}`}
          >
            <span className="text-sm text-slate-800 dark:text-slate-100">{opt}</span>
            {showState && isCorrect && <span className="text-green-600 dark:text-green-400 text-sm font-medium shrink-0">✓ Correta</span>}
            {showState && isSelected && !isCorrect && <span className="text-red-600 dark:text-red-400 text-sm font-medium shrink-0">✕</span>}
          </motion.button>
        )
      })}

      <AnimatePresence>
        {selected !== null && question.explanation && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-slate-500 dark:text-slate-400 pt-2 leading-relaxed"
          >
            {question.explanation}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function DissertativaBody({ question, revealed, onReveal, onSelfCheck }) {
  const [draft, setDraft] = useState(() => getDraft(question.id))

  useEffect(() => {
    setDraft(getDraft(question.id))
  }, [question.id])

  function handleChange(e) {
    const value = e.target.value
    setDraft(value)
    saveDraft(question.id, value)
  }

  return (
    <div>
      {!revealed && (
        <div>
          <label htmlFor={`answer-${question.id}`} className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Sua resposta
          </label>
          <textarea
            id={`answer-${question.id}`}
            value={draft}
            onChange={handleChange}
            rows={5}
            placeholder="Escreva sua resposta antes de ver o gabarito..."
            className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-800 dark:text-slate-100 focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none resize-y mb-3"
          />
          <button
            onClick={onReveal}
            className="px-4 py-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Ver gabarito
          </button>
        </div>
      )}

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Sua resposta</p>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {draft || <span className="text-slate-400 dark:text-slate-500 italic">Nenhuma resposta escrita</span>}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-4">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1.5">Resposta modelo</p>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{question.answer}</p>
              </div>
            </div>

            {revealed !== 'done' && (
              <div className="flex gap-2.5">
                <button
                  onClick={() => onSelfCheck(true)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer"
                >
                  Acertei
                </button>
                <button
                  onClick={() => onSelfCheck(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Errei
                </button>
              </div>
            )}
            {revealed === 'done' && (
              <p className="text-sm text-slate-500 dark:text-slate-400">Resposta registrada.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
