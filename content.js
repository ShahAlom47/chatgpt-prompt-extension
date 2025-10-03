console.log("✅ content.js loaded");

// Function: Inject prompt before sending
function injectPrompt(promptText) {
  const editorDiv = document.querySelector('div.ProseMirror[contenteditable="true"]');
  if (!editorDiv || !promptText) return;

  editorDiv.innerHTML = `<p>${promptText}</p>` + editorDiv.innerHTML;
  editorDiv.dispatchEvent(new InputEvent("input", { bubbles: true }));

  console.log("Injected prompt:", promptText);
}

// Attach listener to Send button
function setupSendInjector() {
  const observer = new MutationObserver(() => {
    const sendBtn = document.getElementById("composer-submit-button");
    if (sendBtn && !sendBtn.dataset.listenerAttached) {
      sendBtn.addEventListener("click", () => {
        chrome.storage.local.get(["actions", "activeAction", "extensionEnabled"], (data) => {
          if (!data.extensionEnabled) return; // toggle off হলে কিছু হবে না

          const { actions = [], activeAction } = data;
          const action = actions.find(a => a.name === activeAction);
          if (action && action.description) {
            injectPrompt(action.description);
          }
        });
      });

      sendBtn.dataset.listenerAttached = "true";
      console.log("✅ Send button listener attached");
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Init
setupSendInjector();
