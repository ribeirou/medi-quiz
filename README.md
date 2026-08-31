# 🏥 Medi Quiz

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white&style=flat-square" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss&logoColor=white&style=flat-square" />
  <img alt="Vitest" src="https://img.shields.io/badge/tests-13%20passing-4ADE80?logo=vitest&logoColor=white&style=flat-square" />
  <img alt="PWA" src="https://img.shields.io/badge/PWA-instalável-2563EB?logo=pwa&logoColor=white&style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/uso-privado-777777?style=flat-square" />
</p>

<p align="center">
  App de revisão de conteúdo de Medicina, feito para uma pessoa específica estudar do jeito que ela precisa — sem anúncios, sem login, sem coleta de dados. Roda 100% no navegador.
</p>

---

## 🇧🇷 Português

### Sobre o projeto

Medi Quiz é um app de quiz de revisão feito para uma estudante de Medicina (USCS, ciclo pré-clínico). Não existe backend: todo o progresso — acertos, XP, streak, revisão espaçada — fica salvo no `localStorage` do próprio navegador. O banco de questões vem de material de estudo próprio (resumos de tutoria/aula) e de fontes abertas com licença livre (OpenStax), nunca de livros-texto comerciais.

### Funcionalidades

| Área | O que faz |
|---|---|
| 📚 **Banco de questões** | **408 questões** organizadas em 6 matérias (Anatomia, Histologia, Fisiologia, Bioquímica, Embriologia, Habilidades Médicas), cada uma dividida em tópicos temáticos. Múltipla escolha com feedback e explicação imediatos, ou dissertativa com autoavaliação. |
| 🛤️ **Trilha de fases** | Navegação estilo Duolingo: matéria → tópico → mapa de fases → quiz, sem travar progresso. |
| 🔁 **Revisar erros** | Fila automática das questões que você errou, por matéria, some sozinha quando você acerta de novo. |
| 🔁 **Revisão espaçada** | Agendamento tipo Anki/SM-2 simplificado: erra hoje, revisa amanhã; acerta seguido, o intervalo cresce (1, 3, 7, 16, 35 dias). Botão "Revisar hoje" cruza todas as matérias. |
| 🕐 **Prova cronometrada** | Escolhe a matéria e um tempo (10/20/30 min), responde contra o relógio, vê nota e tempo no final. |
| 📊 **Progresso** | Tela com % de acerto por matéria, XP e streak diário. |
| 🌗 **Modo escuro** | Segue o sistema por padrão, com toggle manual. |
| 📱 **PWA instalável** | Dá pra "Adicionar à tela inicial" no celular — abre em tela cheia, sem barra de navegador (ainda exige internet pra carregar, de propósito). |

### Stack técnica

- **[React 19](https://react.dev)** + **[Vite 8](https://vitejs.dev)** — UI e build
- **[Tailwind CSS v4](https://tailwindcss.com)** — estilo utilitário
- **[Framer Motion](https://www.framer.com/motion/)** + **[GSAP](https://gsap.com)** — animações (transições de tela, hero, confetti de conclusão)
- **[canvas-confetti](https://www.npmjs.com/package/canvas-confetti)** — celebração ao completar uma fase
- **[Vitest](https://vitest.dev)** — testes unitários da camada de progresso/agendamento (13 testes)
- **[oxlint](https://oxc.rs)** — lint

Sem backend, sem banco de dados, sem autenticação — decisão deliberada pra manter o projeto simples e sem custo.

### Estrutura do projeto

```
src/
├── components/       # telas e componentes de UI (QuizScreen, TrilhaScreen, ExamScreen, StatsScreen...)
├── data/              # banco de questões (questions.js) e mapeamento por tópico (topics.js)
├── lib/               # lógica pura: progress.js (localStorage, XP, revisão espaçada), theme.js, trilha.js
└── App.jsx            # máquina de estados da navegação entre telas

scripts/
└── generate-icons.mjs # gera os ícones do PWA (PNG) sem nenhuma dependência de imagem

docs/superpowers/       # specs e planos de implementação de cada feature, escritos antes de codar
```

### Rodando localmente

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm test         # roda os testes (Vitest)
npm run lint     # lint (oxlint)
```

---

## 🇬🇧 English

### About

Medi Quiz is a spaced-repetition study quiz built for a Medicine student (pre-clinical years). There's no backend — every bit of progress (correct answers, XP, streaks, spaced-review scheduling) lives in the browser's `localStorage`. The question bank is sourced from the student's own study notes and from openly-licensed material (OpenStax), never from commercial textbooks.

### Features

- **408 questions** across 6 subjects, each broken into topics — multiple-choice (instant feedback + explanation) or short-answer with self-check.
- **Duolingo-style path**: subject → topic → stage map → quiz, no forced ordering.
- **Wrong-answer review**: a self-clearing queue of missed questions per subject.
- **Spaced repetition**: a simplified SM-2 scheduler (fixed rung ladder — 1/3/7/16/35 days) with a cross-subject "review today" queue.
- **Timed exams**: pick a subject and a time limit, answer against the clock, see your score and elapsed time.
- **Progress dashboard**: per-subject accuracy, XP, and daily streak.
- **Dark mode** and an **installable PWA** (network-required by design — no offline caching, so there's never a stale-build lock-in).

### Tech stack

React 19 · Vite 8 · Tailwind CSS v4 · Framer Motion · GSAP · canvas-confetti · Vitest · oxlint — no backend, no database, no auth, by design.

### Running locally

```bash
npm install
npm run dev
npm run build
npm test
npm run lint
```

---

<p align="center"><sub>Projeto pessoal — feito com carinho, não é um produto comercial.</sub></p>
