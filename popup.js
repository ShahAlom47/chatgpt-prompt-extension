document.addEventListener("DOMContentLoaded", () => {
  const actionSelect = document.getElementById("actionSelect");
  const saveActiveBtn = document.getElementById("saveBtn");
  const actionList = document.getElementById("actionList");
  const addActionBtn = document.getElementById("showAddFormBtn"); // fixed id

  const defaultActions = [
    { name: "Generate Product Title", description: "Create a catchy product title for website." },
    { name: "Generate Product Slug", description: "Convert title into URL-friendly slug (kebab-case)." },
    { name: "Generate SEO Meta Description", description: "Generate SEO-friendly meta description, max 160 chars." }
  ];

  // Load actions and activeAction
  chrome.storage.local.get(["actions", "activeAction"], (data) => {
    const actions = data.actions || defaultActions;
    const active = data.activeAction || "";

    actions.forEach(action => {
      addActionToUI(action);
      const opt = document.createElement("option");
      opt.value = action.name;
      opt.textContent = action.name;
      if (action.name === active) opt.selected = true;
      actionSelect.appendChild(opt);
    });
  });

  // Save active action
  saveActiveBtn.addEventListener("click", () => {
    const selected = actionSelect.value;
    if (!selected) return alert("Please select an action.");
    chrome.storage.local.set({ activeAction: selected }, () => {
      alert("Active action saved: " + selected);
    });
  });

  // Add new action
  addActionBtn.addEventListener("click", () => {
    showActionForm("Add New Action");
  });

  // Show Add/Edit form
  function showActionForm(formTitle, action = null) {
    const formContainer = document.createElement("div");
    formContainer.style.border = "1px solid #ccc";
    formContainer.style.padding = "10px";
    formContainer.style.marginTop = "10px";
    formContainer.style.borderRadius = "5px";

    const title = document.createElement("h4");
    title.textContent = formTitle;

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Action Name";
    nameInput.value = action ? action.name : "";

    const descInput = document.createElement("textarea");
    descInput.placeholder = "Action Description";
    descInput.value = action ? action.description : "";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.marginLeft = "5px";

    formContainer.appendChild(title);
    formContainer.appendChild(nameInput);
    formContainer.appendChild(descInput);
    formContainer.appendChild(saveBtn);
    formContainer.appendChild(cancelBtn);

    actionList.parentNode.insertBefore(formContainer, actionList.nextSibling);

    cancelBtn.addEventListener("click", () => formContainer.remove());

    saveBtn.addEventListener("click", () => {
      const newName = nameInput.value.trim();
      const newDesc = descInput.value.trim();
      if (!newName) return alert("Action name cannot be empty!");

      chrome.storage.local.get(["actions"], (data) => {
        const actions = data.actions || [];

        if (action) {
          // Edit
          const idx = actions.findIndex(a => a.name === action.name);
          if (idx > -1) {
            actions[idx].name = newName;
            actions[idx].description = newDesc;
          }
        } else {
          // Add new
          if (actions.find(a => a.name === newName)) {
            return alert("Action already exists!");
          }
          actions.push({ name: newName, description: newDesc });
        }

        chrome.storage.local.set({ actions }, () => {
          if (action) {
            // Update list item
            const li = Array.from(actionList.children).find(li => li.firstChild.textContent === action.name);
            if (li) li.firstChild.textContent = newName;
            // Update select option
            const opt = Array.from(actionSelect.options).find(o => o.value === action.name);
            if (opt) opt.value = opt.textContent = newName;
          } else {
            addActionToUI({ name: newName, description: newDesc });
            const opt = document.createElement("option");
            opt.value = newName;
            opt.textContent = newName;
            actionSelect.appendChild(opt);
          }
          formContainer.remove();
        });
      });
    });
  }

  // Add action to UI list
  function addActionToUI(action) {
    const li = document.createElement("li");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = action.name;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => showActionForm("Edit Action", action));

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      if (!confirm("Are you sure you want to delete this action?")) return;
      chrome.storage.local.get(["actions"], (data) => {
        const actions = data.actions || [];
        const updated = actions.filter(a => a.name !== action.name);
        chrome.storage.local.set({ actions: updated }, () => {
          li.remove();
          const opt = Array.from(actionSelect.options).find(o => o.value === action.name);
          if (opt) opt.remove();
        });
      });
    });

    li.appendChild(nameSpan);
    li.appendChild(editBtn);
    li.appendChild(removeBtn);
    actionList.appendChild(li);
  }
});
