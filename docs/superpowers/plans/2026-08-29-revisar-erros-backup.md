# Revisar Erros + Backup de Progresso Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-subject "review my mistakes" quiz mode and a JSON export/import for progress data, so nothing studied is lost if the browser's localStorage is ever cleared and wrong answers can be revisited deliberately.

**Architecture:** Two independent, additive features built on the existing `src/lib/progress.js` localStorage layer. Feature 1 (revisar erros) adds a wrong-answer-id set alongside the existing answered-id set, a resolver that turns those ids into question objects, and reuses the existing generic `QuizScreen` component by feeding it a filtered question list instead of a fase's questions. Feature 2 (backup) adds pure export/import functions that serialize/restore all `medi-quiz-*` localStorage keys as one JSON blob, wired to a small new component with a download link and a file input.

**Tech Stack:** React 19, Vite 8, Vitest (new devDependency, shares `vite.config.js`), no DOM/jsdom needed since `progress.js` only touches `localStorage` and `JSON`.

**Spec:** None — this is a bounded task. The design was agreed in chat (brainstorming skill, bounded path): user asked for more app ideas, was offered a list, picked "revisar erros" mode and export/import of progress as the two worth building now, then said "pode implementar tudo que achar necessario e que vai agregar" (implement what you judge necessary and valuable) — read as approval of the two recommended items, not the full brainstormed list (achievements, timed exam mode, stats dashboard, personalized greeting stay unbuilt — YAGNI, not requested again after the initial list).

## Global Constraints

- Every new/changed `.js`/`.jsx` file must pass `npm run build` and `npm run lint` (oxlint) with no new errors — same bar used throughout this project's history.
- Test the logic layer (`src/lib/progress.js`) with Vitest, TDD-style (failing test → implementation → passing test) — this is the first test suite in the project; keep it scoped to `progress.js`'s new/changed exports, not a retrofit of the whole codebase.
- UI wiring (React components) is verified the way every other feature in this project has been verified: `npm run build`, `npm run lint`, then a real check in the Browser pane (console errors, click-through, screenshot) — no component-test framework is being introduced for this plan.
- Match existing code style: no semicolons, single quotes, 2-space indent, Tailwind utility classes only (no new CSS files), dark-mode variants (`dark:`) on every new visible element, `cursor-pointer` on every clickable element — copy the patterns already in `TopicScreen.jsx` and `App.jsx`'s `ThemeToggle`.
- Don't touch `HospitalHero.jsx`, `QuizScreen.jsx`'s internals, `data/questions.js`, or `data/topics.js` — out of scope for this plan.

---

### Task 1: Vitest setup + wrong-answer tracking in `progress.js` (TDD)

**Files:**
- Modify: `package.json` (add `vitest` devDependency, add `"test": "vitest run"` script)
- Modify: `vite.config.js` (add `test` block)
- Create: `src/lib/progress.test.js`
- Modify: `src/lib/progress.js:1-5` (add `WRONG_KEY` constant), `src/lib/progress.js:24-36` (`recordAnswer` body)

**Interfaces:**
- Consumes: nothing new (only existing `readJSON`, `localStorage` inside `progress.js`)
- Produces: `export function getWrongIds(subjectId): string[]` — later tasks (Task 2's `getWrongQuestions`, Task 3's `TopicScreen`) call this by exact name.

- [ ] **Step 1: Install Vitest**

```bash
cd /c/Users/ribass/projects/medi-quiz
npm install -D vitest
```

- [ ] **Step 2: Add the `test` script to `package.json`**

In `package.json`, the `"scripts"` block currently reads:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
```

Change it to:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview",
    "test": "vitest run"
  },
```

- [ ] **Step 3: Add a `test` block to `vite.config.js`**

Current full file:

