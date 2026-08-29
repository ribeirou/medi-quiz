import { beforeEach, describe, expect, it } from 'vitest'
import { exportProgress, getWrongIds, getWrongQuestions, importProgress, recordAnswer } from './progress.js'

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

describe('exportProgress / importProgress', () => {
  it('exports the xp value under data.medi-quiz-xp', () => {
    recordAnswer('anatomia', 'anat-1', true)

    const payload = exportProgress()

    expect(payload.version).toBe(1)
    expect(payload.data['medi-quiz-xp']).toBe(10)
  })

  it('round-trips: importing a previously exported payload restores the xp value', () => {
    recordAnswer('anatomia', 'anat-1', true)
    const payload = exportProgress()

    globalThis.localStorage.clear()
    expect(getWrongIds('anatomia')).toEqual([])

    const ok = importProgress(payload)

    expect(ok).toBe(true)
    expect(JSON.parse(globalThis.localStorage.getItem('medi-quiz-xp'))).toBe(10)
  })

  it('rejects a payload with no data field', () => {
    expect(importProgress({ version: 1 })).toBe(false)
    expect(importProgress(null)).toBe(false)
  })
})
