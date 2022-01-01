import { h, render } from 'preact'
import { useEffect } from 'preact/hooks'
import useActiveTab from './hooks/useActiveTab'
import useDetectionStatus from './hooks/useDetectionStatus'
import './panel.css'
import { DetectionMessage } from './types'

function Panel() {
  const activeTab = useActiveTab()
  const detectionStatus = useDetectionStatus(activeTab)

  const video = detectionStatus?.video

  function handleMessage(message: DetectionMessage) {}

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [])

  return (
    <div className="Panel">
      <canvas
        className="Panel-canvas"
        width={video?.width}
        height={video?.height}
      />
      <span className="Panel-framerate"></span>
    </div>
  )
}

render(<Panel />, document.body)
