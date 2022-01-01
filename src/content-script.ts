import { DetectionStatus, MessageType } from './types'

let detectionStatus: DetectionStatus = 'loading'

chrome.runtime.sendMessage({
  type: MessageType.DetectionStatus,
  detectionStatus,
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case MessageType.DetectionStatus:
      sendResponse(detectionStatus)
      break
  }
})
