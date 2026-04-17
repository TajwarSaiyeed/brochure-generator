import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import { chromium } from 'playwright'
import {
  renderBrochureHtml,
  renderBrochureMarkdown,
  type BrochureDocument,
} from '@/lib/brochure/document'

export function exportBrochureMarkdown(document: BrochureDocument) {
  return renderBrochureMarkdown(document)
}

export function exportBrochureHtml(document: BrochureDocument) {
  return renderBrochureHtml(document)
}

export async function exportBrochureDocx(document: BrochureDocument) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: document.companyName,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${document.audience} audience`,
                bold: true,
              }),
              new TextRun({ text: ` · ${document.tone} tone · ` }),
              new TextRun({ text: document.companyUrl, italics: true }),
            ],
          }),
          new Paragraph({ text: '' }),
          ...document.sections.flatMap((section) => [
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_1,
            }),
            ...(section.body
              ? section.body.split(/\n\s*\n/).map(
                  (paragraph) =>
                    new Paragraph({
                      text: paragraph.trim(),
                      spacing: { after: 160 },
                    }),
                )
              : [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'No content available for this section.',
                        italics: true,
                      }),
                    ],
                  }),
                ]),
          ]),
        ],
      },
    ],
  })

  return Packer.toBuffer(doc)
}

export async function exportBrochurePdf(document: BrochureDocument) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    const page = await browser.newPage({
      viewport: { width: 1240, height: 1754 },
    })

    await page.setContent(renderBrochureHtml(document), {
      waitUntil: 'networkidle',
    })

    return await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.4in',
        right: '0.4in',
        bottom: '0.4in',
        left: '0.4in',
      },
    })
  } finally {
    await browser.close()
  }
}