```js
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Replace with:

```js
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    globals: true,
  },
})
```

(`environment: 'node'` is enough — `progress.js` never touches the DOM, only `localStorage`, which the test file mocks itself. `globals: true` lets test files use `describe`/`it`/`expect`/`beforeEach` without importing them.)

- [ ] **Step 4: Write the failing tests**

Create `src/lib/progress.test.js`:

```js
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
```

- [ ] **Step 5: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `getWrongIds is not a function` (or similar import error), since `progress.js` doesn't export it yet.

- [ ] **Step 6: Implement `getWrongIds` and wire it into `recordAnswer`**

In `src/lib/progress.js`, the top of the file currently reads:

```js
const KEY = 'medi-quiz-progress'
const XP_KEY = 'medi-quiz-xp'
const STREAK_KEY = 'medi-quiz-streak'
const DRAFTS_KEY = 'medi-quiz-drafts'
const ANSWERED_KEY = 'medi-quiz-answered'
```

Add a fifth key:

```js
const KEY = 'medi-quiz-progress'
const XP_KEY = 'medi-quiz-xp'
const STREAK_KEY = 'medi-quiz-streak'
const DRAFTS_KEY = 'medi-quiz-drafts'
const ANSWERED_KEY = 'medi-quiz-answered'
const WRONG_KEY = 'medi-quiz-wrong'
```

The current `recordAnswer` and `markAnswered` read:

```js
export function recordAnswer(subjectId, questionId, wasCorrect) {
  const all = readAll()
  const stats = all[subjectId] || { correct: 0, wrong: 0 }
  if (wasCorrect) stats.correct += 1
  else stats.wrong += 1
  all[subjectId] = stats
  localStorage.setItem(KEY, JSON.stringify(all))

  markAnswered(subjectId, questionId)

  if (wasCorrect) addXP(10)
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
```

Replace that whole block with:

```js
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
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all 3 tests in `wrong-answer tracking` green.

- [ ] **Step 8: Commit**

```bash
cd /c/Users/ribass/projects/medi-quiz
git add package.json package-lock.json vite.config.js src/lib/progress.js src/lib/progress.test.js
git commit -m "feat: track wrong-answer ids in progress.js, add Vitest"
```

---

### Task 2: `getWrongQuestions` resolver + export/import (TDD)

**Files:**
- Modify: `src/lib/progress.test.js` (append test cases)
- Modify: `src/lib/progress.js` (append `getWrongQuestions`, `exportProgress`, `importProgress`)

**Interfaces:**
- Consumes: `getWrongIds(subjectId)` from Task 1.
- Produces:
  - `export function getWrongQuestions(subjectId, allQuestions): Question[]` — Task 3's `App.jsx` calls this with the app's full `questions` array (each question object has at least `{ id, subject, ... }`, matching the shape already used everywhere else in this codebase, e.g. `data/questions.js`).
  - `export function exportProgress(): { version: 1, exportedAt: string, data: Record<string, unknown> }` — Task 4's `ProgressBackup.jsx` calls this with no arguments.
  - `export function importProgress(payload): boolean` — Task 4's `ProgressBackup.jsx` calls this with the parsed JSON from the uploaded file; returns `true` on success, `false` if `payload` is missing or malformed (no `data` field).

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/progress.test.js` (after the existing `describe('wrong-answer tracking', ...)` block, same file, same imports — extend the import line at the top to also pull in the three new functions):

Change the top import line from:

```js
import { getWrongIds, recordAnswer } from './progress.js'
```

to:

```js
import { exportProgress, getWrongIds, getWrongQuestions, importProgress, recordAnswer } from './progress.js'
```

Then append at the end of the file:

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `getWrongQuestions`/`exportProgress`/`importProgress` are not exported yet.

- [ ] **Step 3: Implement the three functions**

Append to the end of `src/lib/progress.js`:

```js
export function getWrongQuestions(subjectId, allQuestions) {
  const wrongIds = getWrongIds(subjectId)
  return allQuestions.filter((q) => q.subject === subjectId && wrongIds.includes(q.id))
}

const BACKUP_KEYS = [KEY, XP_KEY, STREAK_KEY, DRAFTS_KEY, ANSWERED_KEY, WRONG_KEY]

export function exportProgress() {
  const data = {}
  for (const key of BACKUP_KEYS) {
    const raw = localStorage.getItem(key)
    if (raw !== null) data[key] = JSON.parse(raw)
  }
  return { version: 1, exportedAt: new Date().toISOString(), data }
}

export function importProgress(payload) {
  if (!payload || typeof payload !== 'object' || !payload.data) return false
  for (const key of BACKUP_KEYS) {
    if (key in payload.data) {
      localStorage.setItem(key, JSON.stringify(payload.data[key]))
    }
  }
  return true
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all tests in the file green (7 total across both `describe` blocks from Task 1 and Task 2).

- [ ] **Step 5: Commit**

```bash
cd /c/Users/ribass/projects/medi-quiz
git add src/lib/progress.js src/lib/progress.test.js
git commit -m "feat: add getWrongQuestions and progress export/import to progress.js"
```

---

### Task 3: "Revisar erros" screen wiring (TopicScreen banner + App.jsx routing)

**Files:**
- Modify: `src/components/TopicScreen.jsx` (whole file — add import, prop, banner)
- Modify: `src/App.jsx:1-53` (imports, state, screen derivation), `src/App.jsx:105-120` (`screen === 'topics'` block), add a new `screen === 'review'` block

**Interfaces:**
- Consumes: `getWrongIds(subjectId)` and `getWrongQuestions(subjectId, allQuestions)` from Task 1/Task 2.
- Produces: nothing consumed by later tasks (Task 4 is independent).

- [ ] **Step 1: Add the review banner to `TopicScreen.jsx`**

Full current file:

```jsx
import { motion } from 'framer-motion'
import { getFaseProgress } from '../lib/progress'

export default function TopicScreen({ subject, topics, onSelectTopic, onExit }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onExit}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer flex items-center gap-1"
        >
          ← Matérias
        </button>
        <span className="text-sm font-semibold" style={{ color: subject.color }}>
          {subject.name}
        </span>
      </div>

      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4 text-center">
        Escolha um tópico
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {topics.map((topic, index) => {
          const { answered, total } = getFaseProgress({ questions: topic.questions }, subject.id)
          const isDone = total > 0 && answered === total

          return (
            <motion.button
              key={topic.name}
              onClick={() => onSelectTopic(index)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="text-left w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600"
              style={{ borderColor: isDone ? subject.color : undefined }}
            >
              <div className="flex items-start justify-between gap-3">
                <motion.span
                  className="text-2xl inline-block"
                  aria-hidden="true"
                  whileHover={{ rotate: [0, -10, 10, -6, 0], scale: 1.15 }}
                  transition={{ duration: 0.5 }}
                >
                  {topic.icon}
                </motion.span>
                {isDone && (
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: subject.color }}
                  >
                    ✓ Completo
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                {topic.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {topic.questions.length} questões{answered > 0 ? ` · ${answered} respondidas` : ''}
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
```

Replace it entirely with:

```jsx
import { motion } from 'framer-motion'
import { getFaseProgress, getWrongIds } from '../lib/progress'

export default function TopicScreen({ subject, topics, onSelectTopic, onExit, onReviewErrors }) {
  const wrongCount = getWrongIds(subject.id).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onExit}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer flex items-center gap-1"
        >
          ← Matérias
        </button>
        <span className="text-sm font-semibold" style={{ color: subject.color }}>
          {subject.name}
        </span>
      </div>

      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4 text-center">
        Escolha um tópico
      </h2>

      {wrongCount > 0 && (
        <motion.button
          onClick={onReviewErrors}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mb-6 rounded-2xl border-2 border-dashed p-4 flex items-center justify-between gap-3 cursor-pointer transition-colors"
          style={{ borderColor: subject.color }}
        >
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            🔁 Revisar {wrongCount} questõe{wrongCount === 1 ? '' : 's'} que você errou
          </span>
          <span className="text-sm font-semibold" style={{ color: subject.color }}>
            Revisar →
          </span>
        </motion.button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {topics.map((topic, index) => {
          const { answered, total } = getFaseProgress({ questions: topic.questions }, subject.id)
          const isDone = total > 0 && answered === total

          return (
            <motion.button
              key={topic.name}
              onClick={() => onSelectTopic(index)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="text-left w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600"
              style={{ borderColor: isDone ? subject.color : undefined }}
            >
              <div className="flex items-start justify-between gap-3">
                <motion.span
                  className="text-2xl inline-block"
                  aria-hidden="true"
                  whileHover={{ rotate: [0, -10, 10, -6, 0], scale: 1.15 }}
                  transition={{ duration: 0.5 }}
                >
                  {topic.icon}
                </motion.span>
                {isDone && (
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: subject.color }}
                  >
                    ✓ Completo
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                {topic.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {topic.questions.length} questões{answered > 0 ? ` · ${answered} respondidas` : ''}
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire routing in `App.jsx`**

Change the import line (currently line 8):

```js
import { getSubjectStats, getXP, getStreak } from './lib/progress'
```

to:

```js
import { getSubjectStats, getWrongQuestions, getXP, getStreak } from './lib/progress'
```

Change the state block (currently lines 21-24):

```js
  const [entered, setEntered] = useState(false)
  const [activeSubjectId, setActiveSubjectId] = useState(null)
  const [activeTopicIndex, setActiveTopicIndex] = useState(null)
  const [activeFaseIndex, setActiveFaseIndex] = useState(null)
```

to:

```js
  const [entered, setEntered] = useState(false)
  const [activeSubjectId, setActiveSubjectId] = useState(null)
  const [activeTopicIndex, setActiveTopicIndex] = useState(null)
  const [activeFaseIndex, setActiveFaseIndex] = useState(null)
  const [reviewing, setReviewing] = useState(false)
```

Change the screen-derivation block (currently lines 45-53):

```js
  const screen = !entered
    ? 'home'
    : activeTopic && activeFaseIndex !== null
      ? 'quiz'
      : activeTopic
        ? 'trilha'
        : activeSubject
          ? 'topics'
          : 'grid'
```

to:

```js
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
```

Add a new render block right after the existing `{screen === 'quiz' && ( ... )}` block (which currently ends at line 84 with `)}`) — insert this new block immediately after it, before `{screen === 'trilha' && (`:

```jsx
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
```

Finally, change the `screen === 'topics'` block (currently lines 105-120):

```jsx
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
          />
        </motion.div>
      )}
