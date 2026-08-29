// Groups each subject's questions into thematic parts ("tópicos").
// Only question ids are listed here — the actual question objects live in questions.js.
export const topicsBySubject = {
  anatomia: [
    { name: 'Sistema Cardiovascular', icon: '🫀', ids: ['anat-5', 'anat-6', 'anat-7', 'anat-9', 'anat-10', 'anat-16', 'anat-37', 'anat-38', 'anat-71', 'anat-72', 'anat-73', 'anat-74', 'anat-75', 'anat-76', 'anat-77', 'anat-78', 'anat-79', 'anat-80', 'anat-81'] },
    { name: 'Sistema Respiratório', icon: '🫁', ids: ['anat-8', 'anat-30', 'anat-31', 'anat-57', 'anat-58', 'anat-59', 'anat-60', 'anat-61', 'anat-62', 'anat-63', 'anat-64', 'anat-65', 'anat-66', 'anat-67', 'anat-68', 'anat-69', 'anat-70'] },
    { name: 'Sistema Nervoso', icon: '🧠', ids: ['anat-2', 'anat-11', 'anat-12', 'anat-15', 'anat-17', 'anat-18', 'anat-19', 'anat-32', 'anat-33', 'anat-36'] },
    { name: 'Sistema Digestório', icon: '🍽️', ids: ['anat-4', 'anat-13', 'anat-14', 'anat-28', 'anat-29'] },
    { name: 'Sistema Osteoarticular e Muscular', icon: '🦴', ids: ['anat-1', 'anat-3', 'anat-20', 'anat-21', 'anat-23', 'anat-24', 'anat-25', 'anat-26', 'anat-27', 'anat-34', 'anat-35', 'anat-44', 'anat-45', 'anat-46', 'anat-47', 'anat-48', 'anat-49'] },
    { name: 'Sistema Urinário', icon: '💧', ids: ['anat-22', 'anat-39', 'anat-40', 'anat-41', 'anat-42', 'anat-43'] },
    { name: 'Sistema Reprodutor', icon: '🌸', ids: ['anat-50', 'anat-51', 'anat-52', 'anat-53'] },
    { name: 'Cabeça e Pescoço', icon: '💇', ids: ['anat-54', 'anat-55', 'anat-56', 'anat-82', 'anat-83', 'anat-84', 'anat-85'] },
  ],
  histologia: [
    { name: 'Tecidos Epitelial e Conjuntivo', icon: '🧵', ids: ['histo-1', 'histo-2', 'histo-14', 'histo-15', 'histo-17', 'histo-18'] },
    { name: 'Patologia Geral', icon: '🔬', ids: ['histo-4', 'histo-5', 'histo-6', 'histo-8', 'histo-54', 'histo-55', 'histo-56', 'histo-57', 'histo-58'] },
    { name: 'Tecido Muscular e Vascular', icon: '💪', ids: ['histo-7', 'histo-9', 'histo-10'] },
    { name: 'Tecido Nervoso', icon: '🧠', ids: ['histo-11', 'histo-12', 'histo-16', 'histo-48', 'histo-49', 'histo-50', 'histo-51', 'histo-52', 'histo-53'] },
    { name: 'Tecido Ósseo e Cartilaginoso', icon: '🦴', ids: ['histo-3', 'histo-19', 'histo-20', 'histo-21', 'histo-22', 'histo-23'] },
    { name: 'Sangue', icon: '🩸', ids: ['histo-24', 'histo-25', 'histo-26', 'histo-59', 'histo-60', 'histo-61', 'histo-62', 'histo-63', 'histo-64', 'histo-65'] },
    { name: 'Sistema Urinário', icon: '💧', ids: ['histo-13', 'histo-27', 'histo-28'] },
    { name: 'Sistema Endócrino', icon: '⚙️', ids: ['histo-31', 'histo-32', 'histo-33'] },
    { name: 'Sistema Digestório e Glândulas', icon: '🍽️', ids: ['histo-29', 'histo-30', 'histo-34', 'histo-35', 'histo-36'] },
    { name: 'Sistema Reprodutor', icon: '🌸', ids: ['histo-37', 'histo-38', 'histo-39'] },
    { name: 'Sistema Respiratório', icon: '🫁', ids: ['histo-40', 'histo-41', 'histo-42', 'histo-43', 'histo-44', 'histo-45', 'histo-46', 'histo-47'] },
  ],
  fisiologia: [
    { name: 'Fisiologia Cardiovascular', icon: '🫀', ids: ['fisio-2', 'fisio-7', 'fisio-8', 'fisio-9', 'fisio-80', 'fisio-81', 'fisio-82', 'fisio-83', 'fisio-84', 'fisio-85', 'fisio-86', 'fisio-87', 'fisio-88', 'fisio-89', 'fisio-90', 'fisio-91', 'fisio-92', 'fisio-93', 'fisio-94'] },
    { name: 'Fisiologia Respiratória', icon: '🫁', ids: ['fisio-4', 'fisio-5', 'fisio-6', 'fisio-35', 'fisio-47', 'fisio-48', 'fisio-49', 'fisio-50', 'fisio-55', 'fisio-56', 'fisio-57', 'fisio-58', 'fisio-95', 'fisio-96', 'fisio-97', 'fisio-98', 'fisio-99', 'fisio-100', 'fisio-101', 'fisio-102', 'fisio-103', 'fisio-104', 'fisio-105', 'fisio-106'] },
    { name: 'Farmacologia Básica', icon: '💊', ids: ['fisio-51', 'fisio-52', 'fisio-53', 'fisio-54'] },
    { name: 'Fisiologia Renal', icon: '💧', ids: ['fisio-3', 'fisio-10', 'fisio-11', 'fisio-12'] },
    { name: 'Fisiologia Neuromuscular', icon: '⚡', ids: ['fisio-1', 'fisio-13', 'fisio-14', 'fisio-15', 'fisio-17', 'fisio-39', 'fisio-40'] },
    { name: 'Sistema Nervoso Autônomo', icon: '🧠', ids: ['fisio-36', 'fisio-37', 'fisio-38', 'fisio-41', 'fisio-42', 'fisio-66', 'fisio-74', 'fisio-75'] },
    { name: 'Sinapses e Receptores Sensoriais', icon: '⚡', ids: ['fisio-59', 'fisio-60', 'fisio-61', 'fisio-62', 'fisio-63', 'fisio-64', 'fisio-65', 'fisio-67', 'fisio-68', 'fisio-69', 'fisio-70', 'fisio-71', 'fisio-72', 'fisio-73'] },
    { name: 'Sistema Endócrino', icon: '⚙️', ids: ['fisio-16', 'fisio-20', 'fisio-22', 'fisio-23', 'fisio-24', 'fisio-79', 'fisio-111', 'fisio-112', 'fisio-113', 'fisio-114', 'fisio-115'] },
    { name: 'Homeostase e Regulação', icon: '🎯', ids: ['fisio-76', 'fisio-77', 'fisio-78'] },
    { name: 'Fisiologia Digestória', icon: '🍽️', ids: ['fisio-18', 'fisio-19', 'fisio-21', 'fisio-107', 'fisio-108', 'fisio-109', 'fisio-110'] },
    { name: 'Equilíbrio Ácido-Base', icon: '⚖️', ids: ['fisio-25', 'fisio-26', 'fisio-27', 'fisio-28', 'fisio-29', 'fisio-30'] },
    { name: 'Sistema Imunológico', icon: '🛡️', ids: ['fisio-31', 'fisio-32', 'fisio-33', 'fisio-34'] },
    { name: 'Hemostasia', icon: '🩸', ids: ['fisio-43', 'fisio-44', 'fisio-45', 'fisio-46'] },
  ],
  bioquimica: [
    { name: 'Glicólise e Metabolismo de Carboidratos', icon: '🍬', ids: ['bioq-1', 'bioq-2', 'bioq-7', 'bioq-8', 'bioq-9', 'bioq-10', 'bioq-40', 'bioq-41', 'bioq-42', 'bioq-43', 'bioq-44'] },
    { name: 'Ciclo de Krebs e Cadeia Respiratória', icon: '⚡', ids: ['bioq-3', 'bioq-4', 'bioq-5', 'bioq-6', 'bioq-11', 'bioq-27', 'bioq-28', 'bioq-29', 'bioq-30'] },
    { name: 'Proteínas e Enzimas', icon: '🧬', ids: ['bioq-12', 'bioq-13', 'bioq-15', 'bioq-17', 'bioq-18', 'bioq-19', 'bioq-20'] },
    { name: 'Lipídeos e Vitaminas', icon: '💊', ids: ['bioq-14', 'bioq-16', 'bioq-31', 'bioq-32', 'bioq-33', 'bioq-34', 'bioq-35', 'bioq-36', 'bioq-37', 'bioq-38', 'bioq-39'] },
    { name: 'Ácidos Nucleicos', icon: '🧬', ids: ['bioq-21', 'bioq-22', 'bioq-23', 'bioq-24', 'bioq-25', 'bioq-26', 'bioq-45', 'bioq-46', 'bioq-47', 'bioq-48', 'bioq-49'] },
  ],
  embriologia: [
    { name: 'Desenvolvimento Inicial', icon: '🥚', ids: ['embrio-2', 'embrio-3', 'embrio-4', 'embrio-5', 'embrio-18', 'embrio-19', 'embrio-20', 'embrio-21', 'embrio-22'] },
    { name: 'Formação dos Folhetos e Órgãos', icon: '🌱', ids: ['embrio-1', 'embrio-9', 'embrio-10', 'embrio-16', 'embrio-23', 'embrio-24'] },
    { name: 'Dobramento e Organogênese', icon: '🌀', ids: ['embrio-6', 'embrio-8', 'embrio-11', 'embrio-25'] },
    { name: 'Placenta e Gemelaridade', icon: '🤰', ids: ['embrio-7', 'embrio-14', 'embrio-15', 'embrio-26'] },
    { name: 'Sistema Cardiovascular Fetal', icon: '🫀', ids: ['embrio-12', 'embrio-13', 'embrio-17', 'embrio-27', 'embrio-28', 'embrio-29', 'embrio-30'] },
    { name: 'Sistema Respiratório', icon: '🫁', ids: ['embrio-31', 'embrio-32', 'embrio-33', 'embrio-38', 'embrio-39', 'embrio-40', 'embrio-41', 'embrio-42', 'embrio-43'] },
    { name: 'Sistema Urogenital', icon: '🌸', ids: ['embrio-34', 'embrio-35', 'embrio-36', 'embrio-37', 'embrio-44', 'embrio-45', 'embrio-46', 'embrio-47'] },
  ],
  habilidades: [
    { name: 'Sinais Vitais', icon: '🌡️', ids: ['hab-1', 'hab-2', 'hab-3', 'hab-10', 'hab-12', 'hab-24'] },
    { name: 'Anamnese e Exame Geral', icon: '📋', ids: ['hab-4', 'hab-6', 'hab-11', 'hab-19', 'hab-20', 'hab-21', 'hab-22', 'hab-23', 'hab-44', 'hab-45', 'hab-46', 'hab-47'] },
    { name: 'Exame Cardiovascular', icon: '🫀', ids: ['hab-5', 'hab-7', 'hab-9'] },
    { name: 'Exame Respiratório', icon: '🫁', ids: ['hab-15', 'hab-16', 'hab-17'] },
    { name: 'Exame Abdominal', icon: '🍽️', ids: ['hab-8', 'hab-25', 'hab-26', 'hab-27', 'hab-28'] },
    { name: 'Exame Neurológico', icon: '🧠', ids: ['hab-13', 'hab-14', 'hab-18', 'hab-29', 'hab-30'] },
    { name: 'Exame de Cabeça, Olhos e Ouvidos', icon: '👁️', ids: ['hab-31', 'hab-32', 'hab-33', 'hab-34', 'hab-35', 'hab-36', 'hab-37', 'hab-38', 'hab-39', 'hab-40', 'hab-41', 'hab-42', 'hab-43'] },
  ],
}

export function getSubjectTopics(subjectId, allQuestions) {
  const bySubject = allQuestions.filter((q) => q.subject === subjectId)
  const byId = new Map(bySubject.map((q) => [q.id, q]))
  const topics = topicsBySubject[subjectId] || []

  const resolved = topics.map((t) => ({
    name: t.name,
    icon: t.icon,
    questions: t.ids.map((id) => byId.get(id)).filter(Boolean),
  }))

  const coveredIds = new Set(topics.flatMap((t) => t.ids))
  const leftover = bySubject.filter((q) => !coveredIds.has(q.id))
  if (leftover.length > 0) {
    resolved.push({ name: 'Outros', icon: '📚', questions: leftover })
  }

  return resolved.filter((t) => t.questions.length > 0)
}
