# App Completo (Progresso, PWA, Prova Cronometrada, Revisão Espaçada) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar o medi-quiz mais completo com 4 features independentes: tela de progresso/analytics, instalabilidade PWA, prova cronometrada e revisão espaçada (SM-2 simplificado).

**Architecture:** Cada feature é aditiva sobre o app existente (React 19 + Vite + Tailwind v4 + Framer Motion + GSAP + canvas-confetti, sem backend, tudo em `localStorage` via `src/lib/progress.js`). `QuizScreen.jsx` recebe duas extensões de props (multi-matéria e cronômetro) reaproveitadas por Prova Cronometrada e Revisão Espaçada em vez de duplicar a UI de pergunta.

**Tech Stack:** React 19, Vite 8, Tailwind v4, Framer Motion, GSAP, canvas-confetti, Vitest (testes de `progress.js`). Ícones PWA gerados com um script Node usando só `node:zlib`/`node:fs` (sem dependência nova, sem ferramenta externa de imagem).

**Spec:** `docs/superpowers/specs/2026-08-29-app-completo-design.md`

## Global Constraints

- Sem backend/autenticação — tudo em `localStorage`, mesmo padrão de `src/lib/progress.js` (chave `medi-quiz-*`, `readJSON` com fallback).
- Sem novas dependências npm (nada de lib de gráfico, nada de `vite-plugin-pwa`, nada de lib de rasterização de imagem).
- Estilo do código: sem ponto-e-vírgula, aspas simples, indent 2 espaços, Tailwind utility-only, `dark:` em todo elemento visível, `cursor-pointer` em todo clicável.
- Toda tarefa passa `npm run build`, `npm run lint` (oxlint) e `npm test` (Vitest) sem novo erro/warning antes de ser considerada pronta.
- Lógica nova em `src/lib/progress.js` precisa de teste unitário TDD em `src/lib/progress.test.js` (Vitest já configurado em `vite.config.js`, mock de `localStorage` já existe no topo do arquivo de teste).
- Componentes React não têm suíte de teste própria neste projeto (só `progress.js` é testado) — verificação de UI é build + lint + checagem visual manual, consistente com o padrão já estabelecido.

---

### Task 1: Tela de progresso/analytics (StatsScreen)

**Files:**
- Create: `src/components/StatsScreen.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `getSubjectStats(subjectId)` de `src/lib/progress.js` (já existe, retorna `{correct, wrong}`), `subjects` array de `src/data/questions.js` (formato `{id, name, color}`).
- Produces: componente `StatsScreen({ subjects, onExit })`; estado `viewingStats` e tela `screen === 'stats'` em `App.jsx`, reutilizados por nenhuma tarefa futura.

- [ ] **Step 1: Criar `StatsScreen.jsx`**

```jsx
import { motion } from 'framer-motion'
import { getSubjectStats } from '../lib/progress'

