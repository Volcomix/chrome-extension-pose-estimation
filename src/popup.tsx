import { render } from 'preact'
import useDetectionStatus from './hooks/useDetectionStatus'
import useVideos from './hooks/useVideos'
import './popup.css'

const videoSrcMaxLength = 60

function Popup() {
  const detectionStatus = useDetectionStatus()
  const videos = useVideos()

  if (!videos) {
    return <progress />
  }
  if (videos.length === 0) {
    return <span className="Popup-noVideos">No videos found</span>
  }

  let candidateVideos = videos.filter((video) => video.playing)
  if (candidateVideos.length === 0) {
    candidateVideos = videos
  }
  candidateVideos.sort((a, b) => b.width - a.width)

  return (
    <div className="Popup">
      <select className="Popup-videos">
        {videos.map((video, i) => (
          <option key={i} value={i} selected={video === candidateVideos[0]}>
            {video.playing && '▸ '}
            {video.src.substr(0, videoSrcMaxLength) || 'video'}
            {video.src.length > videoSrcMaxLength && '…'}
            {` (${video.width}x${video.height})`}
          </option>
        ))}
      </select>
      <button
        disabled={
          detectionStatus === 'loading' ||
          detectionStatus === 'starting' ||
          detectionStatus === 'stopping'
        }
      >
        {(detectionStatus === undefined || detectionStatus === 'loaded') &&
          'Start detection'}
        {(detectionStatus === 'loading' || detectionStatus === 'starting') &&
          'Starting detection...'}
        {detectionStatus === 'running' && 'Stop detection'}
        {detectionStatus === 'stopping' && 'Stopping detection...'}
      </button>
    </div>
  )
}

render(<Popup />, document.body)
