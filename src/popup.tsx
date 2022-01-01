import { render } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import useActiveTab from './hooks/useActiveTab'
import useDetectionStatus from './hooks/useDetectionStatus'
import useVideos from './hooks/useVideos'
import './popup.css'
import { StartDetectionMessage, StopDetectionMessage } from './types'

const videoSrcMaxLength = 60

function Popup() {
  const activeTab = useActiveTab()
  const detectionStatus = useDetectionStatus(activeTab)
  const videos = useVideos(activeTab, detectionStatus)
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0)

  useEffect(() => {
    if (!videos?.length) {
      return
    }
    let candidateVideos = videos.filter((video) => video.playing)
    if (candidateVideos.length === 0) {
      candidateVideos = [...videos]
    }
    candidateVideos.sort((a, b) => b.width - a.width)
    setSelectedVideoIndex(candidateVideos[0].index)
  }, [videos])

  if (!videos) {
    return <progress />
  }
  if (videos.length === 0) {
    return <span className="Popup-noVideos">No videos found</span>
  }

  async function handleDetectionButtonClick() {
    if (!activeTab || !videos) {
      return
    }
    const selectedVideo = videos[selectedVideoIndex]
    switch (detectionStatus) {
      case undefined:
        await chrome.scripting.executeScript({
          target: { tabId: activeTab.id! },
          files: ['out/content-script.js'],
        })
      case 'loaded':
        const startDetectionMessage: StartDetectionMessage = {
          type: 'StartDetection',
          video: selectedVideo,
        }
        chrome.tabs.sendMessage(activeTab.id!, startDetectionMessage)
        break
      case 'running':
        const stopDetectionMessage: StopDetectionMessage = {
          type: 'StopDetection',
        }
        chrome.tabs.sendMessage(activeTab.id!, stopDetectionMessage)
        break
    }
  }

  return (
    <div className="Popup">
      <select
        className="Popup-videos"
        disabled={detectionStatus !== undefined && detectionStatus !== 'loaded'}
        value={selectedVideoIndex}
        onInput={(event) =>
          setSelectedVideoIndex(
            Number((event.target as HTMLSelectElement).value),
          )
        }
      >
        {videos.map((video) => (
          <option key={video.index} value={video.index}>
            {video.playing && '▸ '}
            {video.src.substr(0, videoSrcMaxLength) || 'video'}
            {video.src.length > videoSrcMaxLength && '…'}
            {` (${video.width}x${video.height})`}
          </option>
        ))}
      </select>
      <button
        disabled={detectionStatus === 'loading'}
        onClick={handleDetectionButtonClick}
      >
        {(detectionStatus === undefined || detectionStatus === 'loaded') &&
          'Start detection'}
        {detectionStatus === 'loading' && 'Starting detection...'}
        {detectionStatus === 'running' && 'Stop detection'}
      </button>
    </div>
  )
}

render(<Popup />, document.body)
