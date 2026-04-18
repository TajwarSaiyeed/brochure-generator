import fs from 'node:fs'
import { type LaunchOptions } from 'playwright'

const chromiumArgs = ['--no-sandbox', '--disable-dev-shm-usage']

function resolveChromiumExecutablePath() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?.trim(),
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
  ].filter((value): value is string => Boolean(value))

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  return undefined
}

export function getChromiumLaunchOptions(): LaunchOptions {
  const executablePath = resolveChromiumExecutablePath()

  return {
    headless: true,
    args: chromiumArgs,
    ...(executablePath ? { executablePath } : {}),
  }
}