export default function StatsScreen({ subjects, onExit }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onExit}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer flex items-center gap-1"
        >
          ← Início
        </button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Seu progresso
        </span>
      </div>

      <div className="space-y-5">
        {subjects.map((subject, i) => {
          const { correct, wrong } = getSubjectStats(subject.id)
          const total = correct + wrong
          const pct = total > 0 ? Math.round((100 * correct) / total) : 0

          return (
            <div key={subject.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {subject.name}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {pct}% · {correct}/{total} respondidas
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: subject.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Importar `StatsScreen` em `App.jsx`**

No topo de `src/App.jsx`, junto dos outros imports de componente (depois de `import QuizScreen from './components/QuizScreen'`):

```js
import StatsScreen from './components/StatsScreen'
```

- [ ] **Step 3: Adicionar estado `viewingStats`**

Em `src/App.jsx`, logo abaixo de `const [reviewing, setReviewing] = useState(false)`:

```js
const [viewingStats, setViewingStats] = useState(false)
```

- [ ] **Step 4: Adicionar `'stats'` à derivação de `screen`**

Substituir o bloco atual:

```js
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

por:

```js
  const screen = !entered
    ? 'home'
    : viewingStats
      ? 'stats'
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

- [ ] **Step 5: Adicionar o branch de renderização `'stats'`**

Em `src/App.jsx`, logo depois do bloco `{screen === 'review' && (...)}` (antes do bloco `{screen === 'trilha' && (...)}`):

```jsx
      {screen === 'stats' && (
        <motion.div
          key="stats"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <StatsScreen subjects={subjects} onExit={() => setViewingStats(false)} />
        </motion.div>
      )}
```

- [ ] **Step 6: Passar `onOpenStats` pro `Hero` e adicionar o botão**

Trocar a chamada `<Hero />` (dentro do bloco `screen === 'grid'`) por:

```jsx
          <Hero onOpenStats={() => setViewingStats(true)} />
```

Trocar a assinatura da função `Hero()`:

```js
function Hero() {
```

por:

```js
function Hero({ onOpenStats }) {
```

Dentro do `Hero()`, no `<div className="absolute top-4 right-4 flex items-center gap-2">`, adicionar o botão de estatísticas logo antes de `<ThemeToggle />`:

```jsx
        <button
          onClick={onOpenStats}
          aria-label="Ver progresso"
          className="h-8 w-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
        >
          📊
        </button>
        <ThemeToggle />
```

(substitui a linha `<ThemeToggle />` isolada que já existia)

- [ ] **Step 7: Verificar**

```bash
npm run build
npm run lint
```

Ambos sem erro. Depois, com o dev server rodando, clicar no botão 📊 no canto superior direito da tela inicial de matérias, confirmar que a tela de progresso abre mostrando uma barra por matéria (0% se nunca respondida) e que "← Início" volta pra tela de matérias.

- [ ] **Step 8: Commit**

```bash
git add src/components/StatsScreen.jsx src/App.jsx
git commit -m "feat: tela de progresso com % de acerto por materia"
```

---

### Task 2: PWA instalável (manifest, ícones, service worker)

**Files:**
- Create: `scripts/generate-icons.mjs`
- Create: `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-512-maskable.png` (gerados pelo script acima)
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Modify: `index.html`
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: nada de tarefas anteriores.
- Produces: nada consumido por tarefas futuras (feature isolada).

- [ ] **Step 1: Criar o script gerador de ícones**

Cria `scripts/generate-icons.mjs` — desenha um círculo azul (#2563eb) com uma cruz branca (a "cruz médica azul"), sem nenhuma dependência além dos módulos nativos `node:zlib`/`node:fs` do Node (sem ImageMagick, sem canvas, sem lib de imagem):

```js
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

let crcTable
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c
    }
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw)

  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

function drawIcon(size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4)

  const cx = size / 2
  const cy = size / 2
  const r = maskable ? size * 0.42 : size * 0.47
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      const idx = (y * size + x) * 4
      if (dx * dx + dy * dy <= r * r) {
        rgba[idx] = 37
        rgba[idx + 1] = 99
        rgba[idx + 2] = 235
        rgba[idx + 3] = 255
      }
    }
  }

  const armThickness = size * 0.16
  const armLength = size * 0.5
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      const inVertical = Math.abs(dx) <= armThickness / 2 && Math.abs(dy) <= armLength / 2
      const inHorizontal = Math.abs(dy) <= armThickness / 2 && Math.abs(dx) <= armLength / 2
      if (inVertical || inHorizontal) {
        const idx = (y * size + x) * 4
        rgba[idx] = 255
        rgba[idx + 1] = 255
        rgba[idx + 2] = 255
        rgba[idx + 3] = 255
      }
    }
  }

  return encodePNG(size, size, rgba)
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', drawIcon(192))
writeFileSync('public/icons/icon-512.png', drawIcon(512))
writeFileSync('public/icons/icon-512-maskable.png', drawIcon(512, { maskable: true }))
console.log('icones gerados em public/icons/')
```

- [ ] **Step 2: Rodar o script e conferir os arquivos**

```bash
node scripts/generate-icons.mjs
ls -la public/icons/
```

Esperado: 3 arquivos `.png` com tamanho > 0 bytes (`icon-192.png`, `icon-512.png`, `icon-512-maskable.png`).

- [ ] **Step 3: Criar `public/manifest.json`**

```json
{
  "name": "Medi Quiz",
  "short_name": "Medi Quiz",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#2563eb",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- [ ] **Step 4: Criar `public/sw.js`**

Service worker mínimo, sem cache (o app exige internet pra abrir — isso é intencional, evita ficar preso numa versão antiga):

```js
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
```

- [ ] **Step 5: Atualizar `index.html`**

Trocar:

```html
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

por:

```html
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#2563eb" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

- [ ] **Step 6: Registrar o service worker em `src/main.jsx`**

Trocar:

```js
initTheme()

createRoot(document.getElementById('root')).render(
```

por:

```js
initTheme()

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}

createRoot(document.getElementById('root')).render(
```

- [ ] **Step 7: Verificar**

```bash
npm run build
npm run lint
```

Ambos sem erro. Depois, com o dev server rodando: abrir `/manifest.json` direto no navegador e confirmar que o JSON carrega; abrir o DevTools → Application → Manifest e conferir que os 3 ícones aparecem sem erro de carregamento; confirmar em Application → Service Workers que `sw.js` está registrado e ativo.

- [ ] **Step 8: Commit**

```bash
git add scripts/generate-icons.mjs public/icons public/manifest.json public/sw.js index.html src/main.jsx
git commit -m "feat: pwa instalavel (manifest, icones, service worker sem cache)"
```

---

### Task 3: Revisão espaçada — lógica SM-2 simplificada em `progress.js` (TDD)

**Files:**
- Modify: `src/lib/progress.js`
- Modify: `src/lib/progress.test.js`

**Interfaces:**
- Consumes: `readJSON`, `todayStr`, `recordAnswer` (já existem em `progress.js`).
- Produces: `getDueQuestions(allQuestions)` — função exportada, recebe array de questões `{id, subject, ...}` e retorna o subconjunto já respondido pelo menos uma vez cuja `dueDate` (armazenada na chave `medi-quiz-srs`) já passou. Consumida pela Task 5.

- [ ] **Step 1: Escrever os testes que devem falhar**

Em `src/lib/progress.test.js`, trocar a linha de import:

```js
import { getWrongIds, getWrongQuestions, recordAnswer } from './progress.js'
```

por:

```js
import { getDueQuestions, getWrongIds, getWrongQuestions, recordAnswer } from './progress.js'
```

E adicionar, no final do arquivo, este novo bloco:

```js

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
```

- [ ] **Step 2: Rodar e confirmar que falha**

```bash
npm test
```

Esperado: FAIL — `getDueQuestions` não é exportado por `progress.js` ainda (erro de import ou `undefined is not a function`).

- [ ] **Step 3: Implementar em `progress.js`**

Adicionar as duas novas chaves logo abaixo de `const WRONG_KEY = 'medi-quiz-wrong'`:

```js
const SRS_KEY = 'medi-quiz-srs'
const SRS_INTERVALS_DAYS = [1, 3, 7, 16, 35]
```

Dentro de `recordAnswer`, adicionar a chamada de `updateSRS` logo antes de `bumpStreak()`:

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
  updateSRS(questionId, wasCorrect)
  bumpStreak()
}
```

Adicionar as duas novas funções no final do arquivo:

```js
function updateSRS(questionId, wasCorrect) {
  const all = readJSON(SRS_KEY, {})
  const card = all[questionId] || { intervalIndex: -1 }
  card.intervalIndex = wasCorrect
    ? Math.min(card.intervalIndex + 1, SRS_INTERVALS_DAYS.length - 1)
    : 0
  const days = SRS_INTERVALS_DAYS[card.intervalIndex]
  const dueDate = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)
  all[questionId] = { intervalIndex: card.intervalIndex, dueDate }
  localStorage.setItem(SRS_KEY, JSON.stringify(all))
}

export function getDueQuestions(allQuestions) {
  const all = readJSON(SRS_KEY, {})
  const today = todayStr()
  return allQuestions.filter((q) => all[q.id] && all[q.id].dueDate <= today)
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

```bash
npm test
```

Esperado: PASS em todos os testes, incluindo os 5 novos e os 5 já existentes (nenhuma regressão).

- [ ] **Step 5: Commit**

```bash
git add src/lib/progress.js src/lib/progress.test.js
git commit -m "feat: logica de revisao espacada (SM-2 simplificado) em progress.js"
```

---

### Task 4: `QuizScreen` — suportar questões de múltiplas matérias

**Files:**
- Modify: `src/components/QuizScreen.jsx`

**Interfaces:**
- Consumes: nada de tarefas anteriores.
- Produces: `QuizScreen` aceita agora um prop opcional `subjects` (array `{id, color, ...}`) como alternativa a `subject` — quando `subjects` é passado, a matéria de cada questão é resolvida via `question.subject`. Consumido pela Task 5 (revisão espaçada, matérias misturadas). O prop `subject` singular continua funcionando exatamente como antes para os call sites existentes (`quiz`, `review`).

- [ ] **Step 1: Trocar a assinatura da função**

Trocar:

```js
export default function QuizScreen({ subject, questions, onExit, backLabel = '← Matérias' }) {
```

por:

```js
export default function QuizScreen({ subject, subjects, questions, onExit, backLabel = '← Matérias' }) {
```

- [ ] **Step 2: Resolver a matéria ativa por questão**

Logo depois de `const question = questions[index]`, adicionar:

```js
  const activeSubject = subject || subjects.find((s) => s.id === question.subject)
```

- [ ] **Step 3: Trocar todos os usos de `subject` (bare) por `activeSubject`**

Dentro do corpo de `QuizScreen` (não em `McqBody`/`DissertativaBody`, que não recebem `subject`), trocar cada ocorrência:

Em `handleFinish`:
```js
    const answeredIds = getAnsweredIds(subject.id)
```
por
```js
    const answeredIds = getAnsweredIds(activeSubject.id)
```
e
```js
        colors: [subject.color, '#ffffff', '#facc15'],
```
por
```js
        colors: [activeSubject.color, '#ffffff', '#facc15'],
```

Em `handleMcqSelect`:
```js
    recordAnswer(subject.id, question.id, wasCorrect)
```
por
```js
    recordAnswer(activeSubject.id, question.id, wasCorrect)
```

Em `handleSelfCheck`:
```js
    recordAnswer(subject.id, question.id, wasCorrect)
```
por
```js
    recordAnswer(activeSubject.id, question.id, wasCorrect)
```

Na barra de progresso:
```js
          style={{ backgroundColor: subject.color }}
```
(a que tem `initial={false}` e `animate={{ width: ... }}` logo acima) por
```js
          style={{ backgroundColor: activeSubject.color }}
```

No badge "Múltipla escolha/Dissertativa":
```js
            style={{ backgroundColor: `${subject.color}1a`, color: subject.color }}
```
por
```js
            style={{ backgroundColor: `${activeSubject.color}1a`, color: activeSubject.color }}
```

No botão "Finalizar/Próxima":
```js
          style={{ backgroundColor: subject.color }}
```
(o último, dentro do `motion.button` de navegação) por
```js
          style={{ backgroundColor: activeSubject.color }}
```

- [ ] **Step 4: Verificar**

```bash
npm run build
npm run lint
npm test
```

Todos sem erro (nenhum teste de `progress.js` é afetado por essa mudança). Depois, com o dev server rodando, entrar numa matéria e completar uma fase de quiz normalmente (call site `subject` singular) — confirmar que cores, XP e finalização continuam idênticos a antes.

- [ ] **Step 5: Commit**

```bash
git add src/components/QuizScreen.jsx
git commit -m "refactor: QuizScreen aceita subjects[] pra questoes de materias mistas"
```

---

### Task 5: Wire da revisão espaçada em `App.jsx`

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `getDueQuestions(allQuestions)` (Task 3), `QuizScreen` com prop `subjects` (Task 4).
- Produces: nada consumido por tarefas futuras.

- [ ] **Step 1: Importar `getDueQuestions`**

Trocar:

```js
import { getSubjectStats, getWrongQuestions, getXP, getStreak } from './lib/progress'
```

por:

```js
import { getDueQuestions, getSubjectStats, getWrongQuestions, getXP, getStreak } from './lib/progress'
```

- [ ] **Step 2: Adicionar estado e a lista de questões devidas**

Logo abaixo de `const [viewingStats, setViewingStats] = useState(false)` (adicionado na Task 1):

```js
  const [reviewingSpaced, setReviewingSpaced] = useState(false)
```

Logo abaixo do bloco `const reviewQuestions = useMemo(...)`:

```js
  const dueQuestions = useMemo(() => getDueQuestions(questions), [])
```

- [ ] **Step 3: Adicionar `'srs'` à derivação de `screen`**

Trocar o bloco (já com `'stats'` da Task 1):

```js
  const screen = !entered
    ? 'home'
    : viewingStats
      ? 'stats'
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

por:

```js
  const screen = !entered
    ? 'home'
    : viewingStats
      ? 'stats'
      : reviewingSpaced
        ? 'srs'
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

- [ ] **Step 4: Adicionar o branch de renderização `'srs'`**

Logo depois do bloco `{screen === 'review' && (...)}` (antes do bloco `{screen === 'stats' && (...)}` da Task 1, ou depois — a ordem entre branches irmãos não importa):

```jsx
      {screen === 'srs' && (
        <motion.div
          key="srs"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <QuizScreen
            subjects={subjects}
            questions={dueQuestions}
            backLabel="← Início"
            onExit={() => setReviewingSpaced(false)}
          />
        </motion.div>
      )}
```

- [ ] **Step 5: Passar `dueCount`/`onOpenSpacedReview` pro `Hero` e adicionar o botão**

Trocar a chamada:

```jsx
          <Hero onOpenStats={() => setViewingStats(true)} />
```

por:

```jsx
          <Hero
            onOpenStats={() => setViewingStats(true)}
            onOpenSpacedReview={() => setReviewingSpaced(true)}
            dueCount={dueQuestions.length}
          />
```

Trocar a assinatura:

```js
function Hero({ onOpenStats }) {
```

por:

```js
function Hero({ onOpenStats, onOpenSpacedReview, dueCount }) {
```

Dentro do `Hero()`, no `<div className="absolute top-4 right-4 flex items-center gap-2">`, adicionar o botão de revisão espaçada como primeiro filho da div (antes do badge de XP/streak):

```jsx
        {dueCount > 0 && (
          <motion.button
            onClick={onOpenSpacedReview}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
          >
            🔁 Revisar hoje ({dueCount})
          </motion.button>
        )}
```

- [ ] **Step 6: Verificar**

```bash
npm run build
npm run lint
npm test
```

Todos sem erro. Depois, no navegador: responder pelo menos uma questão (correta ou errada) numa matéria, voltar pra tela inicial — o botão "🔁 Revisar hoje" não deve aparecer ainda (a questão só fica devida no dia seguinte). Pra testar visualmente o caminho "devida", abrir o DevTools → Application → Local Storage, editar a chave `medi-quiz-srs` trocando a `dueDate` da questão respondida pra uma data passada (ex: `"2020-01-01"`), recarregar a página — o botão deve aparecer com a contagem certa, e clicar nele deve abrir o quiz mostrando aquela questão com a cor da matéria correta.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx
git commit -m "feat: revisao espacada - botao Revisar hoje e tela srs"
```

---

### Task 6: `QuizScreen` — cronômetro e callback de resposta

**Files:**
- Modify: `src/components/QuizScreen.jsx`

**Interfaces:**
- Consumes: nada de tarefas anteriores (extensão independente da Task 4, mas no mesmo arquivo — deve rodar depois da Task 4 pra evitar conflito de merge).
- Produces: `QuizScreen` aceita dois novos props opcionais: `timeLimitSeconds` (number) — mostra cronômetro regressivo no cabeçalho e chama `onExit()` automaticamente ao chegar a 0; `onAnswer` (function `(wasCorrect: boolean) => void`) — chamado logo após cada resposta (MCQ ou autoavaliação dissertativa). Consumidos pela Task 7 (`ExamScreen`).

- [ ] **Step 1: Trocar a assinatura da função**

Trocar:

```js
export default function QuizScreen({ subject, subjects, questions, onExit, backLabel = '← Matérias' }) {
```

por:

```js
export default function QuizScreen({ subject, subjects, questions, onExit, backLabel = '← Matérias', timeLimitSeconds, onAnswer }) {
```

- [ ] **Step 2: Adicionar estado e efeito do cronômetro**

Logo abaixo de `const [xpPop, setXpPop] = useState(null)`, adicionar:

```js
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds ?? null)

  useEffect(() => {
    if (timeLimitSeconds == null) return
    if (timeLeft <= 0) {
      onExit()
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLimitSeconds, timeLeft, onExit])
```

- [ ] **Step 3: Chamar `onAnswer` nas duas funções de resposta**

Em `handleMcqSelect`, logo depois de `recordAnswer(activeSubject.id, question.id, wasCorrect)`:

```js
    onAnswer?.(wasCorrect)
```

Em `handleSelfCheck`, logo depois de `recordAnswer(activeSubject.id, question.id, wasCorrect)`:

```js
    onAnswer?.(wasCorrect)
```

- [ ] **Step 4: Mostrar o cronômetro no cabeçalho**

No cabeçalho, logo depois do `<span>` que mostra `{index + 1}/{questions.length}` (ainda dentro da mesma `<div className="flex items-center gap-3">`), adicionar:

```jsx
          {timeLimitSeconds != null && (
            <span className="text-sm font-medium text-red-500 dark:text-red-400">
              ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          )}
```

- [ ] **Step 5: Verificar**

```bash
npm run build
npm run lint
npm test
```

Todos sem erro (chamadas existentes de `QuizScreen` não passam `timeLimitSeconds`/`onAnswer`, então `timeLeft` fica `null` e o `useEffect` do cronômetro retorna cedo sem efeito — nenhuma regressão nos call sites existentes).

- [ ] **Step 6: Commit**

```bash
git add src/components/QuizScreen.jsx
git commit -m "feat: QuizScreen suporta cronometro regressivo e callback onAnswer"
```

---

### Task 7: Componente `ExamScreen` (prova cronometrada)

**Files:**
- Create: `src/components/ExamScreen.jsx`

**Interfaces:**
- Consumes: `QuizScreen` com props `subject`, `questions`, `timeLimitSeconds`, `onAnswer`, `onExit`, `backLabel` (Task 6).
- Produces: componente `ExamScreen({ subject, questions, onExit })`. Consumido pela Task 8.

- [ ] **Step 1: Criar `ExamScreen.jsx`**

```jsx
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import QuizScreen from './QuizScreen'

const PRESETS_MIN = [10, 20, 30]

export default function ExamScreen({ subject, questions, onExit }) {
  const [phase, setPhase] = useState('setup')
  const [minutes, setMinutes] = useState(null)
  const tally = useRef({ correct: 0, total: 0 })
  const startedAt = useRef(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  function handleAnswer(wasCorrect) {
    tally.current.total += 1
    if (wasCorrect) tally.current.correct += 1
  }

  function handleStart() {
    tally.current = { correct: 0, total: 0 }
    startedAt.current = Date.now()
    setPhase('running')
  }

  function handleExitRunning() {
    setElapsedSeconds(Math.round((Date.now() - startedAt.current) / 1000))
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

  const { correct, total } = tally.current
  const minutesUsed = Math.floor(elapsedSeconds / 60)
  const secondsUsed = elapsedSeconds % 60

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Prova finalizada</h2>
      <p className="text-4xl font-bold mb-2" style={{ color: subject.color }}>
        {correct}/{total}
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
```

- [ ] **Step 2: Verificar**

```bash
npm run build
npm run lint
```

Ambos sem erro (o componente ainda não está conectado a nada — a verificação funcional completa acontece na Task 8).

- [ ] **Step 3: Commit**

```bash
git add src/components/ExamScreen.jsx
git commit -m "feat: componente ExamScreen (setup, execucao, resultado)"
```

---

### Task 8: Wire da prova cronometrada em `TopicScreen` e `App.jsx`

**Files:**
- Modify: `src/components/TopicScreen.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `ExamScreen({ subject, questions, onExit })` (Task 7).
- Produces: nada consumido por tarefas futuras (última tarefa do plano).

- [ ] **Step 1: Adicionar o prop e o botão em `TopicScreen.jsx`**

Trocar:

```js
export default function TopicScreen({ subject, topics, onSelectTopic, onExit, onReviewErrors }) {
```

por:

```js
export default function TopicScreen({ subject, topics, onSelectTopic, onExit, onReviewErrors, onStartExam }) {
```

Logo depois do bloco `{wrongCount > 0 && ( ... )}` (que renderiza o banner "🔁 Revisar N questões..."), adicionar, antes do `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">`:

```jsx
      <motion.button
        onClick={onStartExam}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mb-6 rounded-2xl border-2 border-dashed p-4 flex items-center justify-between gap-3 cursor-pointer transition-colors"
        style={{ borderColor: subject.color }}
      >
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          🕐 Prova cronometrada
        </span>
        <span className="text-sm font-semibold" style={{ color: subject.color }}>
          Começar →
        </span>
      </motion.button>
```

- [ ] **Step 2: Importar `ExamScreen` em `App.jsx`**

Trocar:

```js
import QuizScreen from './components/QuizScreen'
```

por:

```js
import QuizScreen from './components/QuizScreen'
import ExamScreen from './components/ExamScreen'
```

- [ ] **Step 3: Adicionar estado `takingExam`**

Logo abaixo de `const [reviewingSpaced, setReviewingSpaced] = useState(false)` (adicionado na Task 5):

```js
  const [takingExam, setTakingExam] = useState(false)
```

- [ ] **Step 4: Adicionar `'exam'` à derivação de `screen`**

Trocar o bloco (já com `'srs'` da Task 5):

```js
  const screen = !entered
    ? 'home'
    : viewingStats
      ? 'stats'
      : reviewingSpaced
        ? 'srs'
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

por:

```js
  const screen = !entered
    ? 'home'
    : viewingStats
      ? 'stats'
      : reviewingSpaced
        ? 'srs'
        : reviewing
          ? 'review'
          : activeTopic && activeFaseIndex !== null
            ? 'quiz'
            : activeTopic
              ? 'trilha'
              : activeSubject
                ? takingExam
                  ? 'exam'
                  : 'topics'
                : 'grid'
```

- [ ] **Step 5: Adicionar o branch de renderização `'exam'`**

Logo depois do bloco `{screen === 'topics' && ( ... )}`:

```jsx
      {screen === 'exam' && (
        <motion.div
          key="exam"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <ExamScreen
            subject={activeSubject}
            questions={questionsBySubject[activeSubject.id]}
            onExit={() => setTakingExam(false)}
          />
        </motion.div>
      )}
```

- [ ] **Step 6: Passar `onStartExam` pro `TopicScreen`**

No bloco `{screen === 'topics' && (...)}`, dentro de `<TopicScreen ... />`, adicionar a prop:

```jsx
          <TopicScreen
            subject={activeSubject}
            topics={topics}
            onSelectTopic={setActiveTopicIndex}
            onExit={() => setActiveSubjectId(null)}
            onReviewErrors={() => setReviewing(true)}
            onStartExam={() => setTakingExam(true)}
          />
```

- [ ] **Step 7: Verificar**

```bash
npm run build
npm run lint
npm test
```

Todos sem erro. Depois, no navegador: entrar numa matéria com tópicos, clicar em "🕐 Prova cronometrada", escolher um preset de tempo (ex: 10 min), clicar "Começar prova" — confirmar que o quiz roda normalmente com o cronômetro regressivo visível no cabeçalho contando pra baixo. Responder algumas questões e clicar "Finalizar" (ou "← Cancelar prova") — confirmar que a tela de resultado mostra a contagem correta de acertos e o tempo decorrido, e que "Voltar aos tópicos" retorna pra `TopicScreen`.

- [ ] **Step 8: Commit**

```bash
git add src/components/TopicScreen.jsx src/App.jsx
git commit -m "feat: prova cronometrada - botao em TopicScreen e tela exam"
```

---

## Verificação final (depois de todas as tarefas)

Depois que as 8 tarefas estiverem commitadas: rodar `npm run build`, `npm run lint` e `npm test` uma última vez no branch completo, e fazer uma passada manual no navegador cobrindo as 4 features juntas (progresso, instalação PWA via DevTools, prova cronometrada, revisão espaçada com uma `dueDate` forçada pro passado) — igual ao ritual de verificação já usado no resto do projeto nesta sessão. Atualizar a memória do projeto (`medi_quiz_project.md`) com o resultado.
