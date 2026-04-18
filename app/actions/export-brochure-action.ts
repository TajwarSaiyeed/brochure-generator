'use server'

import JSZip from 'jszip'
import {
  createBrochureDocument,
  renderBrochureHtml,
  renderBrochureMarkdown,
} from '@/lib/brochure/document'
import { exportBrochureDocx, exportBrochurePdf } from '@/lib/brochure/export'
import { parseBrochureFormData } from '@/lib/brochure/form'

export type BrochureExportFormat = 'pdf' | 'html' | 'md' | 'docx' | 'bundle'

export type BrochureExportResult =
  | {
      ok: true
      format: BrochureExportFormat
      fileName: string
      contentType: string
      html?: string
      contentBase64?: string
    }
  | {
      ok: false
      error: string
    }

function createSlug(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'brochure'
}

function createBrochureFileName(companyName: string, extension: string) {
  return `${createSlug(companyName)}.${extension}`
}

function encodeBuffer(buffer: ArrayBuffer | Uint8Array) {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer

  return Buffer.from(bytes).toString('base64')
}

function getRequiredText(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === 'string' ? value : ''
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return 'Unable to export the brochure.'
}

export async function exportBrochureAction(
  formData: FormData,
): Promise<BrochureExportResult> {
  try {
    const format = String(
      formData.get('format') ?? '',
    ).toLowerCase() as BrochureExportFormat
    const request = parseBrochureFormData(formData)
    const markdown = getRequiredText(formData, 'markdown').trim()

    if (!markdown) {
      return {
        ok: false,
        error: 'A generated brochure draft is required before exporting.',
      }
    }

    const document = createBrochureDocument(request, markdown)

    if (format === 'html') {
      return {
        ok: true,
        format,
        fileName: createBrochureFileName(document.companyName, 'html'),
        contentType: 'text/html; charset=utf-8',
        html: renderBrochureHtml(document),
      }
    }

    if (format === 'md') {
      return {
        ok: true,
        format,
        fileName: createBrochureFileName(document.companyName, 'md'),
        contentType: 'text/markdown; charset=utf-8',
        contentBase64: encodeBuffer(
          Buffer.from(renderBrochureMarkdown(document), 'utf8'),
        ),
      }
    }

    if (format === 'docx') {
      const docxBuffer = await exportBrochureDocx(document)

      return {
        ok: true,
        format,
        fileName: createBrochureFileName(document.companyName, 'docx'),
        contentType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        contentBase64: encodeBuffer(docxBuffer),
      }
    }

    if (format === 'bundle') {
      const [pdfBuffer, docxBuffer] = await Promise.all([
        exportBrochurePdf(document),
        exportBrochureDocx(document),
      ])
      const zip = new JSZip()
      const baseFileName = createSlug(document.companyName)

      zip.file(`${baseFileName}.md`, renderBrochureMarkdown(document))
      zip.file(`${baseFileName}.html`, renderBrochureHtml(document))
      zip.file(`${baseFileName}.pdf`, pdfBuffer)
      zip.file(`${baseFileName}.docx`, docxBuffer)
      zip.file(
        'manifest.json',
        JSON.stringify(
          {
            companyName: document.companyName,
            companyUrl: document.companyUrl,
            audience: document.audience,
            tone: document.tone,
            createdAt: document.createdAt,
            formats: ['md', 'html', 'pdf', 'docx'],
          },
          null,
          2,
        ),
      )

      const bundleBuffer = await zip.generateAsync({ type: 'nodebuffer' })

      return {
        ok: true,
        format,
        fileName: `${baseFileName}-bundle.zip`,
        contentType: 'application/zip',
        contentBase64: encodeBuffer(bundleBuffer),
      }
    }

    if (format === 'pdf') {
      const pdfBuffer = await exportBrochurePdf(document)

      return {
        ok: true,
        format,
        fileName: createBrochureFileName(document.companyName, 'pdf'),
        contentType: 'application/pdf',
        contentBase64: encodeBuffer(pdfBuffer),
      }
    }

    return {
      ok: false,
      error: 'Unsupported export format.',
    }
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error),
    }
  }
}
