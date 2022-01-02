import { DetectionMessage } from './types'

chrome.runtime.onMessage.addListener((message: DetectionMessage, sender) => {
  if (message.type !== 'DetectionStatus') {
    return
  }
  const tabId = sender.tab?.id
  switch (message.status) {
    case 'running':
      chrome.action.setBadgeText({ tabId, text: ' ▶' })
      chrome.action.setBadgeBackgroundColor({ tabId, color: '#257D28' })
      break
    case 'error':
      chrome.action.setBadgeText({ tabId, text: '▬' })
      chrome.action.setBadgeBackgroundColor({ tabId, color: '#B31010' })
      break
    default:
      chrome.action.setBadgeText({ tabId, text: '' })
  }
})
