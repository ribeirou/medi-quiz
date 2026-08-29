# Trilha de fases (estilo Duolingo) — design

Data: 2026-08-28

## Objetivo

Substituir o fluxo atual "escolhe matéria → lista única de questões" por um mapa de fases estilo Duolingo por matéria: cada matéria vira uma trilha vertical com nós (fases) de ~6-8 questões cada, que a aluna navega clicando.

## Fora de escopo (specs separados, depois deste)

- Modo escuro
- Página inicial/hero nova com animações (inspiração 21st.dev)
- Mascote, marca ou paleta de cores do Duolingo — usamos a paleta azul/branco clínica já existente do app. Só o *padrão* de UI (trilha vertical com nós) é reaproveitado; não é cópia visual da marca.

## Decisões já validadas com a usuária

- **Sem trava de progresso**: toda fase é clicável a qualquer momento, mesmo sem completar as anteriores (trilha livre, não sequencial).
- **Agrupamento**: cada matéria existente (Anatomia, Histologia, Fisiologia, Bioquímica, Embriologia, Habilidades Médicas) vira uma trilha própria. As questões da matéria são divididas em fases de 6-8 questões, na ordem em que já aparecem no array `questions`.
- **Conclusão de fase**: uma fase fica marcada como concluída quando todas as suas questões foram respondidas pelo menos uma vez — não depende de acertar, só de ter respondido (consistente com a filosofia sem punição do app).
- **Simplificação intencional**: ao contrário do Duolingo (que varia o ícone do nó por tipo de exercício — ouvir, falar, etc), aqui todo nó é visualmente igual (círculo numerado), variando só por estado: não iniciado / parcialmente respondido / concluído. Isso porque nosso conteúdo não tem "tipos de exercício" distintos por nó — só mcq/dissertativa misturados dentro da mesma fase.

## Arquitetura / fluxo de navegação

Fluxo atual: `App.jsx` (SubjectCoverflow) → `QuizScreen` (todas as questões da matéria).

Fluxo novo: `App.jsx` (SubjectCoverflow) → **`TrilhaScreen`** (mapa de fases da matéria) → `QuizScreen` (só as questões daquela fase) → volta pro `TrilhaScreen` (não direto pro grid de matérias).

`App.jsx` ganha um novo nível de estado: além de `activeSubjectId`, precisa de `activeFaseIndex` (null = mostrando TrilhaScreen; número = dentro do QuizScreen daquela fase).

## Componentes e módulos

### `src/lib/trilha.js` (novo)

Módulo puro, sem estado. Uma função:

```js
export function getFases(questions, size = 7) {
  // agrupa o array de questões da matéria em chunks de `size`
  // retorna [{ number: 1, questions: [...] }, { number: 2, questions: [...] }, ...]
}
```

Tamanho de fase: 7 questões (meio-termo dos 6-8 combinados). Última fase pode ter menos.

### `src/lib/progress.js` (editado)

Hoje `recordAnswer(subjectId, wasCorrect)` só grava contagem agregada certo/errado por matéria — não sabe *quais* questões já foram respondidas, o que é necessário para calcular o progresso de cada fase.

Mudanças:
- `recordAnswer(subjectId, questionId, wasCorrect)` — novo parâmetro `questionId`, grava também num novo registro `medi-quiz-answered` no localStorage: `{ [subjectId]: [questionId, questionId, ...] }` (lista de IDs já respondidos, sem duplicar).
- Nova função `getAnsweredIds(subjectId)` → retorna o array/Set de IDs respondidos daquela matéria.
- Nova função `getFaseProgress(fase, subjectId)` → dado um objeto fase e a matéria, retorna `{ answered: n, total: m }` comparando os IDs das questões da fase com `getAnsweredIds`.

`QuizScreen.jsx` precisa passar `question.id` na chamada de `recordAnswer` (hoje só passa `subject.id, wasCorrect`).

### `src/components/TrilhaScreen.jsx` (novo)

Recebe `subject`, `fases` (resultado de `getFases`), `onSelectFase(faseIndex)`, `onExit`.

Layout: cabeçalho com "← Matérias" e nome da matéria (reaproveita padrão visual do QuizScreen). Abaixo, um mapa vertical: nós circulares numerados em zigue-zague (alternando esquerda/centro/direita a cada fase), conectados por uma linha/trilha pontilhada em SVG atrás dos nós. Framer Motion anima a entrada dos nós em cascata (stagger).

Estado visual de cada nó (calculado via `getFaseProgress`):
- **Não iniciado**: círculo com contorno, número dentro, cor neutra (slate).
- **Parcial**: anel de progresso preenchido proporcionalmente (ex: `answered/total`), cor da matéria.
- **Concluído**: círculo preenchido com a cor da matéria, ícone de check no lugar do número.

Clique em qualquer nó chama `onSelectFase(index)` — sem trava, todos sempre clicáveis.

### `App.jsx` (editado)

- Novo estado `activeFaseIndex`.
- Ao selecionar matéria (`SubjectCoverflow.onSelect`) → mostra `TrilhaScreen` em vez de ir direto pro `QuizScreen`.
- `TrilhaScreen.onSelectFase` → seta `activeFaseIndex`, mostra `QuizScreen` só com as questões daquela fase (`fases[activeFaseIndex].questions`).
- `QuizScreen.onExit` (hoje volta pro grid de matérias) → passa a voltar pro `TrilhaScreen` (seta `activeFaseIndex` de volta pra `null`, mantém `activeSubjectId`). O botão dentro do `QuizScreen` (hoje "← Matérias") precisa de um label novo nesse contexto, já que não volta mais pro grid — vira "← Fases" (recebe o texto do botão como prop, em vez de fixo).
- Botão "← Matérias" dentro do `TrilhaScreen` volta pro grid (`activeSubjectId = null`).

## Testes / verificação

Sem testes automatizados no projeto (consistente com o resto do app). Verificação manual no navegador:
1. Escolher uma matéria no carrossel → deve abrir o mapa de fases (não a lista de questões direto).
2. Mapa mostra o número certo de fases (ex: matéria com 35 questões → 5 fases de 7).
3. Clicar num nó qualquer (inclusive fora de ordem) → abre o quiz só com as questões daquela fase.
4. Responder todas as questões da fase → voltar (Finalizar) → nó aparece marcado como concluído.
5. Responder só parte de uma fase, sair no meio (botão "← Matérias" dentro do QuizScreen, que agora leva pro TrilhaScreen) → nó aparece com progresso parcial.
6. Refresh da página → progresso persiste (localStorage).
