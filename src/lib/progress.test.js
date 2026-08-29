import { beforeEach, describe, expect, it } from 'vitest'
import { getDueQuestions, getWrongIds, getWrongQuestions, recordAnswer } from './progress.js'

function createLocalStorageMock() {
  let store = {}
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value)
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
}

beforeEach(() => {
  globalThis.localStorage = createLocalStorageMock()
})

describe('wrong-answer tracking', () => {
  it('adds a question id to the wrong list when answered incorrectly', () => {
    recordAnswer('anatomia', 'anat-1', false)
    expect(getWrongIds('anatomia')).toEqual(['anat-1'])
  })

  it('does not add a question id to the wrong list when answered correctly', () => {
    recordAnswer('anatomia', 'anat-1', true)
    expect(getWrongIds('anatomia')).toEqual([])
  })

  it('removes a question id from the wrong list once answered correctly', () => {
    recordAnswer('anatomia', 'anat-1', false)
    recordAnswer('anatomia', 'anat-1', true)
    expect(getWrongIds('anatomia')).toEqual([])
  })
})

describe('getWrongQuestions', () => {
  const allQuestions = [
    { id: 'anat-1', subject: 'anatomia', question: 'Q1' },
    { id: 'anat-2', subject: 'anatomia', question: 'Q2' },
    { id: 'histo-1', subject: 'histologia', question: 'Q3' },
  ]

  it('resolves wrong ids to full question objects for that subject only', () => {
    recordAnswer('anatomia', 'anat-1', false)
    recordAnswer('histologia', 'histo-1', false)

    const result = getWrongQuestions('anatomia', allQuestions)

    expect(result).toEqual([{ id: 'anat-1', subject: 'anatomia', question: 'Q1' }])
  })

  it('returns an empty array when there are no wrong answers for the subject', () => {
    expect(getWrongQuestions('anatomia', allQuestions)).toEqual([])
  })
})

describe('spaced repetition (SRS)', () => {
  const allQuestions = [
    { id: 'anat-1', subject: 'anatomia', question: 'Q1' },
    { id: 'histo-1', subject: 'histologia', question: 'Q2' },
  ]

  it('sets intervalIndex to 0 when answered incorrectly', () => {
    recordAnswer('anatomia', 'anat-1', false)
    const srs = JSON.parse(localStorage.getItem('medi-quiz-srs'))
    expect(srs['anat-1'].intervalIndex).toBe(0)
  })

  it('advances intervalIndex on consecutive correct answers, capped at the last rung', () => {
    recordAnswer('anatomia', 'anat-1', true)
    let srs = JSON.parse(localStorage.getItem('medi-quiz-srs'))
    expect(srs['anat-1'].intervalIndex).toBe(0)

    recordAnswer('anatomia', 'anat-1', true)
    srs = JSON.parse(localStorage.getItem('medi-quiz-srs'))
    expect(srs['anat-1'].intervalIndex).toBe(1)

    for (let i = 0; i < 10; i++) recordAnswer('anatomia', 'anat-1', true)
    srs = JSON.parse(localStorage.getItem('medi-quiz-srs'))
    expect(srs['anat-1'].intervalIndex).toBe(4)
  })

  it('resets intervalIndex to 0 after a wrong answer following a correct streak', () => {
    recordAnswer('anatomia', 'anat-1', true)
    recordAnswer('anatomia', 'anat-1', true)
    recordAnswer('anatomia', 'anat-1', false)
    const srs = JSON.parse(localStorage.getItem('medi-quiz-srs'))
    expect(srs['anat-1'].intervalIndex).toBe(0)
  })

  it('getDueQuestions excludes questions never answered', () => {
    expect(getDueQuestions(allQuestions)).toEqual([])
  })

  it('getDueQuestions excludes answered questions whose dueDate is in the future', () => {
    recordAnswer('anatomia', 'anat-1', true)
    expect(getDueQuestions(allQuestions)).toEqual([])
  })

  it('getDueQuestions includes answered questions whose dueDate has passed', () => {
    recordAnswer('anatomia', 'anat-1', true)
    const srs = JSON.parse(localStorage.getItem('medi-quiz-srs'))
    srs['anat-1'].dueDate = '2000-01-01'
    localStorage.setItem('medi-quiz-srs', JSON.stringify(srs))

    expect(getDueQuestions(allQuestions)).toEqual([allQuestions[0]])
  })
})
