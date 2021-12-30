const canvas = document.getElementById("canvas");
const framerate = document.getElementById("framerate");
const button = document.getElementById("button");

const port = chrome.runtime.connect({ name: "pose-estimation-pannel" });
port.postMessage({
  name: "init",
  tabId: chrome.devtools.inspectedWindow.tabId,
});

let previousTime = 0;
let frameCount = 0;

port.onMessage.addListener((message) => {
  if (message.poses) {
    const time = Date.now();
    frameCount++;
    if (time >= previousTime + 1000) {
      framerate.innerText = `${Math.round(
        (frameCount * 1000) / (time - previousTime)
      )}fps`;
      previousTime = time;
      frameCount = 0;
    }
  }
});

button.innerText = "Start";
let isRunning = false;
button.onclick = () => {
  isRunning = !isRunning;
  button.innerText = isRunning ? "Stop" : "Start";
  port.postMessage({
    name: isRunning ? "start" : "stop",
    tabId: chrome.devtools.inspectedWindow.tabId,
  });
};
