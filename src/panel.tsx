import { h, render } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import useActiveTab from './hooks/useActiveTab'
import useDetectionStatus from './hooks/useDetectionStatus'
import './panel.css'
import { DetectionMessage } from './types'

function Panel() {
  const activeTab = useActiveTab()
  const detectionStatus = useDetectionStatus(activeTab)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>()

  const video = detectionStatus?.video

  function handleMessage(message: DetectionMessage) {
    if (!ctx || !video) {
      return
    }
    if (message.type !== 'Poses') {
      return
    }
    ctx.clearRect(0, 0, video.width, video.height)
    ctx.fillStyle = 'red'
    ctx.fillRect(0, 0, video.width, video.height)
  }

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [ctx, video])

  return (
    <div className="Panel">
      <canvas
        className="Panel-canvas"
        ref={(canvas) => canvas && setCtx(canvas.getContext('2d')!)}
        width={video?.width}
        height={video?.height}
      />
      <span className="Panel-framerate"></span>
    </div>
  )
}

render(<Panel />, document.body)
