import { DetectionMessage } from './types'

const connections: { [tabId: number]: chrome.runtime.Port } = {}

chrome.runtime.onConnect.addListener((port) => {
  function handleMessage(message: DetectionMessage) {
    if (message.type !== 'InitDevtools') {
      return
    }
    console.debug('Devtools connected', message)
    connections[message.tabId] = port
  }

  port.onMessage.addListener(handleMessage)

  port.onDisconnect.addListener((port) => {
    port.onMessage.removeListener(handleMessage)

    for (const tabId of Object.keys(connections).map(Number)) {
      if (connections[tabId] === port) {
        console.debug('Devtools disconnected', { tabId })
        delete connections[tabId]
        break
      }
    }
  })
})

chrome.runtime.onMessage.addListener((message: DetectionMessage, sender) => {
  const tabId = sender.tab?.id
  if (tabId === undefined) {
    return
  }

  if (tabId in connections) {
    connections[tabId].postMessage(message)
  }

  if (message.type !== 'DetectionStatus') {
    return
  }
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
