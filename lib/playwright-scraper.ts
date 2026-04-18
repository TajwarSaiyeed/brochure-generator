import { chromium, type Browser, type BrowserContext } from 'playwright'
import { getChromiumLaunchOptions } from '@/lib/chromium'

export async function renderBrochureSourceHtml(sourceUrl: string) {
  let parsedUrl: URL

  try {
    parsedUrl = new URL(sourceUrl)
  } catch {
    return null
  }

  let browser: Browser | undefined
  let context: BrowserContext | undefined

  try {
    browser = await chromium.launch(getChromiumLaunchOptions())

    context = await browser.newContext({
      userAgent: 'Brochure Forge Scraper/1.0',
    })

    const page = await context.newPage()

    await page.goto(parsedUrl.toString(), {
      waitUntil: 'networkidle',
      timeout: 15_000,
    })

    const html = await page.content()

    return html
  } catch {
    return null
  } finally {
    if (context) {
      await context.close().catch(() => undefined)
    }

    if (browser) {
      await browser.close().catch(() => undefined)
    }
  }
}
