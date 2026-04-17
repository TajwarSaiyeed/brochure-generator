import { prisma } from '@/lib/db'

type RecordBrochureRunInput = {
  companyName: string
  companyUrl: string
  audience: string
  tone: string
  sections: string[]
  markdown: string
  model: string
  storageBucket: string | null
  storageKey: string | null
}

export async function recordBrochureRun({
  companyName,
  companyUrl,
  audience,
  tone,
  sections,
  markdown,
  model,
  storageBucket,
  storageKey,
}: RecordBrochureRunInput) {
  const result = await prisma.brochureRun.create({
    data: {
      companyName,
      companyUrl,
      audience,
      tone,
      sections,
      markdownOutput: markdown,
      model,
      storageBucket,
      storageKey,
    },
    select: {
      id: true,
    },
  })

  return result.id
}
