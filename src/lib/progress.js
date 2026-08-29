const KEY = 'medi-quiz-progress'
const XP_KEY = 'medi-quiz-xp'
const STREAK_KEY = 'medi-quiz-streak'
const DRAFTS_KEY = 'medi-quiz-drafts'
const ANSWERED_KEY = 'medi-quiz-answered'
const WRONG_KEY = 'medi-quiz-wrong'

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function readAll() {
  return readJSON(KEY, {})
}

export function getSubjectStats(subjectId) {
  const all = readAll()
  return all[subjectId] || { correct: 0, wrong: 0 }
}

export function recordAnswer(subjectId, questionId, wasCorrect) {
  const all = readAll()
  const stats = all[subjectId] || { correct: 0, wrong: 0 }
  if (wasCorrect) stats.correct += 1
  else stats.wrong += 1
  all[subjectId] = stats
  localStorage.setItem(KEY, JSON.stringify(all))

  markAnswered(subjectId, questionId)

  if (wasCorrect) {
    unmarkWrong(subjectId, questionId)
    addXP(10)
  } else {
    markWrong(subjectId, questionId)
  }
  bumpStreak()
}

function markAnswered(subjectId, questionId) {
  const all = readJSON(ANSWERED_KEY, {})
  const ids = all[subjectId] || []
  if (!ids.includes(questionId)) ids.push(questionId)
  all[subjectId] = ids
  localStorage.setItem(ANSWERED_KEY, JSON.stringify(all))
}

export function getAnsweredIds(subjectId) {
  const all = readJSON(ANSWERED_KEY, {})
  return all[subjectId] || []
}

function markWrong(subjectId, questionId) {
  const all = readJSON(WRONG_KEY, {})
  const ids = all[subjectId] || []
  if (!ids.includes(questionId)) ids.push(questionId)
  all[subjectId] = ids
  localStorage.setItem(WRONG_KEY, JSON.stringify(all))
}

function unmarkWrong(subjectId, questionId) {
  const all = readJSON(WRONG_KEY, {})
  const ids = all[subjectId] || []
  all[subjectId] = ids.filter((id) => id !== questionId)
  localStorage.setItem(WRONG_KEY, JSON.stringify(all))
}

export function getWrongIds(subjectId) {
  const all = readJSON(WRONG_KEY, {})
  return all[subjectId] || []
}

export function getFaseProgress(fase, subjectId) {
  const answeredIds = getAnsweredIds(subjectId)
  const answered = fase.questions.filter((q) => answeredIds.includes(q.id)).length
  return { answered, total: fase.questions.length }
}

export function getXP() {
  return readJSON(XP_KEY, 0)
}

function addXP(amount) {
  const xp = getXP() + amount
  localStorage.setItem(XP_KEY, JSON.stringify(xp))
  return xp
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function getStreak() {
  return readJSON(STREAK_KEY, { count: 0, lastDate: null })
}

function bumpStreak() {
  const today = todayStr()
  const { count, lastDate } = getStreak()
  if (lastDate === today) return
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const next = lastDate === yesterday ? count + 1 : 1
  localStorage.setItem(STREAK_KEY, JSON.stringify({ count: next, lastDate: today }))
}

export function getDraft(questionId) {
  const drafts = readJSON(DRAFTS_KEY, {})
  return drafts[questionId] || ''
}

export function saveDraft(questionId, text) {
  const drafts = readJSON(DRAFTS_KEY, {})
  drafts[questionId] = text
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
}
