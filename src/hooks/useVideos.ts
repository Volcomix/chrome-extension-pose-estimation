import { useEffect, useState } from 'preact/hooks'
import { DetectionStatus, Video } from '../types'

export default function useVideos(
  activeTab: chrome.tabs.Tab | undefined,
  detectionStatus: DetectionStatus | undefined,
) {
  const [videos, setVideos] = useState<Video[]>()

  async function findVideos() {
    if (!activeTab) {
      return
    }
    if (detectionStatus !== undefined && detectionStatus !== 'loaded') {
      return
    }
    try {
      const [frameResult] = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id! },
        func: () =>
          [...document.querySelectorAll('video')].map<Video>(
            (videoElement, videoIndex) => ({
              index: videoIndex,
              src: videoElement.src,
              width: videoElement.videoWidth ?? videoElement.width,
              height: videoElement.videoHeight ?? videoElement.height,
              playing: !videoElement.paused,
            }),
          ),
      })
      setVideos(frameResult.result)
    } catch (error) {
      console.error(error)
      setVideos([])
    }
  }

  useEffect(() => {
    findVideos()
  }, [activeTab, detectionStatus])

  return videos
}
