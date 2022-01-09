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

export type PageMessage = { from?: 'page' }

export type InitDevtoolsMessage = {
  type: 'InitDevtools'
  tabId: number
}

export type RetrieveDetectionStatusMessage = {
  type: 'RetrieveDetectionStatus'
}

export type DetectionStatusMessage = PageMessage & {
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

export type PosesMessage = PageMessage & {
  type: 'Poses'
  poses: Pose[]
}

export type ObjectsMessage = {
  type: 'Objects'
  objects: DetectedObject[]
}

export type InitScriptMessage = PageMessage & {
  type: 'InitScript'
}

export type ExtensionDetailsMessage = {
  type: 'ExtensionDetails'
  extensionId: string
}

export type DetectionMessage =
  | InitDevtoolsMessage
  | RetrieveDetectionStatusMessage
  | DetectionStatusMessage
  | StartDetectionMessage
  | StopDetectionMessage
  | PosesMessage
  | ObjectsMessage
  | InitScriptMessage
  | ExtensionDetailsMessage

export type DetectionStatusResponse = {
  status: DetectionStatus
  video: Video | undefined
}
