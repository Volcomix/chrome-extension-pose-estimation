import { useEffect, useState } from 'preact/hooks'
import { DetectionStatus, DetectionStatusMessage, MessageType } from '../types'

export default function useDetectionStatus(
  activeTab: chrome.tabs.Tab | undefined,
) {
  const [detectionStatus, setDetectionStatus] = useState<DetectionStatus>()

  async function loadDetectionStatus() {
    if (!activeTab) {
      return
    }
    const response = await new Promise<DetectionStatus | undefined>((resolve) =>
      chrome.tabs.sendMessage(
        activeTab.id!,
        { type: MessageType.DetectionStatus },
        resolve,
      ),
    )
    if (!response) {
      console.debug('Detection content script not injected')
      // Prevents chrome from showing an error message
      chrome.runtime.lastError
      return
    }
    console.debug('Detection status retrieved:', response)
    setDetectionStatus(response)
  }

  function handleMessage(message: DetectionStatusMessage) {
    if (message.type !== MessageType.DetectionStatus) {
      return
    }
    console.debug('Detection status received:', message.detectionStatus)
    setDetectionStatus(message.detectionStatus)
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
