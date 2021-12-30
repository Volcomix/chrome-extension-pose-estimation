import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

const estimationConfig = {
  maxPoses: 2,
};

let detector;
let video;
let animationFrame;
let isRunning = false;

async function loadPoseDetection() {
  const model = poseDetection.SupportedModels.PoseNet;
  detector = await poseDetection.createDetector(model);

  video = document.querySelector("video");
  video.width = video.videoWidth;
  video.height = video.videoHeight;
}

async function estimatePoses() {
  if (!isRunning) {
    return;
  }
  const poses = await detector.estimatePoses(video, estimationConfig);
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
