import { render } from 'preact'
import useVideos from './hooks/useVideos'
import './popup.css'

const videoSrcMaxLength = 60

function Popup() {
  const videos = useVideos()

  if (!videos) {
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
