# App Completo: Progresso, PWA, Prova Cronometrada e Revisão Espaçada — Design

**Status:** aprovado em chat (brainstorming arquitetural), pronto pra spec self-review e depois `writing-plans`.

## Contexto e escopo

O medi-quiz (React + Vite + Tailwind v4 + Framer Motion + GSAP, sem backend, tudo em localStorage) tem hoje: banco de 408 questões, navegação matéria→tópico→trilha de fases→quiz, XP/streak, modo escuro, hero animado, modo "revisar erros" por matéria. O usuário pediu pra tornar o app "realmente completo". Depois de descartar 2 ideias (gamificação com badges, tipos de questão novos — ficam pra depois), foram aprovadas 4 sub-features, decompostas aqui como 4 sub-projetos independentes, cada um entregando valor sozinho:

1. **Tela de progresso/analytics** — gráfico de % de acerto por matéria.
2. **PWA instalável** — vira ícone na tela do celular, sem exigência de funcionar offline.
3. **Prova cronometrada** — escolhe matéria + tempo total, responde contra o relógio.
4. **Revisão espaçada (SM-2 simplificado)** — fila de revisão baseada em intervalo crescente, cross-matéria.

Cada seção abaixo é independente das outras (podem ser implementadas e commitadas em qualquer ordem), exceto que a seção 4 reaproveita uma mudança em `QuizScreen.jsx` que também beneficia (mas não é exigida por) a seção 3.

## Global Constraints

- Sem backend/autenticação — tudo continua em `localStorage`, mesmo padrão dos módulos existentes em `src/lib/progress.js` (chave por `medi-quiz-*`, `readJSON`/fallback).
- Sem novas dependências npm de peso (nada de biblioteca de gráfico, nada de framework de PWA tipo `vite-plugin-pwa`) — o projeto já tem GSAP/Framer Motion/canvas-confetti; o padrão estabelecido é preferir CSS/SVG simples a mais uma lib.
- Manter o estilo do código: sem ponto-e-vírgula, aspas simples, indent 2 espaços, Tailwind utility-only, `dark:` em todo elemento visível, `cursor-pointer` em todo clicável — igual ao resto do projeto.
- Toda mudança precisa passar `npm run build`, `npm run lint` (oxlint) e `npm test` (Vitest) sem novo erro/warning, e ser conferida ao vivo no Browser pane antes de dar por pronta — mesmo ritual usado em todas as levas anteriores desta sessão.
- Lógica nova em `src/lib/progress.js` (fila de revisão espaçada) precisa de teste unitário TDD (Vitest já configurado em `vite.config.js`, arquivo `src/lib/progress.test.js` já existe com mock de `localStorage`) — mesma disciplina usada no plano de "revisar erros".

---

## Seção 1: Tela de progresso/analytics

**O quê:** nova tela mostrando, pra cada matéria, uma barra de progresso com o % de acerto — usando `getSubjectStats(subjectId)` (já existe em `progress.js`, retorna `{correct, wrong}`).

**Componente novo:** `src/components/StatsScreen.jsx`. Recebe `subjects` (array `{id, name, color}`) e `onExit`. Pra cada matéria: `total = correct + wrong`; `pct = total > 0 ? Math.round(100 * correct / total) : 0`. Renderiza uma barra horizontal por matéria — track cinza (`bg-slate-100 dark:bg-slate-800`, `rounded-full`, `overflow-hidden`) com uma `motion.div` interna cuja `width` anima até `${pct}%` e `backgroundColor: subject.color` (mesmo padrão visual já usado na barra de progresso do `QuizScreen.jsx:106-114`). Ao lado de cada barra, texto `{pct}% · {correct}/{total} respondidas` (matéria sem nenhuma resposta ainda mostra `0% · 0/0`, sem quebrar).

**Navegação:** `App.jsx` ganha estado `viewingStats` (boolean) e uma tela `screen === 'stats'` (nova branch no `AnimatePresence`, mesmo padrão de transição `x: 24 → 0` das outras telas). Entrada: novo botão redondo no `Hero()`, ao lado do `ThemeToggle`, ícone `📊`, `aria-label="Ver progresso"`, sempre visível (não condicionado a XP > 0, já que ver "0%" também é informação válida). Saída: botão "← Início" dentro da própria `StatsScreen`, volta pra `screen 'grid'`.

**Sem lib de gráfico nova** — barra de progresso em CSS/Tailwind já é o padrão usado em `QuizScreen`/`TrilhaScreen` (círculo de progresso SVG), então uma barra horizontal simples mantém consistência visual sem inflar o bundle.

---

## Seção 2: PWA instalável (sem exigência offline)

**O quê:** o app fica instalável ("Adicionar à tela inicial") no Android/Chrome e no iOS/Safari, abre em tela cheia sem barra de navegador, mas continua exigindo internet pra carregar (sem cache agressivo, sem risco de ficar preso numa versão antiga).

