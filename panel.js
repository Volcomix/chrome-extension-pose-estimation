const canvas = document.querySelector("canvas");
const framerate = document.querySelector("#framerate");
const startStopButton = document.querySelector("#start-stop");

const ctx = canvas.getContext("2d");

const port = chrome.runtime.connect({ name: "pose-estimation-pannel" });
port.postMessage({
  name: "init",
  tabId: chrome.devtools.inspectedWindow.tabId,
});

let previousTime = 0;
let frameCount = 0;

port.onMessage.addListener((message) => {
  if (message.name === "loaded") {
    startStopButton.disabled = false;
    canvas.width = message.videoWidth;
    canvas.height = message.videoHeight;
  } else if (message.poses) {
    const time = Date.now();
    frameCount++;
    if (time >= previousTime + 1000) {
      framerate.innerText = `${Math.round(
        (frameCount * 1000) / (time - previousTime)
      )}fps`;
      previousTime = time;
      frameCount = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const pose of message.poses) {
      drawKeypoints(pose.keypoints);
      drawSkeleton(pose.keypoints, pose.id);
    }
  }
});

startStopButton.innerText = "Start";
let isRunning = false;
startStopButton.onclick = () => {
  isRunning = !isRunning;
  startStopButton.innerText = isRunning ? "Stop" : "Start";
  port.postMessage({
    name: isRunning ? "start" : "stop",
    tabId: chrome.devtools.inspectedWindow.tabId,
  });
};

const DEFAULT_LINE_WIDTH = 2;
const DEFAULT_RADIUS = 4;

const COCO_KEYPOINTS_BY_SIDE = {
  left: [1, 3, 5, 7, 9, 11, 13, 15],
  right: [2, 4, 6, 8, 10, 12, 14, 16],
  middle: [0],
};

const COCO_CONNECTED_KEYPOINTS_PAIRS = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [5, 6],
  [5, 7],
  [5, 11],
  [6, 8],
  [6, 12],
  [7, 9],
  [8, 10],
  [11, 12],
  [11, 13],
  [12, 14],
  [13, 15],
  [14, 16],
];

const SCORE_THRESHOLD = 0.3;
const ENABLE_TRACKING = true;

const COLOR_PALETTE = [
  "#ffffff",
  "#800000",
  "#469990",
  "#e6194b",
  "#42d4f4",
  "#fabed4",
  "#aaffc3",
  "#9a6324",
  "#000075",
  "#f58231",
  "#4363d8",
  "#ffd8b1",
  "#dcbeff",
  "#808000",
  "#ffe119",
  "#911eb4",
  "#bfef45",
  "#f032e6",
  "#3cb44b",
  "#a9a9a9",
];

function drawKeypoints(keypoints) {
  ctx.fillStyle = "Red";
  ctx.strokeStyle = "White";
  ctx.lineWidth = DEFAULT_LINE_WIDTH;

  for (const i of COCO_KEYPOINTS_BY_SIDE.middle) {
    drawKeypoint(keypoints[i]);
  }

  ctx.fillStyle = "Green";
  for (const i of COCO_KEYPOINTS_BY_SIDE.left) {
    drawKeypoint(keypoints[i]);
  }

  ctx.fillStyle = "Orange";
  for (const i of COCO_KEYPOINTS_BY_SIDE.right) {
    drawKeypoint(keypoints[i]);
  }
}

function drawKeypoint(keypoint) {
  // If score is null, just show the keypoint.
  const score = keypoint.score != null ? keypoint.score : 1;

  if (score >= SCORE_THRESHOLD) {
    const circle = new Path2D();
    circle.arc(keypoint.x, keypoint.y, DEFAULT_RADIUS, 0, 2 * Math.PI);
    ctx.fill(circle);
    ctx.stroke(circle);
  }
}

function drawSkeleton(keypoints, poseId) {
  // Each poseId is mapped to a color in the color palette.
  const color =
    ENABLE_TRACKING && poseId != null ? COLOR_PALETTE[poseId % 20] : "White";
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = DEFAULT_LINE_WIDTH;

  COCO_CONNECTED_KEYPOINTS_PAIRS.forEach(([i, j]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    // If score is null, just show the keypoint.
    const score1 = kp1.score != null ? kp1.score : 1;
    const score2 = kp2.score != null ? kp2.score : 1;

    if (score1 >= SCORE_THRESHOLD && score2 >= SCORE_THRESHOLD) {
      ctx.beginPath();
      ctx.moveTo(kp1.x, kp1.y);
      ctx.lineTo(kp2.x, kp2.y);
      ctx.stroke();
    }
  });
}
