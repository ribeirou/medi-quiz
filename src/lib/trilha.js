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
