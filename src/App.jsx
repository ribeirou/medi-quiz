import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { subjects, questions } from './data/questions'
import { getSubjectStats, getXP, getStreak } from './lib/progress'
import SubjectCoverflow from './components/SubjectCoverflow'
import TrilhaScreen from './components/TrilhaScreen'
import QuizScreen from './components/QuizScreen'
import { getFases } from './lib/trilha'

export default function App() {
  const [activeSubjectId, setActiveSubjectId] = useState(null)
  const [activeFaseIndex, setActiveFaseIndex] = useState(null)

  const questionsBySubject = useMemo(() => {
    const map = {}
    for (const s of subjects) {
      map[s.id] = questions.filter((q) => q.subject === s.id)
    }
    return map
  }, [])

  const activeSubject = subjects.find((s) => s.id === activeSubjectId)
  const fases = useMemo(
    () => (activeSubject ? getFases(questionsBySubject[activeSubject.id]) : []),
    [activeSubject, questionsBySubject]
  )

  if (activeSubject && activeFaseIndex !== null) {
    return (
      <QuizScreen
        subject={activeSubject}
        questions={fases[activeFaseIndex].questions}
        backLabel="← Fases"
        onExit={() => setActiveFaseIndex(null)}
      />
    )
  }

  if (activeSubject) {
    return (
      <TrilhaScreen
        subject={activeSubject}
        fases={fases}
        onSelectFase={setActiveFaseIndex}
        onExit={() => setActiveSubjectId(null)}
      />
    )
  }

  return (
    <div>
      <Hero />
      <main className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 text-center">
          Escolha uma matéria
        </h2>
        <SubjectCoverflow
          items={subjects.map((s) => ({
            subject: s,
            stats: getSubjectStats(s.id),
            questionCount: questionsBySubject[s.id].length,
          }))}
          onSelect={setActiveSubjectId}
        />
      </main>
    </div>
  )
}

function Hero() {
  const xp = getXP()
  const streak = getStreak()

  return (
    <section className="relative overflow-hidden border-b border-slate-100">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(circle at 20% 20%, #dbeafe 0%, transparent 45%), radial-gradient(circle at 80% 0%, #ede9fe 0%, transparent 40%)',
        }}
        aria-hidden="true"
      />
      {(xp > 0 || streak.count > 0) && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-sm font-medium text-orange-600 bg-white/80 backdrop-blur px-2.5 py-1 rounded-full border border-orange-100">
            🔥 {streak.count}
          </span>
          <span className="text-sm font-semibold text-blue-700 bg-white/80 backdrop-blur px-2.5 py-1 rounded-full border border-blue-100">
            {xp} XP
          </span>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-14 text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700 mb-4"
        >
          Medicina · USCS
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight"
        >
          Revisão por matéria,<br className="hidden sm:block" /> no seu ritmo
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 text-slate-500 max-w-md mx-auto"
        >
          Escolha uma matéria e responda questões de múltipla escolha e dissertativas com gabarito na hora.
        </motion.p>
      </div>
    </section>
  )
}
