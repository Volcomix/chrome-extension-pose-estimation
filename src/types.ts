export type Video = {
  index: number
  src: string
  width: number
  height: number
  playing: boolean
}

export type DetectionStatus = 'loading' | 'loaded' | 'running'

export type RetrieveDetectionStatusMessage = {
  type: 'RetrieveDetectionStatus'
}

export type DetectionStatusMessage = {
  type: 'DetectionStatus'
  detectionStatus: DetectionStatus
}

export type StartDetectionMessage = {
  type: 'StartDetection'
  video: Video
}

export type StopDetectionMessage = {
  type: 'StopDetection'
}

export type DetectionMessage =
  | RetrieveDetectionStatusMessage
  | DetectionStatusMessage
  | StartDetectionMessage
  | StopDetectionMessage
