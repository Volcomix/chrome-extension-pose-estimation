export enum MessageType {
  DetectionStatus = 'DetectionStatus',
}

export type DetectionStatus =
  | 'loading'
  | 'loaded'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'error'

export type Video = {
  frameId: number
  src: string
  width: number
  height: number
  playing: boolean
}
