import { useEffect, useState } from 'preact/hooks'

export default function useActiveTab() {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab>()

  async function loadActiveTab() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    })
    setActiveTab(tab)
  }

  useEffect(() => {
    loadActiveTab()
  }, [])

  return activeTab
}
