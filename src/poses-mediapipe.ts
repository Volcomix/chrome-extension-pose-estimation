import {
  BlazePoseMediaPipeModelConfig,
  createDetector,
  PoseDetector,
  SupportedModels,
} from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import {
  DetectionMessage,
  DetectionStatus,
  DetectionStatusMessage,
  PosesMessage,
  Video,
} from './types'

const detectorConfig: BlazePoseMediaPipeModelConfig = {
  runtime: 'mediapipe',
  solutionPath:
    'chrome-extension://eiikgpbcednodfoofgmddoabkbffamho/node_modules/@mediapipe/pose',
}

let status: DetectionStatus = 'loading'
let detector: PoseDetector | undefined
let video: Video | undefined
let videoElement: HTMLVideoElement | undefined
let animationFrame = -1

window.addEventListener('message', (event: MessageEvent<DetectionMessage>) => {
  if (event.source != window) {
    return
  }
  switch (event.data.type) {
    case 'RetrieveDetectionStatus':
      sendStatus()
      break
    case 'StartDetection':
      video = event.data.video
      videoElement = document.querySelectorAll('video')[video.index]
      if (status === 'loaded' || status === 'error') {
        startPoseDetection()
      }
      break
    case 'StopDetection':
      status = 'loaded'
      cancelAnimationFrame(animationFrame)
      sendStatus()
      break
  }
})

loadPoseDetection()

async function loadPoseDetection() {
  sendStatus()
  detector = await createDetector(SupportedModels.BlazePose, detectorConfig)
  if (videoElement) {
    startPoseDetection()
  } else {
    status = 'loaded'
    sendStatus()
  }
}

function startPoseDetection() {
  console.debug('Starting pose detection', videoElement)
  status = 'running'
  animationFrame = requestAnimationFrame(detectPoses)
  sendStatus()
}

async function detectPoses() {
  if (!detector || !videoElement) {
    return
  }
  if (status !== 'running') {
    return
  }
  if (videoElement.readyState < 2) {
    animationFrame = requestAnimationFrame(detectPoses)
    return
  }
  try {
    const poses = await detector.estimatePoses(videoElement)
    const message: PosesMessage = { from: 'page', type: 'Poses', poses }
    window.postMessage(message)
    animationFrame = requestAnimationFrame(detectPoses)
  } catch (error) {
    console.error(error)
    status = 'error'
    sendStatus()
  }
}

function sendStatus() {
  const message: DetectionStatusMessage = {
    from: 'page',
    type: 'DetectionStatus',
    status,
    video,
  }
  window.postMessage(message)
}
