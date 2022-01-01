export type DetectionStatus = 'loading' | 'loaded' | 'running'

export type Video = {
  frameId: number
  src: string
  width: number
  height: number
  playing: boolean
}

export type RetrieveDetectionStatusMessage = {
  type: 'RetrieveDetectionStatus'
}

export type DetectionStatusMessage = {
  type: 'DetectionStatus'
  detectionStatus: DetectionStatus
}

export type StartDetectionMessage = {
  type: 'StartDetection'
}

export type StopDetectionMessage = {
  type: 'StopDetection'
}

export type DetectionMessage =
  | RetrieveDetectionStatusMessage
  | DetectionStatusMessage
  | StartDetectionMessage
  | StopDetectionMessage
