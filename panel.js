chrome.runtime.sendMessage(
  {
    greeting: "hello",
    tabId: chrome.devtools.inspectedWindow.tabId,
  },
  (response) => {
    console.log(response.farewell);
  }
);
