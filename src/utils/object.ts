import { DetectedObject } from '@tensorflow-models/coco-ssd'

export function renderObjects(
  ctx: CanvasRenderingContext2D,
  objects: DetectedObject[],
) {
  ctx.fillStyle = '#101010'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.font = '20px Arial'
  for (const object of objects) {
    ctx.beginPath()
    ctx.rect(...object.bbox)
    ctx.lineWidth = 1
    ctx.strokeStyle = 'green'
    ctx.fillStyle = 'green'
    ctx.stroke()
    ctx.fillText(
      object.score.toFixed(3) + ' ' + object.class,
      object.bbox[0],
      object.bbox[1] > 20 ? object.bbox[1] - 10 : 20,
    )
  }
}
