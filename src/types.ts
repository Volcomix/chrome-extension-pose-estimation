import { DetectedObject } from '@tensorflow-models/coco-ssd'
import { Pose } from '@tensorflow-models/pose-detection'

export type Video = {
  index: number
  src: string
  width: number
  height: number
  playing: boolean
}

export type DetectionStatus = 'loading' | 'loaded' | 'running' | 'error'

export type InitDevtoolsMessage = {
  type: 'InitDevtools'
  tabId: number
}

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

export type ObjectsMessage = {
  type: 'Objects'
  objects: DetectedObject[]
}

export type DetectionMessage =
  | InitDevtoolsMessage
  | RetrieveDetectionStatusMessage
  | DetectionStatusMessage
  | StartDetectionMessage
  | StopDetectionMessage
  | PosesMessage
  | ObjectsMessage

export type DetectionStatusResponse = {
  status: DetectionStatus
  video: Video | undefined
}
