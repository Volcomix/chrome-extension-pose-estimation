const canvas = document.getElementById("canvas");

chrome.runtime.sendMessage({
  name: "init",
  tabId: chrome.devtools.inspectedWindow.tabId,
});
