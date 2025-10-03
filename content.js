console.log("✅ content.js loaded");

// Function to inject prompt
function injectPrompt(promptText, actionName, allowMultiple = false) {
  const editorDiv = document.querySelector('div.ProseMirror[contenteditable="true"]');
  if (!editorDiv || !promptText) return;

  // Only prevent multiple injections if allowMultiple = false
  if (!allowMultiple && editorDiv.dataset.injectedAction === actionName) return;

  editorDiv.innerHTML = `<p>${promptText}</p>` + editorDiv.innerHTML;
  editorDiv.dispatchEvent(new InputEvent("input", { bubbles: true }));

  if (!allowMultiple) editorDiv.dataset.injectedAction = actionName;
  console.log("Injected prompt:", promptText);
}

// Ctrl+I inject (multiple allowed)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === 'i') {
    chrome.storage.local.get(["extensionEnabled", "actions", "activeAction"], (data) => {
      if (data.extensionEnabled === false) return;

      const { actions = [], activeAction } = data;
      // if (!activeAction) return;

      const action = actions.find(a => a.name === activeAction);
      if (action && action.description) {
        injectPrompt(action.description, activeAction, true); // allow multiple
        console.log("Injected via Ctrl+I:", action.description);
      }
    });
  }
});

// Reset injection when activeAction changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.activeAction) {
    const editorDiv = document.querySelector('div.ProseMirror[contenteditable="true"]');
    if (editorDiv) delete editorDiv.dataset.injectedAction; // Reset for new action
    console.log("Active action changed to:", changes.activeAction.newValue);
  }
});