**Arquivos novos:**
- `public/manifest.json` — `name: "Medi Quiz"`, `short_name: "Medi Quiz"`, `start_url: "/"`, `scope: "/"`, `display: "standalone"`, `background_color: "#0f172a"` (slate-950, cor de fundo do modo escuro/hero), `theme_color: "#2563eb"` (azul primário do app), `icons`: array com 2 tamanhos (`192x192` e `512x512`, PNG, `purpose: "any"`) mais uma versão `512x512` com `purpose: "maskable"` (exigência do Android pra ícone adaptativo).
- `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-512-maskable.png` — ícone de cruz médica azul, gerado programaticamente (sem arte externa). **Nota de implementação pro plano**: este ambiente não tem ImageMagick/ffmpeg/Python funcional pra rasterizar SVG→PNG; a técnica que já funcionou nesta sessão pra outras tarefas é usar o próprio Browser pane — desenhar o SVG num `<canvas>` via `javascript_tool`, extrair `canvas.toDataURL('image/png')` e salvar o base64 decodificado em arquivo via Bash.
- `public/sw.js` — service worker mínimo, só pra satisfazer o critério de instalabilidade do Chrome/Android (que exige um service worker ativo com handler de `fetch`), **sem cache**: escuta `install` (chama `skipWaiting()`), `activate` (chama `clients.claim()`) e `fetch` (`event.respondWith(fetch(event.request))` — passthrough puro pra rede, sem `caches.match`). Isso garante que toda visita sempre pega a versão mais nova, sem risco de tela em branco por cache velho.

**Arquivos modificados:**
- `index.html` — adiciona `<link rel="manifest" href="/manifest.json">`, `<meta name="theme-color" content="#2563eb">`, `<link rel="apple-touch-icon" href="/icons/icon-192.png">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` (as duas últimas são o que faz o "Adicionar à Tela de Início" do iOS/Safari abrir em tela cheia).
- `src/main.jsx` — registra o service worker: `if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')`, chamado depois do `initTheme()` existente, sem bloquear o render.

---

## Seção 3: Prova cronometrada

**O quê:** a partir da tela de tópicos de uma matéria, um novo botão "🕐 Prova cronometrada" abre uma tela de configuração (escolher tempo: presets 10/20/30 min), depois roda todas as questões daquela matéria (mesmo conjunto de `questionsBySubject[subject.id]` já computado em `App.jsx:27-33` — não fica restrito a um tópico só, igual ao "revisar erros" hoje, que também já é matéria inteira) com um cronômetro regressivo visível. Ao esgotar o tempo, ou ao finalizar a última questão, mostra uma tela de resultado (X/Y corretas, tempo usado).

**Mudança em `QuizScreen.jsx`:** dois props novos, opcionais, sem quebrar nenhum uso existente (`quiz`, `review`, já usam `QuizScreen` sem esses props):
- `timeLimitSeconds?: number` — se presente, mostra um cronômetro regressivo no cabeçalho (ao lado do `{index+1}/{questions.length}`, mesmo estilo de texto). Um `useEffect` com `setInterval` de 1s decrementa um `timeLeft` state local; ao chegar a 0, chama `onExit()` automaticamente (mesmo callback do botão de voltar — nenhuma lógica nova de "saída", só mais um jeito de disparar a existente).
- `onAnswer?: (wasCorrect: boolean) => void` — chamado logo após `recordAnswer` em `handleMcqSelect` (`QuizScreen.jsx:51-57`) e em `handleSelfCheck` (`QuizScreen.jsx:59-63`), sem mudar o que essas funções já fazem. Serve pra quem estiver "por fora" (a prova) acompanhar acerto/erro sem precisar reimplementar a UI de pergunta.

**Componente novo:** `src/components/ExamScreen.jsx`. Tem 3 fases internas (`useState<'setup' | 'running' | 'results'>`):
- `setup`: nome da matéria + 3 botões de preset (10/20/30 min) + botão "Começar prova" (desabilitado até escolher um tempo).
- `running`: renderiza `<QuizScreen subject={subject} questions={subjectQuestions} timeLimitSeconds={escolhido} onAnswer={(certo) => tally atualiza} onExit={() => phase = 'results'} backLabel="← Cancelar prova" />`. Sair da prova a qualquer momento (botão voltar, tempo acabar, ou terminar a última questão) sempre cai em `results` — não existe um caminho de "cancelar sem ver nada", o que simplifica bastante (um único callback `onExit`, sem precisar distinguir motivo da saída).
- `results`: mostra `{tally.correct}/{tally.total} corretas` e o tempo decorrido (calculado por `Date.now() - startTime`, guardado num `ref` quando `phase` vira `running`), com botão "Voltar aos tópicos".

