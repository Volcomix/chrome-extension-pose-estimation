import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

const detectorConfig = {
  modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
  enableSmoothing: true,
  enableTracking: true,
  trackerType: poseDetection.TrackerType.BoundingBox,
};

let detector;
let video;
let animationFrame;
let isRunning = false;

async function loadPoseDetection() {
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );

  video = document.querySelector("video");

  chrome.runtime.sendMessage({
    name: "loaded",
    videoWidth: video.videoWidth,
    videoHeight: video.videoHeight,
  });
}

async function estimatePoses() {
  if (!isRunning) {
    return;
  }
  if (video.readyState < 2) {
    animationFrame = requestAnimationFrame(estimatePoses);
    return;
  }
  const poses = await detector.estimatePoses(video);
  chrome.runtime.sendMessage({ poses });
  animationFrame = requestAnimationFrame(estimatePoses);
}

chrome.runtime.onMessage.addListener((message) => {
  if (!detector || !video) {
    return;
  }

  switch (message.name) {
    case "start":
      isRunning = true;
      animationFrame = requestAnimationFrame(estimatePoses);
      break;
    case "stop":
      isRunning = false;
      cancelAnimationFrame(animationFrame);
      break;
  }
});

loadPoseDetection();
