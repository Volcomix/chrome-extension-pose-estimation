import { DetectionMessage, PageMessage } from './types'

chrome.runtime.onMessage.addListener((message: DetectionMessage) => {
  window.postMessage(message)
})

window.addEventListener('message', (event: MessageEvent<PageMessage>) => {
  if (event.source != window) {
    return
  }
  if (event.data.from !== 'page') {
    return
  }
  chrome.runtime.sendMessage(event.data)
})
