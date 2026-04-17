'use client'

import { useState } from 'react'
import {
  exportBrochureAction,
  type BrochureExportFormat,
} from '@/app/actions/export-brochure-action'

type BrochureExportPanelProps = {
  companyName: string
  companyUrl: string
  audience: string
  tone: string
  sections: string
  draft: string
  canExport: boolean
}

type ExportFormat = BrochureExportFormat

function base64ToBlob(base64: string, contentType: string) {
  const binaryString = window.atob(base64)
  const bytes = new Uint8Array(binaryString.length)

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index)
  }

  return new Blob([bytes], { type: contentType })
}

async function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = fileName
  anchor.click()

  URL.revokeObjectURL(url)
}

export default function BrochureExportPanel({
  companyName,
  companyUrl,
  audience,
  tone,
  sections,
  draft,
  canExport,
}: BrochureExportPanelProps) {
  const [activeFormat, setActiveFormat] = useState<ExportFormat | null>(null)
  const [error, setError] = useState('')

  async function handleExport(format: ExportFormat) {
    if (!canExport || !draft.trim()) {
      return
    }

    setActiveFormat(format)
    setError('')

    try {
      const formData = new FormData()
      formData.set('format', format)
      formData.set('companyName', companyName)
      formData.set('companyUrl', companyUrl)
      formData.set('audience', audience)
      formData.set('tone', tone)
      formData.set('sections', sections)
      formData.set('markdown', draft)

      const result = await exportBrochureAction(formData)

      if (!result.ok) {
        throw new Error(result.error || 'Export failed.')
      }

      if (format === 'html') {
        const blob = new Blob([result.html ?? ''], { type: result.contentType })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank', 'noopener,noreferrer')
        window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
        return
      }

      if (format === 'bundle') {
        const blob = base64ToBlob(
          result.contentBase64 ?? '',
          result.contentType,
        )
        await downloadBlob(blob, result.fileName)
        return
      }

      const blob = base64ToBlob(result.contentBase64 ?? '', result.contentType)
      await downloadBlob(blob, result.fileName)
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError.message : 'Export failed.',
      )
    } finally {
      setActiveFormat(null)
    }
  }

  const exportCards = [
    {
      format: 'pdf' as const,
      title: 'PDF',
      detail: 'Client-ready brochure download.',
    },
    {
      format: 'html' as const,
      title: 'HTML',
      detail: 'Open a shareable brochure page.',
    },
    {
      format: 'md' as const,
      title: 'Markdown',
      detail: 'Source draft for handoff and editing.',
    },
    {
      format: 'docx' as const,
      title: 'DOCX',
      detail: 'Editable client handoff package.',
    },
    {
      format: 'bundle' as const,
      title: 'Bundle',
      detail: 'PDF, DOCX, HTML, and Markdown in one zip.',
    },
  ]

  return (
    <section className="rounded-4xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.32em] text-slate-400 uppercase">
            Export
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Download the brochure in the format you need.
          </h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          PDF first
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {exportCards.map((card) => (
          <article
            key={card.format}
            className="rounded-3xl border border-white/10 bg-slate-950/40 p-4"
          >
            <p className="text-xs tracking-[0.28em] text-slate-400 uppercase">
              {card.title}
            </p>
            <p className="mt-2 text-sm text-slate-300">{card.detail}</p>
            <button
              type="button"
              disabled={!canExport || activeFormat !== null}
              onClick={() => void handleExport(card.format)}
              className="mt-4 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-slate-500"
            >
              {activeFormat === card.format
                ? 'Exporting...'
                : `Export ${card.title}`}
            </button>
          </article>
        ))}
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
          {error}
        </p>
      ) : null}
    </section>
  )
}
