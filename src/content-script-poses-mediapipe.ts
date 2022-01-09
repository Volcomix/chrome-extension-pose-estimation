import { DetectionMessage, ExtensionDetailsMessage } from './types'

chrome.runtime.onMessage.addListener((message: DetectionMessage) => {
  window.postMessage(message)
})

window.addEventListener('message', (event: MessageEvent<DetectionMessage>) => {
  if (event.source != window) {
    return
  }
  if (!('from' in event.data) || event.data.from !== 'page') {
    return
  }
  if (event.data.type === 'InitScript') {
    const message: ExtensionDetailsMessage = {
      type: 'ExtensionDetails',
      extensionId: chrome.runtime.id,
    }
    window.postMessage(message)
    return
  }
  chrome.runtime.sendMessage(event.data)
})
