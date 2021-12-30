import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

async function loadPoseDetection() {
  const model = poseDetection.SupportedModels.PoseNet;
  const detector = await poseDetection.createDetector(model);

  const video = document.querySelector("video");
  video.width = video.videoWidth;
  video.height = video.videoHeight;

  const estimationConfig = {
    maxPoses: 5,
  };

  const poses = await detector.estimatePoses(video, estimationConfig);
  console.log(poses);
}

loadPoseDetection();
