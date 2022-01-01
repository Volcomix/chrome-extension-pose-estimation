import { render } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import './popup.css'
import { DetectionStatus, MessageType, Video } from './types'

const videoSrcMaxLength = 60

function Popup() {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab>()
  const [detectionStatus, setDetectionStatus] = useState<DetectionStatus>()
  const [videos, setVideos] = useState<Video[]>()

  async function loadActiveTab() {
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

  async function findVideos() {
    if (!activeTab) {
      return
    }
    if (detectionStatus !== undefined && detectionStatus !== 'loaded') {
      return
    }
    try {
      const injectionResults = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id!, allFrames: true },
        func: () =>
          [...document.querySelectorAll('video')].map<Video>(
            (videoElement, videoIndex) => ({
              frameId: -1,
              index: videoIndex,
              src: videoElement.src,
              width: videoElement.videoWidth ?? videoElement.width,
              height: videoElement.videoHeight ?? videoElement.height,
              playing: !videoElement.paused,
            }),
          ),
      })
      const results = injectionResults.flatMap<Video>((frameResult) =>
        frameResult.result.map((video: Video) => ({
          ...video,
          frameId: frameResult.frameId,
        })),
      )
      setVideos(results)
    } catch (error) {
      console.error(error)
      setVideos([])
    }
  }

  useEffect(() => {
    loadActiveTab()
  }, [])

  useEffect(() => {
    loadDetectionStatus()
  }, [activeTab])

  useEffect(() => {
    findVideos()
  }, [activeTab, detectionStatus])

  if (!activeTab || !videos) {
    return <progress />
  }
  if (videos.length === 0) {
    return <span className="Popup-noVideos">No videos found</span>
  }
  return (
    <select>
      {videos.map((video, i) => (
        <option key={i} value={i}>
          {video.playing && '▸ '}
          {video.src.substr(0, videoSrcMaxLength) || 'video'}
          {video.src.length > videoSrcMaxLength && '…'}
          {` (${video.width}x${video.height})`}
        </option>
      ))}
    </select>
  )
}

render(<Popup />, document.body)
