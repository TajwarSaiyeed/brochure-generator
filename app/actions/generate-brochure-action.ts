'use server'

import { generateBrochureDraft } from '@/lib/brochure/workflow'
import { parseBrochureFormData } from '@/lib/brochure/form'
import {
  initialBrochureGenerationState,
  type BrochureGenerationState,
} from '@/lib/brochure/state'

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return 'Unable to generate a brochure draft.'
}

export async function generateBrochureAction(
  _previousState: BrochureGenerationState,
  formData: FormData,
): Promise<BrochureGenerationState> {
  const request = parseBrochureFormData(formData)

  try {
    const result = await generateBrochureDraft(request)

    return {
      draft: result.draft,
      error: '',
      status: 'done',
      lastUpdated: `Updated ${new Date().toLocaleTimeString()}`,
    }
  } catch (error) {
    return {
      ...initialBrochureGenerationState,
      draft: '',
      error: getErrorMessage(error),
      status: 'error',
      lastUpdated: 'The last request did not complete.',
    }
  }
}
