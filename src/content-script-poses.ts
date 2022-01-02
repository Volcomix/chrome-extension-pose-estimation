import {
  createDetector,
  movenet,
  PoseDetector,
  SupportedModels,
  TrackerType,
} from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import {
  DetectionMessage,
  DetectionStatus,
  DetectionStatusMessage,
  DetectionStatusResponse,
  PosesMessage,
  Video,
} from './types'

const detectorConfig = {
  modelType: movenet.modelType.MULTIPOSE_LIGHTNING,
  enableSmoothing: true,
  enableTracking: true,
  trackerType: TrackerType.BoundingBox,
}

let status: DetectionStatus = 'loading'
let detector: PoseDetector | undefined
let video: Video | undefined
let videoElement: HTMLVideoElement | undefined
let animationFrame = -1

chrome.runtime.onMessage.addListener(
  (message: DetectionMessage, _sender, sendResponse) => {
    switch (message.type) {
      case 'RetrieveDetectionStatus':
        const detectionStatusResponse: DetectionStatusResponse = {
          status,
          video,
        }
        sendResponse(detectionStatusResponse)
        break
      case 'StartDetection':
        video = message.video
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
  },
)

loadPoseDetection()

async function loadPoseDetection() {
  sendStatus()
  detector = await createDetector(SupportedModels.MoveNet, detectorConfig)
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
    const message: PosesMessage = { type: 'Poses', poses }
    chrome.runtime.sendMessage(message)
    animationFrame = requestAnimationFrame(detectPoses)
  } catch (error) {
    console.error(error)
    status = 'error'
    sendStatus()
  }
}

function sendStatus() {
  const message: DetectionStatusMessage = {
    type: 'DetectionStatus',
    status,
    video,
  }
  chrome.runtime.sendMessage(message)
}
