import { chromium, type Browser, type BrowserContext } from 'playwright'

const browserLaunchOptions = {
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? '/usr/bin/chromium',
}

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
    browser = await chromium.launch(browserLaunchOptions)

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
