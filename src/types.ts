import { Pose } from '@tensorflow-models/pose-detection'

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
  status: DetectionStatus
  video: Video | undefined
}

export type StartDetectionMessage = {
  type: 'StartDetection'
  video: Video
}

export type StopDetectionMessage = {
  type: 'StopDetection'
}

export type PosesMessage = {
  type: 'Poses'
  poses: Pose[]
}

export type DetectionMessage =
  | RetrieveDetectionStatusMessage
  | DetectionStatusMessage
  | StartDetectionMessage
  | StopDetectionMessage
  | PosesMessage

export type DetectionStatusResponse = {
  status: DetectionStatus
  video: Video | undefined
}
