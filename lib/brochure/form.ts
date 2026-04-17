export const brochureSectionDefaults = [
  'Company Overview',
  'What We Do',
  'Why Choose Us',
  'Our Team',
  'Call to Action',
] as const

export const brochureAudienceOptions = [
  'customers',
  'investors',
  'recruits',
] as const

export const brochureToneOptions = [
  'confident',
  'professional',
  'bold',
] as const

export const brochureFormDefaults = {
  companyName: 'Northstar Studio',
  companyUrl: 'https://example.com',
  audience: brochureAudienceOptions[0],
  tone: brochureToneOptions[0],
  sections: brochureSectionDefaults.join('\n'),
}

export type BrochureFormInput = {
  companyName: string
  companyUrl: string
  audience: (typeof brochureAudienceOptions)[number]
  tone: (typeof brochureToneOptions)[number]
  sections: string[]
}

function normalizeSections(value: string) {
  return value
    .split(/[\n,]+/)
    .map((section) => section.trim())
    .filter(Boolean)
}

function readTextField(formData: FormData, key: string, fallback: string) {
  const value = formData.get(key)

  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : fallback
}

function normalizeOption<T extends readonly string[]>(
  value: string,
  options: T,
  fallback: T[number],
) {
  return (options.includes(value as T[number]) ? value : fallback) as T[number]
}

export function parseBrochureFormData(formData: FormData): BrochureFormInput {
  const companyName = readTextField(
    formData,
    'companyName',
    brochureFormDefaults.companyName,
  )
  const companyUrl = readTextField(
    formData,
    'companyUrl',
    brochureFormDefaults.companyUrl,
  )
  const audience = normalizeOption(
    readTextField(formData, 'audience', brochureFormDefaults.audience),
    brochureAudienceOptions,
    brochureFormDefaults.audience,
  )
  const tone = normalizeOption(
    readTextField(formData, 'tone', brochureFormDefaults.tone),
    brochureToneOptions,
    brochureFormDefaults.tone,
  )
  const sections = normalizeSections(
    readTextField(formData, 'sections', brochureFormDefaults.sections),
  )

  return {
    companyName,
    companyUrl,
    audience,
    tone,
    sections,
  }
}
