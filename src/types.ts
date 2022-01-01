export type DetectionStatus = 'loading' | 'loaded' | 'running'

export type Video = {
  frameId: number
  src: string
  width: number
  height: number
  playing: boolean
}

export enum MessageType {
  RetrieveDetectionStatus = 'RetrieveDetectionStatus',
  DetectionStatus = 'DetectionStatus',
  StartDetection = 'StartDetection',
  StopDetection = 'StopDetection',
}

export type RetrieveDetectionStatusMessage = {
  type: MessageType.RetrieveDetectionStatus
}

export type DetectionStatusMessage = {
  type: MessageType.DetectionStatus
  detectionStatus: DetectionStatus
}

export type StartDetectionMessage = {
  type: MessageType.StartDetection
}

export type StopDetectionMessage = {
  type: MessageType.StopDetection
}

export type DetectionMessage =
  | RetrieveDetectionStatusMessage
  | DetectionStatusMessage
  | StartDetectionMessage
  | StopDetectionMessage
