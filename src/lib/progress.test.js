import { beforeEach, describe, expect, it } from 'vitest'
import { getWrongIds, recordAnswer } from './progress.js'

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