```

to:

```jsx
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
```

- [ ] **Step 3: Verify with build and lint**

Run: `npm run build`
Expected: succeeds, no new errors.

Run: `npm run lint`
Expected: only the pre-existing warnings already present before this task (currently: `SubjectCoverflow.jsx` missing-dep `goTo`, `QuizScreen.jsx` set-state-in-effect, `HospitalHero.jsx` missing-dep `enter`) — no new warnings from `TopicScreen.jsx` or `App.jsx`.

- [ ] **Step 4: Verify in the Browser pane**

1. Start/confirm the dev server is running (`medi-quiz` preview).
2. Navigate to the app, click through the intro to the subject grid, pick a subject, answer at least one question wrong (MCQ: pick the wrong option; dissertativa: click "Errei").
3. Go back to the topic screen for that subject (via the quiz's back button, then the trilha's back button).
4. Confirm the "🔁 Revisar N questões que você errou" banner appears above the topic grid, with `N` matching the number of questions just answered wrong.
5. Click it, confirm `QuizScreen` opens showing only that wrong question, with back label "← Tópicos".
6. Answer it correctly this time, exit back to the topic screen, confirm the banner disappears (count dropped to 0).
7. Check `read_console_messages` for errors — expect none.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/ribass/projects/medi-quiz
git add src/App.jsx src/components/TopicScreen.jsx
git commit -m "feat: adiciona modo revisar erros por materia"
```

