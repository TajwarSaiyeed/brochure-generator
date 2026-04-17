import { recordBrochureRun } from '@/lib/brochure-runs'
import { createBrochureDocument } from './document'
import type { BrochureDocument } from './document'
import {
  formatScrapedPageContext,
  scrapeBrochureSource,
  type ScrapedPage,
} from '@/lib/scraper'
import { storeBrochureArtifact } from '@/lib/storage'
import type { BrochureFormInput } from '@/lib/brochure/form'

function readOptionalEnv(name: string, fallback: string) {
  return process.env[name]?.trim() || fallback
}

function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const openRouterBaseUrl = readOptionalEnv(
  'OPENROUTER_BASE_URL',
  'https://openrouter.ai/api/v1',
).replace(/\/$/, '')

const openRouterModel =
  process.env.OPENROUTER_MODEL ?? 'openrouter/elephant-alpha'

type BrochureWorkflowResult = {
  draft: string
  document: BrochureDocument
  scrapedPage: ScrapedPage | null
  storageBucket: string | null
  storageKey: string | null
  model: string
}

function createSystemPrompt(input: BrochureFormInput) {
  return [
    'You are an expert marketing copywriter.',
    'Write concise, credible brochure copy in Markdown.',
    'Use only the information provided in the prompt.',
    'Do not fabricate statistics, customer names, awards, or integrations.',
    `Tone: ${input.tone}.`,
    `Audience: ${input.audience}.`,
    `Target company: ${input.companyName}.`,
    `Target URL: ${input.companyUrl}.`,
    `Structure the output with these sections: ${input.sections.join(', ')}.`,
  ].join(' ')
}

function createUserPrompt(
  input: BrochureFormInput,
  scrapedPage: ScrapedPage | null,
) {
  const scrapedContext = scrapedPage
    ? formatScrapedPageContext(scrapedPage)
    : 'No site content could be scraped. Generate a careful brochure using only the request fields.'

  return [
    `Company name: ${input.companyName}`,
    `Company URL: ${input.companyUrl}`,
    `Audience: ${input.audience}`,
    `Tone: ${input.tone}`,
    `Requested sections: ${input.sections.join(', ')}`,
    'Scraped site context:',
    scrapedContext,
    'Draft a brochure that is safe to publish as a first-pass marketing brochure.',
  ].join('\n')
}

function buildFallbackBrochure(input: BrochureFormInput) {
  const sectionCopy = input.sections.map((section) => {
    const normalized = section.toLowerCase()

    if (normalized.includes('overview')) {
      return [
        `## ${section}`,
        `${input.companyName} is presented here as a ${input.tone} brand built for ${input.audience}.`,
        `The source URL for this brochure draft is ${input.companyUrl}.`,
      ].join('\n\n')
    }

    if (normalized.includes('what we do')) {
      return [
        `## ${section}`,
        `This implementation now uses a Server Action backed by server functions instead of a browser-facing API route.`,
      ].join('\n\n')
    }

    if (normalized.includes('why choose us')) {
      return [
        `## ${section}`,
        `The workflow stays split into small modules, with scraping, generation, storage, and persistence handled separately.`,
      ].join('\n\n')
    }

    if (normalized.includes('team')) {
      return [
        `## ${section}`,
        `The team section can later be replaced with scraped bios or structured CMS data once those integrations land.`,
      ].join('\n\n')
    }

    if (normalized.includes('call to action')) {
      return [
        `## ${section}`,
        `If this direction fits, the next iteration can refine the scraper fallback path and add stronger validation.`,
      ].join('\n\n')
    }

    return [
      `## ${section}`,
      `This section expands the brochure for ${input.companyName} with ${input.tone} language tailored to ${input.audience}.`,
    ].join('\n\n')
  })

  return [
    `# ${input.companyName}`,
    `_${input.tone} brochure draft for ${input.audience}_`,
    ...sectionCopy,
  ].join('\n\n')
}

async function readOpenRouterMarkdown(
  input: BrochureFormInput,
  scrapedPage: ScrapedPage | null,
) {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return buildFallbackBrochure(input)
  }

  try {
    const response = await fetch(`${openRouterBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': readRequiredEnv('NEXT_PUBLIC_APP_URL'),
        'X-Title': 'Brochure Forge',
      },
      body: JSON.stringify({
        model: openRouterModel,
        stream: true,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: createSystemPrompt(input),
          },
          {
            role: 'user',
            content: createUserPrompt(input, scrapedPage),
          },
        ],
      }),
    })

    if (!response.ok || !response.body) {
      return buildFallbackBrochure(input)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let markdown = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data:')) {
          continue
        }

        const payload = line.slice(5).trimStart()

        if (!payload || payload === '[DONE]') {
          continue
        }

        try {
          const event = JSON.parse(payload) as {
            choices?: Array<{
              delta?: {
                content?: string
              }
            }>
          }

          const chunk = event.choices?.[0]?.delta?.content

          if (typeof chunk === 'string' && chunk.length > 0) {
            markdown += chunk
          }
        } catch {
          continue
        }
      }
    }

    const trailingLine = buffer.trim()

    if (trailingLine.startsWith('data:')) {
      const payload = trailingLine.slice(5).trimStart()

      if (payload && payload !== '[DONE]') {
        try {
          const event = JSON.parse(payload) as {
            choices?: Array<{
              delta?: {
                content?: string
              }
            }>
          }

          const chunk = event.choices?.[0]?.delta?.content

          if (typeof chunk === 'string' && chunk.length > 0) {
            markdown += chunk
          }
        } catch {
          return markdown.trim().length > 0
            ? markdown
            : buildFallbackBrochure(input)
        }
      }
    }

    return markdown.trim().length > 0 ? markdown : buildFallbackBrochure(input)
  } catch (error) {
    console.warn(
      'OpenRouter generation failed, using fallback brochure.',
      error,
    )
    return buildFallbackBrochure(input)
  }
}

export async function generateBrochureDraft(
  input: BrochureFormInput,
): Promise<BrochureWorkflowResult> {
  const scrapedPage = await scrapeBrochureSource(input.companyUrl)
  const draft = await readOpenRouterMarkdown(input, scrapedPage)
  const document = createBrochureDocument(input, draft)

  let storageBucket: string | null = null
  let storageKey: string | null = null

  try {
    const artifact = await storeBrochureArtifact({
      companyName: input.companyName,
      companyUrl: input.companyUrl,
      markdown: document.markdown,
    })

    storageBucket = artifact?.bucket ?? null
    storageKey = artifact?.key ?? null
  } catch (storageError) {
    console.warn('Failed to store brochure artifact in MinIO', storageError)
  }

  try {
    await recordBrochureRun({
      companyName: input.companyName,
      companyUrl: input.companyUrl,
      audience: input.audience,
      tone: input.tone,
      sections: input.sections,
      markdown: draft,
      model: openRouterModel,
      storageBucket,
      storageKey,
    })
  } catch (databaseError) {
    console.warn('Failed to store brochure run in PostgreSQL', databaseError)
  }

  return {
    draft: document.markdown,
    document,
    scrapedPage,
    storageBucket,
    storageKey,
    model: openRouterModel,
  }
}
