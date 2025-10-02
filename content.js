console.log("✅ content.js loaded");

// Function: Inject prompt once
function injectPromptOnce(promptText) {
  const editorDiv = document.querySelector('div.ProseMirror[contenteditable="true"]');
  if (!editorDiv || !promptText) return;

  // Prevent multiple injections
  if (editorDiv.dataset.injected) return;

  // Inject on first focus/click
  editorDiv.addEventListener('focus', () => {
    if (editorDiv.dataset.injected) return;

    editorDiv.innerHTML = `<p>${promptText}</p>` + editorDiv.innerHTML;
    editorDiv.dispatchEvent(new InputEvent("input", { bubbles: true }));
    editorDiv.dataset.injected = "true";

    console.log("Injected prompt:", promptText);
  }, { once: true });
}

// Get active action from storage
chrome.storage.local.get(["actions", "activeAction"], (data) => {
  const { actions = [], activeAction } = data;
  if (!activeAction) return;

  const action = actions.find(a => a.name === activeAction);
  if (action && action.description) {
    injectPromptOnce(action.description);
    console.log("Active Action:", activeAction);
    console.log("Action Detail:", action);
  }
});

// Optional: Listen for changes in activeAction (if user selects new one)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.activeAction) {
    const newActionName = changes.activeAction.newValue;
    chrome.storage.local.get("actions", (data) => {
      const action = (data.actions || []).find(a => a.name === newActionName);
      if (action && action.description) {
        // Reset previous injection
        const editorDiv = document.querySelector('div.ProseMirror[contenteditable="true"]');
        if (editorDiv) delete editorDiv.dataset.injected;

        injectPromptOnce(action.description);
        console.log("Active Action Changed:", newActionName);
        console.log("Action Detail:", action);
      }
    });
  }
});
