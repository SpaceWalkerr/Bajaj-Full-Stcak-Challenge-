// ===== DOM Elements =====
const nodeInput = document.getElementById("node-input");
const submitBtn = document.getElementById("submit-btn");
const sampleBtn = document.getElementById("sample-btn");
const statusEl = document.getElementById("status");
const rawJsonEl = document.getElementById("raw-json");
const summaryCardsEl = document.getElementById("summary-cards");
const hierarchiesEl = document.getElementById("hierarchies");
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// Sample input data
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
G->I
hello
1->2
A->`;

// ===== Utility Functions =====
function stringify(value) {
  return JSON.stringify(value, null, 2);
}

// ===== Tab Management =====
function switchTab(tabName) {
  // Hide all tabs
  tabContents.forEach(tab => tab.classList.remove("active"));
  
  // Deactivate all buttons
  tabBtns.forEach(btn => btn.classList.remove("active"));
  
  // Show selected tab
  const selectedTab = document.getElementById(tabName + "-content");
  if (selectedTab) {
    selectedTab.classList.add("active");
  }
  
  // Activate selected button
  event.target.classList.add("active");
}

// Tab button event listeners
tabBtns.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const tabName = e.target.dataset.tab;
    switchTab(tabName);
  });
});

// ===== Render Functions =====
function buildSummaryCards(response) {
  const cards = [
    ["Total Trees", response.summary.total_trees],
    ["Total Cycles", response.summary.total_cycles],
    ["Largest Root", response.summary.largest_tree_root || "-"]
  ];

  summaryCardsEl.innerHTML = cards
    .map(
      ([label, value]) => `
        <div class="summary-card">
          <div class="summary-label">${label}</div>
          <div class="summary-value">${value}</div>
        </div>
      `
    )
    .join("");
}

function renderHierarchies(response) {
  const hierarchyMarkup = response.hierarchies
    .map((item) => {
      const statusClass = item.has_cycle ? "warn" : "good";
      const statusText = item.has_cycle ? "🔄 Cycle Detected" : "✓ Valid Tree";
      const depthInfo = item.has_cycle 
        ? "Cyclic structure - no linear depth" 
        : `Depth: <strong>${item.depth}</strong> nodes`;

      return `
        <div class="hierarchy-card">
          <div class="hierarchy-top">
            <h3>Root: <strong>${item.root}</strong></h3>
            <span class="pill ${statusClass}">${statusText}</span>
          </div>
          <div class="hierarchy-meta">${depthInfo}</div>
          <pre>${stringify(item.tree)}</pre>
        </div>
      `;
    })
    .join("");

  hierarchiesEl.innerHTML = hierarchyMarkup || `
    <div class="hierarchy-card">
      <p style="text-align: center; color: #9ca3af;">No hierarchies found. Enter some edges above!</p>
    </div>
  `;
}

function renderErrors(response) {
  const invalidMarkup = response.invalid_entries.length > 0
    ? `<pre>${stringify(response.invalid_entries)}</pre>`
    : `<p style="color: #9ca3af; text-align: center;">✓ No invalid entries</p>`;

  const duplicateMarkup = response.duplicate_edges.length > 0
    ? `<pre>${stringify(response.duplicate_edges)}</pre>`
    : `<p style="color: #9ca3af; text-align: center;">✓ No duplicate edges</p>`;

  const errorsContent = document.getElementById("errors-content");
  errorsContent.innerHTML = `
    <div class="errors-grid">
      <div class="error-box">
        <h4>❌ Invalid Entries</h4>
        ${invalidMarkup}
      </div>
      <div class="error-box">
        <h4>⚠️ Duplicate Edges</h4>
        ${duplicateMarkup}
      </div>
    </div>
  `;
}

// ===== Main Analyze Function =====
async function analyze() {
  const values = nodeInput.value
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  statusEl.textContent = "⚙️ Analyzing...";
  statusEl.style.color = "#2563eb";
  submitBtn.disabled = true;

  try {
    const response = await fetch("/bfhl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data: values })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Request failed.");
    }

    // Update all sections
    buildSummaryCards(result);
    renderHierarchies(result);
    renderErrors(result);
    rawJsonEl.textContent = stringify(result);
    
    statusEl.textContent = "✅ Analysis complete!";
    statusEl.style.color = "#10b981";
    
    // Switch to hierarchies tab
    document.querySelector('[data-tab="hierarchies"]').click();
  } catch (error) {
    statusEl.textContent = "❌ " + (error.message || "Unable to process the request.");
    statusEl.style.color = "#ef4444";
    summaryCardsEl.innerHTML = "";
    hierarchiesEl.innerHTML = "";
    rawJsonEl.textContent = "{}";
  } finally {
    submitBtn.disabled = false;
  }
}

// ===== Event Listeners =====
sampleBtn.addEventListener("click", () => {
  nodeInput.value = sampleInput;
  nodeInput.focus();
});

submitBtn.addEventListener("click", analyze);

// ===== Auto-analyze on page load =====
window.addEventListener("load", () => {
  setTimeout(analyze, 100);
});
