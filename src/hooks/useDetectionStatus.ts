import { useEffect, useState } from 'preact/hooks'
import {
  DetectionMessage,
  DetectionStatusResponse,
  RetrieveDetectionStatusMessage,
} from '../types'

export default function useDetectionStatus(
  activeTab: chrome.tabs.Tab | undefined,
) {
  const [detectionStatus, setDetectionStatus] =
    useState<DetectionStatusResponse>()

  async function loadDetectionStatus() {
    if (!activeTab) {
      return
    }
    const message: RetrieveDetectionStatusMessage = {
      type: 'RetrieveDetectionStatus',
    }
    const response = await new Promise<DetectionStatusResponse | undefined>(
      (resolve) => chrome.tabs.sendMessage(activeTab.id!, message, resolve),
    )
    if (!response) {
      console.debug('Detection content script not injected')
      // Prevents chrome from showing an error message
      chrome.runtime.lastError
      return
    }
    console.debug('Detection status retrieved', response)
    setDetectionStatus(response)
  }

  function handleMessage(message: DetectionMessage) {
    if (message.type !== 'DetectionStatus') {
      return
    }
    console.debug('Detection status received', message)
    setDetectionStatus({
      status: message.status,
      video: message.video,
    })
  }

  useEffect(() => {
    loadDetectionStatus()
  }, [activeTab])

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [])

  return detectionStatus
}
