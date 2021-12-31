const connections = {};

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name === "pose-estimation-pannel");

  const handleMessage = ({ name, tabId }) => {
    switch (name) {
      case "init":
        connections[tabId] = port;
        chrome.scripting.executeScript({
          target: { tabId },
          files: ["out/content-script.js"],
        });
        break;
      case "start":
      case "stop":
        chrome.tabs.sendMessage(tabId, { name });
        break;
    }
  };

  port.onMessage.addListener(handleMessage);

  port.onDisconnect.addListener((port) => {
    port.onMessage.removeListener(handleMessage);

    const tabIds = Object.keys(connections);
    for (let i = 0, len = tabIds.length; i < len; i++) {
      if (connections[tabIds[i]] == port) {
        delete connections[tabIds[i]];
        break;
      }
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.tab) {
    const tabId = sender.tab.id;
    if (tabId in connections) {
      connections[tabId].postMessage(message);
    }
  }
});