---

### Task 4: Export/import progress UI (`ProgressBackup.jsx`)

**Files:**
- Create: `src/components/ProgressBackup.jsx`
- Modify: `src/App.jsx:1-18` (import), `src/App.jsx:183-201` (Hero's top-right badge row)

**Interfaces:**
- Consumes: `exportProgress()` and `importProgress(payload)` from Task 2.
- Produces: nothing consumed by later tasks (this is the last task).

- [ ] **Step 1: Create the component**

Create `src/components/ProgressBackup.jsx`:

```jsx
import { useRef } from 'react'
import { exportProgress, importProgress } from '../lib/progress'

export default function ProgressBackup() {
  const fileInputRef = useRef(null)

  function handleExport() {
    const payload = exportProgress()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medi-quiz-progresso-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const confirmed = window.confirm(
      'Isso vai substituir o progresso salvo neste navegador pelo conteúdo do arquivo. Continuar?'
    )
    if (!confirmed) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result)
        const ok = importProgress(payload)
        if (ok) {
          window.location.reload()
        } else {
          window.alert('Esse arquivo não parece ser um backup válido do Medi Quiz.')
        }
      } catch {
        window.alert('Não foi possível ler esse arquivo.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
      <button
        onClick={handleExport}
        aria-label="Exportar progresso"
        title="Exportar progresso"
        className="h-8 w-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
      >
        ⬇️
      </button>
      <button
        onClick={handleImportClick}
        aria-label="Importar progresso"
        title="Importar progresso"
        className="h-8 w-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
      >
        ⬆️
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )
}
```

- [ ] **Step 2: Wire it into `App.jsx`'s Hero**

Add the import (near the other component imports, e.g. right after the `HospitalHero` import on line 16):

```js
import ProgressBackup from './components/ProgressBackup'
```

In the `Hero()` function, the top-right badge row currently reads:

```jsx
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
        <ThemeToggle />
      </div>
```

Change it to:

```jsx
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
```

- [ ] **Step 3: Verify with build and lint**

Run: `npm run build`
Expected: succeeds, no new errors.

Run: `npm run lint`
Expected: same pre-existing warning set as Task 3's Step 3 — no new warnings from `ProgressBackup.jsx`.

- [ ] **Step 4: Verify in the Browser pane**

1. On the subject grid screen (after answering at least one question so XP/streak show), confirm two new small round buttons (⬇️ and ⬆️) appear left of the theme toggle.
2. Click ⬇️ (export) — a JSON file download should trigger (check `read_network_requests` or the download; the file should be named `medi-quiz-progresso-YYYY-MM-DD.json` and contain a `data` object with keys like `medi-quiz-xp`).
3. Click ⬆️ (import) — the hidden file input opens; select the file just downloaded.
4. Confirm the `window.confirm` dialog appears (accept it), then the page reloads and XP/streak are unchanged (since it's the same data re-imported).
5. As a destructive-round-trip check: note the current XP value, open dev tools/`javascript_tool` and run `localStorage.clear()`, reload, confirm XP shows 0 — then import the previously downloaded file again and confirm XP is restored to the noted value.
6. Check `read_console_messages` for errors — expect none.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/ribass/projects/medi-quiz
git add src/App.jsx src/components/ProgressBackup.jsx
git commit -m "feat: adiciona exportar/importar progresso em JSON"
```
