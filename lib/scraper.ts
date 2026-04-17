import { load } from 'cheerio'
import { renderBrochureSourceHtml } from '@/lib/playwright-scraper'

export type ScrapedLink = {
  url: string
  anchorText: string
}

export type ScrapedPage = {
  url: string
  title: string
  description: string
  bodyText: string
  links: ScrapedLink[]
}

const blockedSelectors = [
  'script',
  'style',
  'noscript',
  'svg',
  'canvas',
  'iframe',
  'form',
  'header',
  'footer',
  'nav',
  'aside',
  'template',
]

const bodySelectors = 'h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption'

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function countWords(value: string) {
  return collapseWhitespace(value).split(' ').filter(Boolean).length
}

function truncateText(value: string, maxLength: number) {
  const collapsed = collapseWhitespace(value)

  if (collapsed.length <= maxLength) {
    return collapsed
  }

  return `${collapsed.slice(0, maxLength).trim()}…`
}

function normalizeTargetUrl(baseUrl: URL, href: string) {
  const trimmedHref = href.trim()

  if (
    !trimmedHref ||
    trimmedHref.startsWith('#') ||
    trimmedHref.startsWith('mailto:') ||
    trimmedHref.startsWith('tel:') ||
    trimmedHref.startsWith('javascript:')
  ) {
    return null
  }

  try {
    const candidateUrl = new URL(trimmedHref, baseUrl)

    if (candidateUrl.hostname !== baseUrl.hostname) {
      return null
    }

    candidateUrl.hash = ''
    candidateUrl.search = ''
    candidateUrl.pathname =
      candidateUrl.pathname === '/'
        ? '/'
        : candidateUrl.pathname.replace(/\/+$/, '')

    return candidateUrl.toString()
  } catch {
    return null
  }
}

function extractTitle($: ReturnType<typeof load>) {
  const title = collapseWhitespace($('title').first().text())

  if (title) {
    return title
  }

  const ogTitle = collapseWhitespace(
    $('meta[property="og:title"]').attr('content') ?? '',
  )

  return ogTitle
}

function extractDescription($: ReturnType<typeof load>) {
  const selectors = [
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
  ]

  for (const selector of selectors) {
    const value = collapseWhitespace($(selector).attr('content') ?? '')

    if (value) {
      return value
    }
  }

  return ''
}

function extractBodyText($: ReturnType<typeof load>) {
  const preferredRoot = $('main').length
    ? $('main')
    : $('article').length
      ? $('article')
      : $('body')

  const lines: string[] = []

  preferredRoot.find(bodySelectors).each((_, element) => {
    const value = collapseWhitespace($(element).text())

    if (!value) {
      return
    }

    if (lines[lines.length - 1] !== value) {
      lines.push(value)
    }
  })

  if (!lines.length) {
    const fallbackText = collapseWhitespace(preferredRoot.text())

    if (fallbackText) {
      lines.push(fallbackText)
    }
  }

  return lines.join('\n\n').trim()
}

function extractLinks($: ReturnType<typeof load>, baseUrl: URL) {
  const links = new Map<string, string>()

  $('a[href]').each((_, element) => {
    if (links.size >= 20) {
      return false
    }

    const href = $(element).attr('href') ?? ''
    const normalizedUrl = normalizeTargetUrl(baseUrl, href)

    if (!normalizedUrl || links.has(normalizedUrl)) {
      return
    }

    const anchorText = collapseWhitespace($(element).text())
    links.set(normalizedUrl, anchorText)
    return undefined
  })

  return Array.from(links, ([url, anchorText]) => ({ url, anchorText }))
}

function extractScrapedPage(sourceUrl: URL, html: string): ScrapedPage {
  const $ = load(html)

  $(blockedSelectors.join(',')).remove()

  return {
    url: sourceUrl.toString(),
    title: extractTitle($),
    description: extractDescription($),
    bodyText: extractBodyText($),
    links: extractLinks($, sourceUrl),
  }
}

export function formatScrapedPageContext(page: ScrapedPage) {
  const lines = [
    `URL: ${page.url}`,
    page.title ? `Title: ${page.title}` : '',
    page.description ? `Description: ${page.description}` : '',
    page.bodyText ? `Body text:\n${truncateText(page.bodyText, 8000)}` : '',
  ].filter(Boolean)

  if (page.links.length) {
    const linkLines = page.links.map((link) =>
      link.anchorText ? `- ${link.url} (${link.anchorText})` : `- ${link.url}`,
    )

    lines.push(`Internal links:\n${linkLines.join('\n')}`)
  }

  return lines.join('\n\n')
}

async function scrapeBrochureSourceWithFetch(sourceUrl: URL) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12_000)

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'Brochure Forge Scraper/1.0',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      return null
    }

    const html = await response.text()
    return extractScrapedPage(sourceUrl, html)
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function scrapeBrochureSource(sourceUrl: string) {
  let parsedUrl: URL

  try {
    parsedUrl = new URL(sourceUrl)
  } catch {
    return null
  }

  const primaryPage = await scrapeBrochureSourceWithFetch(parsedUrl)

  if (primaryPage && countWords(primaryPage.bodyText) >= 200) {
    return primaryPage
  }

  const renderedHtml = await renderBrochureSourceHtml(parsedUrl.toString())

  if (!renderedHtml) {
    return primaryPage
  }

  try {
    return extractScrapedPage(parsedUrl, renderedHtml)
  } catch {
    return primaryPage
  }
}
