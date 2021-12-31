const progress = document.querySelector("progress");
const source = document.querySelector("#source");
const noSource = document.querySelector("#no-source");

try {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const [frameResult] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () =>
      [...document.querySelectorAll("video, canvas")].map((element) => ({
        tagName: element.tagName,
        src: element.src,
        width: element.videoWidth ?? element.width,
        height: element.videoHeight ?? element.height,
        isPlaying: element.tagName === "VIDEO" && !element.paused,
      })),
  });
  const sources = frameResult.result;
  if (sources.length === 0) {
    noSource.hidden = false;
  } else {
    const srcMaxLength = 60;
    let selectedSource = sources.findIndex((source) => source.isPlaying);
    if (selectedSource === -1) {
      selectedSource = sources.findIndex(
        (source) => source.tagName === "VIDEO"
      );
    }
    if (selectedSource === -1) {
      selectedSource = 0;
    }
    console.log("selectedSource", selectedSource);
    source.innerHTML = sources
      .map(
        ({ tagName, src, width, height, isPlaying }, i) =>
          `<option value="${i}"${i === selectedSource ? " selected" : ""}>${
            tagName === "VIDEO"
              ? `${isPlaying ? "▸ " : ""}${src?.substr(0, srcMaxLength)}${
                  src?.length > srcMaxLength ? "..." : ""
                }`
              : "canvas"
          } (${width}x${height})</option>`
      )
      .join("\n");

    source.hidden = false;
  }
} catch (error) {
  console.error(error);
  noSource.hidden = false;
} finally {
  progress.hidden = true;
}
