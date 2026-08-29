# Trilha de fases (estilo Duolingo) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace "escolhe matéria → lista única de questões" with um mapa de fases estilo Duolingo por matéria: cada matéria vira uma trilha vertical com nós de ~7 questões, sem trava de progressão.

**Architecture:** Novo estado de navegação em `App.jsx` (`activeFaseIndex`) intercala uma nova tela `TrilhaScreen` entre a escolha de matéria e o `QuizScreen`. `src/lib/trilha.js` agrupa o array de questões da matéria em fases. `src/lib/progress.js` ganha rastreamento por questão (necessário pra saber quantas questões de cada fase já foram respondidas).

**Tech Stack:** React 19, Framer Motion (já instalado, sem libs novas), Tailwind v4, localStorage.

**Spec:** `docs/superpowers/specs/2026-08-28-trilha-fases-design.md`

## Global Constraints

- Sem framework de testes no projeto (`package.json` só tem `dev`/`build`/`lint`/`preview`) — cada task é verificada manualmente no navegador (Browser pane / Claude in Chrome), não com testes automatizados. Isso é intencional, segue o padrão já usado no projeto até aqui.
- Sem dependências novas — só React, Framer Motion e Tailwind, já instalados.
- Sem trava de progressão: todo nó de fase é sempre clicável, mesmo sem completar os anteriores.
- Fase concluída = todas as questões da fase respondidas ao menos uma vez, independente de acerto.
- Tamanho de fase: 7 questões (última fase de cada matéria pode ter menos).
- UI em português, seguindo o tom e paleta já usados no app (cores por matéria via `subject.color`, tokens de texto `slate-*`).
- Sem elementos de marca do Duolingo (mascote, verde, ícones por tipo de exercício) — nó é sempre um círculo numerado com 3 estados visuais.

---

### Task 1: `src/lib/trilha.js` — agrupamento de questões em fases

**Files:**
- Create: `src/lib/trilha.js`

**Interfaces:**
- Consumes: nada (função pura, só recebe um array).
- Produces: `getFases(questions, size = 7)` → `Array<{ number: number, questions: Array }>`. Task 3 (TrilhaScreen) e `App.jsx` vão importar e chamar essa função.

- [ ] **Step 1: Criar o arquivo com a função de agrupamento**

```js
export function getFases(questions, size = 7) {
  const fases = []
  for (let i = 0; i < questions.length; i += size) {
    fases.push({
      number: fases.length + 1,
      questions: questions.slice(i, i + size),
    })
  }
  return fases
}
```

- [ ] **Step 2: Verificar manualmente via Node**

Rodar (ajustando o caminho pro node.exe se necessário no Windows, ex: `"C:\Program Files\nodejs\node.exe"`):

```bash
node --input-type=module -e "
import { getFases } from './src/lib/trilha.js'
const arr35 = Array.from({ length: 35 }, (_, i) => ({ id: 'q' + i }))
const f35 = getFases(arr35)
console.log('35 questões →', f35.length, 'fases, tamanhos:', f35.map(f => f.questions.length))

const arr18 = Array.from({ length: 18 }, (_, i) => ({ id: 'q' + i }))
const f18 = getFases(arr18)
console.log('18 questões →', f18.length, 'fases, tamanhos:', f18.map(f => f.questions.length))
"
```

Expected: `35 questões → 5 fases, tamanhos: [ 7, 7, 7, 7, 7 ]` e `18 questões → 3 fases, tamanhos: [ 7, 7, 4 ]`. Se o node não estiver no PATH, rodar via `powershell -Command` chamando o executável direto (veja como foi feito antes nessa sessão para `--check`).

- [ ] **Step 3: Commit**

```bash
git add src/lib/trilha.js
git commit -m "feat: add getFases helper to group questions into stages"
```

---

### Task 2: Rastrear questões respondidas + fase-aware back button no `QuizScreen`

**Files:**
- Modify: `src/lib/progress.js`
- Modify: `src/components/QuizScreen.jsx:5` (assinatura), `:39` e `:44` (chamadas de `recordAnswer`), `:52-57` (botão de voltar)

