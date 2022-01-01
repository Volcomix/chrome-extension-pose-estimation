export type DetectionStatus = 'loading' | 'loaded' | 'running'

export type Video = {
  frameId: number
  src: string
  width: number
  height: number
  playing: boolean
}

export enum MessageType {
  DetectionStatus = 'DetectionStatus',
  StartDetection = 'StartDetection',
  StopDetection = 'StopDetection',
}

export type DetectionMessage = {
  type: MessageType
}

export type DetectionStatusMessage = DetectionMessage & {
  detectionStatus: DetectionStatus
}
