import { beforeEach, describe, expect, it } from 'vitest'
import { getWrongIds, getWrongQuestions, recordAnswer } from './progress.js'

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
