import { load, ObjectDetection } from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import {
  DetectionMessage,
  DetectionStatus,
  DetectionStatusMessage,
  DetectionStatusResponse,
  ObjectsMessage,
  Video,
} from './types'

let status: DetectionStatus = 'loading'
let detector: ObjectDetection | undefined
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
          startObjectDetection()
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

loadObjectDetection()

async function loadObjectDetection() {
  sendStatus()
  detector = await load()
  if (videoElement) {
    startObjectDetection()
  } else {
    status = 'loaded'
    sendStatus()
  }
}

function startObjectDetection() {
  console.debug('Starting object detection', videoElement)
  status = 'running'
  animationFrame = requestAnimationFrame(detectObjects)
  sendStatus()
}

async function detectObjects() {
  if (!detector || !videoElement) {
    return
  }
  if (status !== 'running') {
    return
  }
  if (videoElement.readyState < 2) {
    animationFrame = requestAnimationFrame(detectObjects)
    return
  }
  try {
    const objects = await detector.detect(videoElement)
    const message: ObjectsMessage = { type: 'Objects', objects }
    chrome.runtime.sendMessage(message)
    animationFrame = requestAnimationFrame(detectObjects)
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
