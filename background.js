chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension",
    request
  );
  if (request.greeting === "hello") {
    console.log(chrome.scripting);
    chrome.scripting.executeScript(
      {
        target: { tabId: request.tabId },
        func: () =>
          [...document.querySelectorAll("video")].map((video) => video.src),
      },
      (injectionResults) => {
        for (const result of injectionResults) {
          console.log(result);
        }
      }
    );
    console.log("Sending response");
    sendResponse({ farewell: "goodbye" });
    console.log("Response sent");
  }
});
