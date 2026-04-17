import type { BrochureFormInput } from '@/lib/brochure/form'

export type BrochureDocumentSection = {
  title: string
  body: string
}

export type BrochureDocument = {
  companyName: string
  companyUrl: string
  audience: BrochureFormInput['audience']
  tone: BrochureFormInput['tone']
  sections: BrochureDocumentSection[]
  markdown: string
  createdAt: string
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function collectSectionBody(markdown: string, title: string) {
  const headingPattern = new RegExp(`^##\\s+${escapeRegExp(title)}\\s*$`, 'im')
  const lines = markdown.split(/\r?\n/)
  const startIndex = lines.findIndex((line) => headingPattern.test(line))

  if (startIndex < 0) {
    return ''
  }

  const bodyLines: string[] = []

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index]

    if (/^##\s+/.test(line)) {
      break
    }

    bodyLines.push(line)
  }

  return bodyLines.join('\n').trim()
}

export function createBrochureDocument(
  input: BrochureFormInput,
  markdown: string,
): BrochureDocument {
  return {
    companyName: input.companyName,
    companyUrl: input.companyUrl,
    audience: input.audience,
    tone: input.tone,
    sections: input.sections.map((sectionTitle) => ({
      title: sectionTitle,
      body: collectSectionBody(markdown, sectionTitle),
    })),
    markdown,
    createdAt: new Date().toISOString(),
  }
}

export function renderBrochureMarkdown(document: BrochureDocument) {
  return document.markdown.trim()
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderParagraphs(body: string) {
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) {
    return '<p class="brochure-empty">No content available for this section.</p>'
  }

  return paragraphs
    .map(
      (paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`,
    )
    .join('')
}

export function renderBrochureHtml(document: BrochureDocument) {
  const sections = document.sections
    .map(
      (section) => `
        <section class="brochure-section">
          <h2>${escapeHtml(section.title)}</h2>
          ${renderParagraphs(section.body)}
        </section>
      `,
    )
    .join('')

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(document.companyName)} Brochure</title>
        <style>
          :root {
            color-scheme: dark;
            --bg: #07111f;
            --panel: rgba(15, 23, 42, 0.88);
            --text: #e5eefb;
            --muted: #94a3b8;
            --border: rgba(148, 163, 184, 0.18);
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 40px;
            font-family: Inter, ui-sans-serif, system-ui, sans-serif;
            background:
              radial-gradient(circle at top, rgba(56, 189, 248, 0.14), transparent 32%),
              var(--bg);
            color: var(--text);
          }

          .brochure-shell {
            max-width: 920px;
            margin: 0 auto;
            background: var(--panel);
            border: 1px solid var(--border);
            border-radius: 28px;
            padding: 40px;
            box-shadow: 0 32px 80px rgba(0, 0, 0, 0.28);
          }

          .brochure-header h1 {
            margin: 0;
            font-size: 42px;
            line-height: 1.02;
            letter-spacing: -0.04em;
          }

          .brochure-header p,
          .brochure-section p {
            color: var(--text);
            line-height: 1.7;
            font-size: 16px;
          }

          .brochure-meta {
            margin-top: 12px;
            color: var(--muted);
            font-size: 14px;
          }

          .brochure-section {
            margin-top: 28px;
            padding-top: 28px;
            border-top: 1px solid var(--border);
          }

          .brochure-section h2 {
            margin: 0 0 12px;
            font-size: 22px;
          }

          .brochure-empty {
            color: var(--muted);
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <main class="brochure-shell">
          <header class="brochure-header">
            <h1>${escapeHtml(document.companyName)}</h1>
            <div class="brochure-meta">
              ${escapeHtml(document.audience)} audience · ${escapeHtml(document.tone)} tone · ${escapeHtml(document.companyUrl)}
            </div>
          </header>
          ${sections}
        </main>
      </body>
    </html>
  `
}
