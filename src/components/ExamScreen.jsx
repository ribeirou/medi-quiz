import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import QuizScreen from './QuizScreen'

const PRESETS_MIN = [10, 20, 30]

export default function ExamScreen({ subject, questions, onExit }) {
  const [phase, setPhase] = useState('setup')
  const [minutes, setMinutes] = useState(null)
  const tally = useRef(new Map())
  const startedAt = useRef(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [results, setResults] = useState(null)

  function handleAnswer(wasCorrect, questionId) {
    tally.current.set(questionId, wasCorrect)
  }

  function handleStart() {
    tally.current = new Map()
    startedAt.current = Date.now()
    setPhase('running')
  }

  function handleExitRunning() {
    setElapsedSeconds(Math.round((Date.now() - startedAt.current) / 1000))
    const values = [...tally.current.values()]
    setResults({ correct: values.filter(Boolean).length, total: values.length })
    setPhase('results')
  }

  if (phase === 'setup') {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onExit}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer flex items-center gap-1"
          >
            ← Tópicos
          </button>
          <span className="text-sm font-semibold" style={{ color: subject.color }}>
            {subject.name}
          </span>
        </div>

        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 text-center">
          Prova cronometrada
        </h2>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {PRESETS_MIN.map((m) => (
            <button
              key={m}
              onClick={() => setMinutes(m)}
              className={`py-4 rounded-xl border-2 text-sm font-medium transition-colors cursor-pointer ${
                minutes === m
                  ? 'text-white'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              style={minutes === m ? { backgroundColor: subject.color, borderColor: subject.color } : undefined}
            >
              {m} min
            </button>
          ))}
        </div>

        <motion.button
          onClick={handleStart}
          disabled={minutes === null}
          whileHover={minutes === null ? {} : { scale: 1.02 }}
          whileTap={minutes === null ? {} : { scale: 0.97 }}
          className="w-full py-3 rounded-xl text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer"
          style={{ backgroundColor: subject.color }}
        >
          Começar prova
        </motion.button>
      </div>
    )
  }

  if (phase === 'running') {
    return (
      <QuizScreen
        subject={subject}
        questions={questions}
        timeLimitSeconds={minutes * 60}
        onAnswer={handleAnswer}
        onExit={handleExitRunning}
        backLabel="← Cancelar prova"
      />
    )
  }

  const minutesUsed = Math.floor(elapsedSeconds / 60)
  const secondsUsed = elapsedSeconds % 60

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Prova finalizada</h2>
      <p className="text-4xl font-bold mb-2" style={{ color: subject.color }}>
        {results.correct}/{results.total}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        corretas · {minutesUsed}min {secondsUsed}s
      </p>
      <motion.button
        onClick={onExit}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        className="px-5 py-2.5 rounded-lg text-white text-sm font-medium cursor-pointer"
        style={{ backgroundColor: subject.color }}
      >
        Voltar aos tópicos
      </motion.button>
    </div>
  )
}
