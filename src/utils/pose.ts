import { Keypoint, Pose } from '@tensorflow-models/pose-detection'

const defaultLineWidth = 2
const defaultRadius = 4

const cocoKeypointsBySide = {
  left: [1, 3, 5, 7, 9, 11, 13, 15],
  right: [2, 4, 6, 8, 10, 12, 14, 16],
  middle: [0],
}

const cocoConnectedKeypointsPairs = [
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
]

const scoreThreshold = 0.3
const enableTracking = true

const colorPalette = [
  '#ffffff',
  '#800000',
  '#469990',
  '#e6194b',
  '#42d4f4',
  '#fabed4',
  '#aaffc3',
  '#9a6324',
  '#000075',
  '#f58231',
  '#4363d8',
  '#ffd8b1',
  '#dcbeff',
  '#808000',
  '#ffe119',
  '#911eb4',
  '#bfef45',
  '#f032e6',
  '#3cb44b',
  '#a9a9a9',
]

export function renderPoses(ctx: CanvasRenderingContext2D, poses: Pose[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (const pose of poses) {
    drawKeypoints(ctx, pose.keypoints)
    drawSkeleton(ctx, pose.keypoints, pose.id)
  }
}

function drawKeypoints(ctx: CanvasRenderingContext2D, keypoints: Keypoint[]) {
  ctx.fillStyle = 'red'
  ctx.strokeStyle = 'white'
  ctx.lineWidth = defaultLineWidth

  for (const i of cocoKeypointsBySide.middle) {
    drawKeypoint(ctx, keypoints[i])
  }

  ctx.fillStyle = 'green'
  for (const i of cocoKeypointsBySide.left) {
    drawKeypoint(ctx, keypoints[i])
  }

  ctx.fillStyle = 'orange'
  for (const i of cocoKeypointsBySide.right) {
    drawKeypoint(ctx, keypoints[i])
  }
}

function drawKeypoint(ctx: CanvasRenderingContext2D, keypoint: Keypoint) {
  // If score is null, just show the keypoint.
  const score = keypoint.score != null ? keypoint.score : 1

  if (score >= scoreThreshold) {
    const circle = new Path2D()
    circle.arc(keypoint.x, keypoint.y, defaultRadius, 0, 2 * Math.PI)
    ctx.fill(circle)
    ctx.stroke(circle)
  }
}

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  poseId: number | undefined,
) {
  // Each poseId is mapped to a color in the color palette.
  const color =
    enableTracking && poseId != null ? colorPalette[poseId % 20] : 'white'
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = defaultLineWidth

  cocoConnectedKeypointsPairs.forEach(([i, j]) => {
    const kp1 = keypoints[i]
    const kp2 = keypoints[j]

    // If score is null, just show the keypoint.
    const score1 = kp1.score != null ? kp1.score : 1
    const score2 = kp2.score != null ? kp2.score : 1

    if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
      ctx.beginPath()
      ctx.moveTo(kp1.x, kp1.y)
      ctx.lineTo(kp2.x, kp2.y)
      ctx.stroke()
    }
  })
}
