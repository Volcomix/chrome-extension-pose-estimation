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
  PosesMessage,
} from './types'

const detectorConfig = {
  modelType: movenet.modelType.MULTIPOSE_LIGHTNING,
  enableSmoothing: true,
  enableTracking: true,
  trackerType: TrackerType.BoundingBox,
}

let detectionStatus: DetectionStatus = 'loading'
let detector: PoseDetector | undefined
let video: HTMLVideoElement | undefined
let animationFrame = -1

chrome.runtime.onMessage.addListener(
  (message: DetectionMessage, _sender, sendResponse) => {
    switch (message.type) {
      case 'RetrieveDetectionStatus':
        sendResponse(detectionStatus)
        break
      case 'StartDetection':
        video = document.querySelectorAll('video')[message.video.index]
        if (detectionStatus === 'loaded') {
          startPoseDetection()
        }
        break
      case 'StopDetection':
        detectionStatus = 'loaded'
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
  if (video) {
    startPoseDetection()
  } else {
    detectionStatus = 'loaded'
    sendStatus()
  }
}

function startPoseDetection() {
  console.debug('Starting pose detection', video)
  detectionStatus = 'running'
  animationFrame = requestAnimationFrame(detectPoses)
  sendStatus()
}

async function detectPoses() {
  if (!detector || !video) {
    return
  }
  if (detectionStatus !== 'running') {
    return
  }
  if (video.readyState < 2) {
    animationFrame = requestAnimationFrame(detectPoses)
    return
  }
  const poses = await detector.estimatePoses(video)
  const message: PosesMessage = { type: 'Poses', poses }
  chrome.runtime.sendMessage(message)
  animationFrame = requestAnimationFrame(detectPoses)
}

function sendStatus() {
  const message: DetectionStatusMessage = {
    type: 'DetectionStatus',
    detectionStatus,
  }
  chrome.runtime.sendMessage(message)
}
