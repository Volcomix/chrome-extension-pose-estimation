import { useEffect, useState } from 'preact/hooks'
import { Video } from '../types'
import useActiveTab from './useActiveTab'
import useDetectionStatus from './useDetectionStatus'

export default function useVideos() {
  const activeTab = useActiveTab()
  const detectionStatus = useDetectionStatus()
  const [videos, setVideos] = useState<Video[]>()

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
    findVideos()
  }, [activeTab, detectionStatus])

  return videos
}
