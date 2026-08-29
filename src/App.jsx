import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)
import { subjects, questions } from './data/questions'
import { getSubjectStats, getWrongQuestions, getXP, getStreak } from './lib/progress'
import { getTheme, setTheme } from './lib/theme'
import SubjectCoverflow from './components/SubjectCoverflow'
import ParticleField from './components/ParticleField'
import FloatingIcons from './components/FloatingIcons'
import TopicScreen from './components/TopicScreen'
import TrilhaScreen from './components/TrilhaScreen'
import QuizScreen from './components/QuizScreen'
import HospitalHero from './components/HospitalHero'
import ProgressBackup from './components/ProgressBackup'
import { getFases } from './lib/trilha'
import { getSubjectTopics } from './data/topics'

export default function App() {
  const [entered, setEntered] = useState(false)
  const [activeSubjectId, setActiveSubjectId] = useState(null)
  const [activeTopicIndex, setActiveTopicIndex] = useState(null)
  const [activeFaseIndex, setActiveFaseIndex] = useState(null)
  const [reviewing, setReviewing] = useState(false)

  const questionsBySubject = useMemo(() => {
    const map = {}
    for (const s of subjects) {
      map[s.id] = questions.filter((q) => q.subject === s.id)
    }
    return map
  }, [])

  const activeSubject = subjects.find((s) => s.id === activeSubjectId)
  const topics = useMemo(
    () => (activeSubject ? getSubjectTopics(activeSubject.id, questions) : []),
    [activeSubject]
  )
  const activeTopic = activeTopicIndex !== null ? topics[activeTopicIndex] : null
  const fases = useMemo(
    () => (activeTopic ? getFases(activeTopic.questions) : []),
    [activeTopic]
  )

  const reviewQuestions = useMemo(
    () => (reviewing && activeSubject ? getWrongQuestions(activeSubject.id, questions) : []),
    [reviewing, activeSubject]
  )

  const screen = !entered
    ? 'home'
    : reviewing
      ? 'review'
      : activeTopic && activeFaseIndex !== null
        ? 'quiz'
        : activeTopic
          ? 'trilha'
          : activeSubject
            ? 'topics'
            : 'grid'

  return (
    <AnimatePresence mode="wait">
      {screen === 'home' && (
        <motion.div
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <HospitalHero onEnter={() => setEntered(true)} />
        </motion.div>
      )}

      {screen === 'quiz' && (
        <motion.div
          key="quiz"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <QuizScreen
            subject={activeSubject}
            questions={fases[activeFaseIndex].questions}
            backLabel="← Fases"
            onExit={() => setActiveFaseIndex(null)}
          />
        </motion.div>
      )}

      {screen === 'review' && (
        <motion.div
          key="review"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <QuizScreen
            subject={activeSubject}
            questions={reviewQuestions}
            backLabel="← Tópicos"
            onExit={() => setReviewing(false)}
          />
        </motion.div>
      )}

      {screen === 'trilha' && (
        <motion.div
          key="trilha"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <TrilhaScreen
            subject={activeSubject}
            title={`${activeTopic.icon} ${activeTopic.name}`}
            backLabel="← Tópicos"
            fases={fases}
            onSelectFase={setActiveFaseIndex}
            onExit={() => setActiveTopicIndex(null)}
          />
        </motion.div>
      )}

      {screen === 'topics' && (
        <motion.div
          key="topics"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <TopicScreen
            subject={activeSubject}
            topics={topics}
            onSelectTopic={setActiveTopicIndex}
            onExit={() => setActiveSubjectId(null)}
            onReviewErrors={() => setReviewing(true)}
          />
        </motion.div>
      )}

      {screen === 'grid' && (
        <motion.div
          key="grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Hero />
          <main className="max-w-4xl mx-auto px-4 pb-16">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4 text-center">
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Hero() {
  const xp = getXP()
  const streak = getStreak()
  const titleRef = useRef(null)

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !titleRef.current) return

    const line1 = titleRef.current.querySelector('.hero-line1')
    const line2 = titleRef.current.querySelector('.hero-line2')
    const split = new SplitText(line1, { type: 'words' })

    const tl = gsap.timeline()
    tl.from(split.words, {
      opacity: 0,
      y: 20,
      rotateX: -40,
      duration: 0.6,
      stagger: 0.08,
      ease: 'expo.out',
    }).from(line2, { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out' }, '-=0.25')

    return () => {
      tl.kill()
      split.revert()
    }
  }, [])

  return (
    <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-800">
      <ParticleField />
      <FloatingIcons />
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {(xp > 0 || streak.count > 0) && (
          <>
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400 bg-white/80 dark:bg-slate-800/80 backdrop-blur px-2.5 py-1 rounded-full border border-orange-100 dark:border-orange-900/50 flex items-center gap-1">
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                🔥
              </motion.span>
              {streak.count}
            </span>
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
              {xp} XP
            </span>
          </>
        )}
        <ProgressBackup />
        <ThemeToggle />
      </div>
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-14 text-center">
        <h1
          ref={titleRef}
          className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight"
        >
          <span className="hero-line1">Revisão por matéria,</span>
          <br className="hidden sm:block" />{' '}
          <span
            className="hero-line2 animate-gradient-text bg-clip-text text-transparent inline-block"
            style={{ backgroundImage: 'linear-gradient(90deg, #2563eb, #7c3aed, #2563eb)' }}
          >
            no seu ritmo
          </span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 text-slate-500 dark:text-slate-400 max-w-md mx-auto"
        >
          Escolha uma matéria e responda questões de múltipla escolha e dissertativas com gabarito na hora.
        </motion.p>
      </div>
    </section>
  )
}

function ThemeToggle() {
  const [theme, setThemeState] = useState(getTheme)

  useEffect(() => {
    setTheme(theme)
  }, [theme])

  return (
    <button
      onClick={() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))}
      aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className="h-8 w-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
