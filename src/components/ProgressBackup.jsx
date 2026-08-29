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
