import { h, render } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import useActiveTab from './hooks/useActiveTab'
import useDetectionStatus from './hooks/useDetectionStatus'
import './panel.css'
import { DetectionMessage } from './types'
import { renderPoses } from './utils/pose'

function Panel() {
  const activeTab = useActiveTab()
  const detectionStatus = useDetectionStatus(activeTab)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>()
  const [framerate, setFramerate] = useState(0)
  const previousTimeRef = useRef(0)
  const frameCountRef = useRef(0)

  const video = detectionStatus?.video

  function handleMessage(message: DetectionMessage) {
    if (!ctx || !video) {
      return
    }
    if (message.type !== 'Poses') {
      return
    }
    const time = Date.now()
    frameCountRef.current++
    if (time >= previousTimeRef.current + 1000) {
      setFramerate(
        (1000 * frameCountRef.current) / (time - previousTimeRef.current),
      )
      previousTimeRef.current = time
      frameCountRef.current = 0
    }
    renderPoses(ctx, message.poses)
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
      <span className="Panel-framerate">{Math.round(framerate)} fps</span>
    </div>
  )
}

render(<Panel />, document.body)
