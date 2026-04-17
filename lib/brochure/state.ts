export type BrochureGenerationStatus = 'idle' | 'generating' | 'done' | 'error'

export type BrochureGenerationState = {
  draft: string
  error: string
  status: BrochureGenerationStatus
  lastUpdated: string
}

export const initialBrochureGenerationState: BrochureGenerationState = {
  draft: '',
  error: '',
  status: 'idle',
  lastUpdated: 'Awaiting first draft.',
}
