import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import {
  DetectionMessage,
  DetectionStatus,
  DetectionStatusMessage,
  MessageType,
} from './types'

const detectorConfig = {
  modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
  enableSmoothing: true,
  enableTracking: true,
  trackerType: poseDetection.TrackerType.BoundingBox,
}

let detectionStatus: DetectionStatus = 'loading'
let detector: poseDetection.PoseDetector | undefined

chrome.runtime.onMessage.addListener(
  (message: DetectionMessage, _sender, sendResponse) => {
    switch (message.type) {
      case MessageType.RetrieveDetectionStatus:
        sendResponse(detectionStatus)
        break
      case MessageType.StartDetection:
        detectionStatus = 'running'
        sendStatus()
        break
      case MessageType.StopDetection:
        detectionStatus = 'loaded'
        sendStatus()
        break
    }
  },
)

loadPoseDetection()

async function loadPoseDetection() {
  sendStatus()
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig,
  )
  detectionStatus = 'running'
  sendStatus()
}

function sendStatus() {
  const message: DetectionStatusMessage = {
    type: MessageType.DetectionStatus,
    detectionStatus,
  }
  chrome.runtime.sendMessage(message)
}
