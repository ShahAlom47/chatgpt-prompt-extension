// background service worker
console.log("AutoPrompt Injector background script loaded.");
chrome.runtime.onInstalled.addListener(() => {
  console.log("ChatGPT Prompt Injector Installed");
});

