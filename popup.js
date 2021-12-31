const progress = document.querySelector("progress");
const withoutSources = document.querySelector("#without-sources");
const withSources = document.querySelector("#with-sources");
const source = document.querySelector("#source");

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
    withoutSources.hidden = false;
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

    withSources.hidden = false;
  }
} catch (error) {
  console.error(error);
  withoutSources.hidden = false;
} finally {
  progress.hidden = true;
}
