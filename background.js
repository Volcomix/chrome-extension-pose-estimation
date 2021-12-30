chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.name === "init" && request.tabId) {
    chrome.scripting.executeScript({
      target: { tabId: request.tabId },
      files: ["out/content-script.js"],
    });
  }
});