**Interfaces:**
- Consumes: nenhuma interface nova de outra task.
- Produces:
  - `recordAnswer(subjectId, questionId, wasCorrect)` — **assinatura mudou**, ganhou `questionId` no meio. Qualquer chamador precisa passar os 3 argumentos nessa ordem.
  - `getAnsweredIds(subjectId)` → `Array<string>` — IDs de questões já respondidas naquela matéria.
  - `getFaseProgress(fase, subjectId)` → `{ answered: number, total: number }` — usado pela Task 3 (`TrilhaScreen`).
  - `QuizScreen` ganha prop opcional `backLabel` (default `'← Matérias'`).

- [ ] **Step 1: Editar `src/lib/progress.js` — adicionar rastreamento por questão**

Adicionar logo abaixo da linha `const DRAFTS_KEY = 'medi-quiz-drafts'` (linha 4):

```js
const ANSWERED_KEY = 'medi-quiz-answered'
```

Substituir a função `recordAnswer` inteira (linhas 23-33 do arquivo atual) por:

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

export function getFaseProgress(fase, subjectId) {
  const answeredIds = getAnsweredIds(subjectId)
  const answered = fase.questions.filter((q) => answeredIds.includes(q.id)).length
  return { answered, total: fase.questions.length }
}
```

- [ ] **Step 2: Editar `src/components/QuizScreen.jsx` — assinatura e chamadas**

Linha 5, trocar:
```js
export default function QuizScreen({ subject, questions, onExit }) {
```
por:
```js
export default function QuizScreen({ subject, questions, onExit, backLabel = '← Matérias' }) {
```

Linha 39, trocar:
```js
    recordAnswer(subject.id, wasCorrect)
```
por:
```js
    recordAnswer(subject.id, question.id, wasCorrect)
```

Linha 44, trocar:
```js
    recordAnswer(subject.id, wasCorrect)
```
por:
```js
    recordAnswer(subject.id, question.id, wasCorrect)
```

Linhas 52-57, trocar:
```jsx
        <button
          onClick={onExit}
          className="text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1"
        >
          ← Matérias
        </button>
```
por:
```jsx
        <button
          onClick={onExit}
          className="text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1"
        >
          {backLabel}
        </button>
```

- [ ] **Step 3: Verificar manualmente no navegador**

1. Abrir o dev server (`npm run dev` na pasta `medi-quiz`, ou usar o preview já rodando).
2. Escolher qualquer matéria, responder uma questão de múltipla escolha.
3. Abrir devtools (ou usar `javascript_tool` no Browser pane) e checar `localStorage.getItem('medi-quiz-answered')` — deve conter `{"<subjectId>":["<questionId>"]}` com o ID da questão respondida.
4. Responder mais uma questão diferente na mesma matéria — o array daquela matéria deve crescer para 2 IDs, sem duplicar se responder a mesma questão de novo (ex: usando "Anterior" e respondendo de novo — não deve haver, já que MCQ trava seleção, mas dissertativa pode marcar "Acertei"/"Errei" de novo ao revisitar; garantir que o ID não duplica no array).
5. Confirmar que o app ainda funciona normalmente (progresso por matéria, XP, streak) — nada deve ter quebrado.

- [ ] **Step 4: Commit**

```bash
git add src/lib/progress.js src/components/QuizScreen.jsx
git commit -m "feat: track answered question ids for per-stage progress"
```

---

### Task 3: `TrilhaScreen` + integração no `App.jsx`

**Files:**
- Create: `src/components/TrilhaScreen.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `getFases` (Task 1, de `../lib/trilha`), `getFaseProgress` (Task 2, de `../lib/progress`), `QuizScreen` com prop `backLabel` (Task 2).
- Produces: componente `TrilhaScreen({ subject, fases, onSelectFase, onExit })` — sem consumidores além do `App.jsx` nesta plan.

- [ ] **Step 1: Criar `src/components/TrilhaScreen.jsx`**

```jsx
import { motion } from 'framer-motion'
import { getFaseProgress } from '../lib/progress'

const OFFSETS = [0, 72, 0, -72]

export default function TrilhaScreen({ subject, fases, onSelectFase, onExit }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onExit}
          className="text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1"
        >
          ← Matérias
        </button>
        <span className="text-sm font-semibold" style={{ color: subject.color }}>
          {subject.name}
        </span>
      </div>

      <div className="relative flex flex-col items-center gap-6 pb-12">
        <div
          className="absolute top-0 bottom-0 border-l-2 border-dashed"
          style={{ borderColor: `${subject.color}33`, left: '50%' }}
          aria-hidden="true"
        />
        {fases.map((fase, index) => {
          const { answered, total } = getFaseProgress(fase, subject.id)
          const isDone = total > 0 && answered === total
          const fraction = total > 0 ? answered / total : 0
          const radius = 28
          const circumference = 2 * Math.PI * radius

          return (
            <motion.button
              key={fase.number}
              onClick={() => onSelectFase(index)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, x: OFFSETS[index % OFFSETS.length] }}
              transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 cursor-pointer"
              aria-label={`Fase ${fase.number}${isDone ? ', concluída' : ''}`}
            >
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4" />
                {fraction > 0 && (
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    fill="none"
                    stroke={subject.color}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - fraction)}
                    strokeLinecap="round"
                    transform="rotate(-90 32 32)"
                  />
                )}
                <circle
                  cx="32"
                  cy="32"
                  r="22"
                  fill={isDone ? subject.color : 'white'}
                  stroke={isDone ? subject.color : '#cbd5e1'}
                  strokeWidth="2"
                />
                <text
                  x="32"
                  y="32"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isDone ? 20 : 16}
                  fontWeight="600"
                  fill={isDone ? 'white' : '#334155'}
                >
                  {isDone ? '✓' : fase.number}
                </text>
              </svg>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Editar `src/App.jsx`**

Linha 5-6, trocar:
```js
import SubjectCoverflow from './components/SubjectCoverflow'
import QuizScreen from './components/QuizScreen'
```
por:
```js
import SubjectCoverflow from './components/SubjectCoverflow'
import TrilhaScreen from './components/TrilhaScreen'
import QuizScreen from './components/QuizScreen'
import { getFases } from './lib/trilha'
```

Linha 9, trocar:
```js
  const [activeSubjectId, setActiveSubjectId] = useState(null)
```
por:
```js
  const [activeSubjectId, setActiveSubjectId] = useState(null)
  const [activeFaseIndex, setActiveFaseIndex] = useState(null)
```

Linhas 19-29, trocar:
```js
  const activeSubject = subjects.find((s) => s.id === activeSubjectId)

  if (activeSubject) {
    return (
      <QuizScreen
        subject={activeSubject}
        questions={questionsBySubject[activeSubject.id]}
        onExit={() => setActiveSubjectId(null)}
      />
    )
  }
```
por:
```js
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
```

- [ ] **Step 3: Verificar manualmente no navegador (fluxo completo)**

1. Abrir o app, escolher uma matéria no carrossel → deve abrir o mapa de fases (`TrilhaScreen`), não a lista de questões direto.
2. Conferir que o número de fases bate: matéria com 35 questões → 5 nós; matéria com 18 → 3 nós (o último menor).
3. Clicar num nó do meio (fora de ordem, ex: fase 3 antes da 1) → deve abrir o `QuizScreen` só com as ~7 questões daquela fase, e o botão de voltar deve dizer "← Fases" (não "← Matérias").
4. Responder todas as questões da fase e clicar "Finalizar" → deve voltar pro mapa de fases, e aquele nó deve aparecer preenchido com ✓.
5. Abrir outra fase, responder só 2 das 7 questões, sair pelo botão "← Fases" → nó daquela fase deve mostrar o anel de progresso parcial (não vazio, não cheio).
6. No mapa de fases, clicar "← Matérias" → deve voltar pro carrossel de matérias normalmente.
7. Recarregar a página (F5) e repetir o passo 2 numa matéria já visitada → estados dos nós (concluído/parcial/vazio) devem persistir (localStorage).

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/components/TrilhaScreen.jsx
git commit -m "feat: add duolingo-style stage map between subject and quiz"
```