**Navegação:** `TopicScreen.jsx` ganha prop `onStartExam`, novo botão abaixo do banner de "revisar erros" existente (mesmo estilo visual, ícone `🕐` em vez de `🔁`). `App.jsx` ganha estado `takingExam` (boolean) e tela `screen === 'exam'` renderizando `<ExamScreen subject={activeSubject} questions={questionsBySubject[activeSubject.id]} onExit={() => setTakingExam(false)} />`.

---

## Seção 4: Revisão espaçada (SM-2 simplificado)

**Importante — o que "SM-2 simplificado" significa aqui**: o algoritmo real de SuperMemo-2 usa uma nota de qualidade de recall (0 a 5) pra recalcular um "fator de facilidade" contínuo. Este app só tem sinal binário (acertou/errou, vindo do MCQ ou do "Acertei/Errei" da dissertativa) — não dá pra implementar o SM-2 literal sem adicionar uma UI de autoavaliação de 0 a 5, que não foi pedida. A versão aqui é uma **escada de intervalos fixos** que cresce a cada acerto seguido e volta ao início a cada erro — captura a ideia central (revisar mais espaçado o que você já sabe bem, mais frequente o que erra) sem a complexidade extra do fator de facilidade contínuo.

**Mudança em `src/lib/progress.js`:**
```js
const SRS_KEY = 'medi-quiz-srs'
const SRS_INTERVALS_DAYS = [1, 3, 7, 16, 35]

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
```
Chamada de dentro de `recordAnswer` (`progress.js:25-42`), no mesmo lugar onde `markAnswered`/`markWrong`/`unmarkWrong` já são chamados — uma linha a mais, sem mudar a assinatura de `recordAnswer`.

Nova função exportada:
```js
export function getDueQuestions(allQuestions) {
  const all = readJSON(SRS_KEY, {})
  const today = todayStr()
  return allQuestions.filter((q) => all[q.id] && all[q.id].dueDate <= today)
}
```
Só questões já respondidas pelo menos uma vez entram na fila (questão nunca vista não tem card de SRS ainda — "revisão" pressupõe já ter visto antes; isso é intencional, não um bug).

**Mudança em `QuizScreen.jsx` (reaproveitada, não exclusiva da seção 4):** hoje `QuizScreen` recebe um único `subject` (usado pra cor e pra `recordAnswer(subject.id, ...)`) — funciona porque toda lista de `questions` vem sempre da mesma matéria. A fila de revisão espaçada mistura matérias diferentes, então cada questão precisa da sua própria cor/matéria. Em vez de duplicar toda a lógica de renderização de MCQ/dissertativa (~250 linhas) num componente novo, `QuizScreen` ganha um prop `subjects?: Subject[]` alternativo a `subject`: se `subjects` for passado, cada render calcula `const activeSubject = subject || subjects.find((s) => s.id === question.subject)` e usa `activeSubject` em tudo que hoje usa `subject` (cor da barra de progresso, cor do texto "múltipla escolha", `recordAnswer(activeSubject.id, ...)`). Chamada existente com `subject` singular continua idêntica — mudança é aditiva.

**Navegação:** não precisa de componente de tela novo — segue o padrão que `screen === 'review'` já usa (`App.jsx:94-109`), renderizando `QuizScreen` direto. `App.jsx` ganha:
- `dueQuestions = useMemo(() => getDueQuestions(questions), [])` (recalculado quando entra na tela — como é local ao clicar, um `useMemo` sem dependência de estado mutável basta, recalculado no próximo mount natural do componente).
- Estado `reviewingSpaced` (boolean), tela `screen === 'srs'`: `<QuizScreen subjects={subjects} questions={dueQuestions} backLabel="← Início" onExit={() => setReviewingSpaced(false)} />`.
- Botão "🔁 Revisar hoje ({dueQuestions.length})" no `Hero()`, só aparece se `dueQuestions.length > 0` — mesmo padrão condicional do banner de "revisar erros" em `TopicScreen.jsx:25`.

---

## Testes (TDD, seção 4)

`src/lib/progress.test.js` ganha um novo `describe('spaced repetition (SRS)')`:
- responder errado sempre bota `intervalIndex` em 0 (dueDate = amanhã).
- responder certo repetidamente avança pela escada `[1,3,7,16,35]` sem passar do último índice.
- `getDueQuestions` só retorna questões com `dueDate <= hoje` E que já têm card (nunca respondidas ficam de fora).
- errar depois de vários acertos reseta a escada (volta pra `intervalIndex 0`).

Seções 1-3 são só UI/wiring — verificadas do mesmo jeito que todo o resto do projeto: `npm run build` + `npm run lint` + checagem ao vivo no Browser pane (sem framework de teste de componente, consistente com a decisão já tomada no plano anterior).
