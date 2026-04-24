const nodeInput = document.getElementById("node-input");
const submitBtn = document.getElementById("submit-btn");
const sampleBtn = document.getElementById("sample-btn");
const statusEl = document.getElementById("status");
const rawJsonEl = document.getElementById("raw-json");
const summaryCardsEl = document.getElementById("summary-cards");
const hierarchiesEl = document.getElementById("hierarchies-content");
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

const sampleInput = `A->B
A->C
B->D
C->E
E->F
X->Y
Y->Z
Z->X
P->Q
Q->R
G->H
G->H
G->I`;

function stringify(value) {
  return JSON.stringify(value, null, 2);
}

function switchTab(tabName) {
  tabContents.forEach(tab => tab.classList.remove("active"));
  tabBtns.forEach(btn => btn.classList.remove("active"));
  
  const selectedTab = document.getElementById(tabName + "-content");
  if (selectedTab) {
    selectedTab.classList.add("active");
  }
  
  const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeBtn) {
    activeBtn.classList.add("active");
  }
}

tabBtns.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const tabName = e.target.closest(".tab-btn").dataset.tab;
    switchTab(tabName);
  });
});

function buildSummaryCards(response) {
  const cards = [
    { label: "Total Trees", value: response.summary.total_trees },
    { label: "Total Cycles", value: response.summary.total_cycles },
    { label: "Largest Root", value: response.summary.largest_tree_root || "-" }
  ];

  summaryCardsEl.innerHTML = cards
    .map(
      card => `
        <div class="summary-card">
          <div class="summary-value">${card.value}</div>
          <div class="summary-label">${card.label}</div>
        </div>
      `
    )
    .join("");
}

function renderHierarchies(response) {
  if (!response.hierarchies || response.hierarchies.length === 0) {
    hierarchiesEl.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-tertiary);">
        <p style="font-size: 14px;">No hierarchies to display</p>
      </div>
    `;
    return;
  }

  const hierarchyMarkup = response.hierarchies
    .map((item) => {
      const badge = item.has_cycle 
        ? '<span class="card-badge badge-cycle">CYCLE</span>'
        : '<span class="card-badge badge-tree">TREE</span>';
      
      const depthLine = item.has_cycle 
        ? "Status: Cyclic structure"
        : `Depth: ${item.depth} level${item.depth !== 1 ? 's' : ''}`;

      return `
        <div class="hierarchy-card">
          <div class="card-header">
            <div class="card-title">Root: <strong>${item.root}</strong></div>
            ${badge}
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
            ${depthLine}
          </div>
          <div class="card-content">${stringify(item.tree)}</div>
        </div>
      `;
    })
    .join("");

  hierarchiesEl.innerHTML = hierarchyMarkup;
}

function renderErrors(response) {
  const invalidEntriesDiv = document.getElementById("invalid-entries");
  const duplicateEdgesDiv = document.getElementById("duplicate-edges");

  if (response.invalid_entries && response.invalid_entries.length > 0) {
    invalidEntriesDiv.innerHTML = `
      <h3>Invalid Entries</h3>
      ${response.invalid_entries
        .map(item => `<div class="error-item">${item}</div>`)
        .join("")}
    `;
  } else {
    invalidEntriesDiv.innerHTML = `
      <h3>Invalid Entries</h3>
      <div style="color: var(--success); font-size: 12px; padding: 12px; text-align: center;">
        None found
      </div>
    `;
  }

  if (response.duplicate_edges && response.duplicate_edges.length > 0) {
    duplicateEdgesDiv.innerHTML = `
      <h3>Duplicate Edges</h3>
      ${response.duplicate_edges
        .map(item => `<div class="error-item">${item}</div>`)
        .join("")}
    `;
  } else {
    duplicateEdgesDiv.innerHTML = `
      <h3>Duplicate Edges</h3>
      <div style="color: var(--success); font-size: 12px; padding: 12px; text-align: center;">
        None found
      </div>
    `;
  }
}

async function analyze() {
  const values = nodeInput.value
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  statusEl.textContent = "Analyzing...";
  statusEl.style.color = "#6366f1";
  submitBtn.disabled = true;

  try {
    const response = await fetch("/bfhl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: values })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Request failed");
    }

    buildSummaryCards(result);
    renderHierarchies(result);
    renderErrors(result);
    rawJsonEl.textContent = stringify(result);
    
    statusEl.textContent = "Analysis complete!";
    statusEl.style.color = "#10b981";
    
    switchTab("hierarchies");
  } catch (error) {
    statusEl.textContent = `${error.message || "Failed to analyze"}`;
    statusEl.style.color = "#ef4444";
    summaryCardsEl.innerHTML = "";
    hierarchiesEl.innerHTML = "";
    rawJsonEl.textContent = "{}";
  } finally {
    submitBtn.disabled = false;
  }
}

sampleBtn.addEventListener("click", () => {
  nodeInput.value = sampleInput;
  nodeInput.focus();
});

submitBtn.addEventListener("click", analyze);

window.addEventListener("load", () => {
  setTimeout(analyze, 100);
});
