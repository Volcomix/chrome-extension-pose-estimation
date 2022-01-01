export type DetectionStatus =
  | 'loading'
  | 'loaded'
  | 'starting'
  | 'running'
  | 'stopping'

export type Video = {
  frameId: number
  src: string
  width: number
  height: number
  playing: boolean
}

export enum MessageType {
  DetectionStatus = 'DetectionStatus',
}

export type DetectionMessage = {
  type: MessageType
}

export type DetectionStatusMessage = DetectionMessage & {
  detectionStatus: DetectionStatus
}
