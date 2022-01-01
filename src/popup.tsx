import { render } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { MessageType } from './message'

function Popup() {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab>()

  async function initActiveTab() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    })
    setActiveTab(tab)
  }

  async function loadDetectionStatus() {
    if (!activeTab) {
      return
    }
    const response = await new Promise((resolve) =>
      chrome.tabs.sendMessage(
        activeTab.id!,
        { type: MessageType.DetectionStatus },
        resolve,
      ),
    )
    if (response) {
      console.debug('Detection status loaded', response)
    } else {
      // Prevents chrome from showing an error message
      chrome.runtime.lastError
      console.debug('Detection content script not injected')
    }
  }

  useEffect(() => {
    initActiveTab()
  }, [])

  useEffect(() => {
    loadDetectionStatus()
  }, [activeTab])

  return activeTab ? <span>Loaded</span> : <progress />
}

render(<Popup />, document.body)
