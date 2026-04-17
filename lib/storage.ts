import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

type BrochureArtifactInput = {
  companyName: string
  companyUrl: string
  markdown: string
}

type BrochureArtifactResult = {
  bucket: string
  key: string
}

const storageEndpoint = process.env.MINIO_ENDPOINT
const storageBucket = process.env.MINIO_BUCKET
const storageRegion = process.env.MINIO_REGION ?? 'us-east-1'
const storageAccessKey = process.env.MINIO_ACCESS_KEY
const storageSecretKey = process.env.MINIO_SECRET_KEY

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)

  return slug || 'brochure'
}

function createStorageClient() {
  if (
    !storageEndpoint ||
    !storageBucket ||
    !storageAccessKey ||
    !storageSecretKey
  ) {
    return null
  }

  return new S3Client({
    region: storageRegion,
    endpoint: storageEndpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: storageAccessKey,
      secretAccessKey: storageSecretKey,
    },
  })
}

export async function storeBrochureArtifact({
  companyName,
  companyUrl,
  markdown,
}: BrochureArtifactInput): Promise<BrochureArtifactResult | null> {
  const client = createStorageClient()

  if (!client || !storageBucket) {
    return null
  }

  const key = [
    'brochures',
    slugify(companyName),
    new Date().toISOString().replace(/[:.]/g, '-'),
    `${slugify(companyUrl)}.md`,
  ].join('/')

  await client.send(
    new PutObjectCommand({
      Bucket: storageBucket,
      Key: key,
      Body: markdown,
      ContentType: 'text/markdown; charset=utf-8',
      Metadata: {
        companyName,
        sourceUrl: companyUrl,
      },
    }),
  )

  return {
    bucket: storageBucket,
    key,
  }
}
