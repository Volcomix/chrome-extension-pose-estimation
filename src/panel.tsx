import { h, render } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import useActiveTab from './hooks/useActiveTab'
import useDetectionStatus from './hooks/useDetectionStatus'
import './panel.css'
import { DetectionMessage, InitDevtoolsMessage } from './types'
import { renderObjects } from './utils/object'
import { renderPoses } from './utils/pose'

const port = chrome.runtime.connect({ name: 'devtools' })
const message: InitDevtoolsMessage = {
  type: 'InitDevtools',
  tabId: chrome.devtools.inspectedWindow.tabId,
}
port.postMessage(message)

function Panel() {
  const activeTab = useActiveTab()
  const detectionStatus = useDetectionStatus(activeTab, port)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>()
  const [framerate, setFramerate] = useState(0)
  const previousTimeRef = useRef(0)
  const frameCountRef = useRef(0)

  const video = detectionStatus?.video

  function handleMessage(message: DetectionMessage) {
    if (!ctx || !video) {
      return
    }
    if (message.type !== 'Poses' && message.type !== 'Objects') {
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
    if (message.type === 'Poses') {
      renderPoses(ctx, message.poses)
    } else if (message.type === 'Objects') {
      renderObjects(ctx, message.objects)
    }
  }

  useEffect(() => {
    port.onMessage.addListener(handleMessage)
    return () => port.onMessage.removeListener(handleMessage)
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
