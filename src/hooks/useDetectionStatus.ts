import { useEffect, useState } from 'preact/hooks'
import { DetectionStatus, MessageType } from '../types'
import useActiveTab from './useActiveTab'

export default function useDetectionStatus() {
  const activeTab = useActiveTab()
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
    console.debug('Detection status loaded', response)
    setDetectionStatus(response)
  }

  useEffect(() => {
    loadDetectionStatus()
  }, [activeTab])

  return detectionStatus
}
