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
  const [selectedVideo, setSelectedVideo] = useState(0)

  useEffect(() => {
    if (!videos?.length) {
      return
    }
    let candidateVideos = videos.filter((video) => video.playing)
    if (candidateVideos.length === 0) {
      candidateVideos = [...videos]
    }
    candidateVideos.sort((a, b) => b.width - a.width)
    setSelectedVideo(videos.indexOf(candidateVideos[0]))
  }, [videos])

  if (!videos) {
    return <progress />
  }
  if (videos.length === 0) {
    return <span className="Popup-noVideos">No videos found</span>
  }

  function handleDetectionButtonClick() {
    if (!activeTab || !videos) {
      return
    }
    switch (detectionStatus) {
      case undefined:
        const video = videos[selectedVideo]
        chrome.scripting.executeScript({
          target: { tabId: activeTab.id!, frameIds: [video.frameId] },
          files: ['out/content-script.js'],
        })
        break
      case 'loaded':
        const startDetectionMessage: StartDetectionMessage = {
          type: 'StartDetection',
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
        value={selectedVideo}
        onInput={(event) =>
          setSelectedVideo(Number((event.target as HTMLSelectElement).value))
        }
      >
        {videos.map((video, i) => (
          <option key={i} value={i}>
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
