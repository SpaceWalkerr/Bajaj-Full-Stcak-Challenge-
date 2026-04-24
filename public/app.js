const nodeInput = document.getElementById("node-input");
const submitBtn = document.getElementById("submit-btn");
const sampleBtn = document.getElementById("sample-btn");
const statusEl = document.getElementById("status");
const rawJsonEl = document.getElementById("raw-json");
const summaryCardsEl = document.getElementById("summary-cards");
const hierarchiesEl = document.getElementById("hierarchies");

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

function stringify(value) {
  return JSON.stringify(value, null, 2);
}

function buildSummaryCards(response) {
  const cards = [
    ["Total Trees", response.summary.total_trees],
    ["Total Cycles", response.summary.total_cycles],
    ["Largest Root", response.summary.largest_tree_root || "-"]
  ];

  summaryCardsEl.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="summary-card">
          <p class="summary-label">${label}</p>
          <p class="summary-value">${value}</p>
        </article>
      `
    )
    .join("");
}

function buildListCard(title, items) {
  return `
    <article class="list-card">
      <h3>${title}</h3>
      <pre>${stringify(items)}</pre>
    </article>
  `;
}

function renderHierarchies(response) {
  const hierarchyMarkup = response.hierarchies
    .map((item) => {
      const statusClass = item.has_cycle ? "warn" : "good";
      const statusText = item.has_cycle ? "Cycle Detected" : "Valid Tree";

      return `
        <article class="hierarchy-card">
          <div class="hierarchy-top">
            <h3>Root ${item.root}</h3>
            <span class="pill ${statusClass}">${statusText}</span>
          </div>
          <p class="hierarchy-meta">
            ${item.has_cycle ? "No depth for cyclic groups." : `Depth: ${item.depth}`}
          </p>
          <pre>${stringify(item.tree)}</pre>
        </article>
      `;
    })
    .join("");

  hierarchiesEl.innerHTML = `
    ${hierarchyMarkup}
    <div class="mini-grid">
      ${buildListCard("Invalid Entries", response.invalid_entries)}
      ${buildListCard("Duplicate Edges", response.duplicate_edges)}
    </div>
  `;
}

async function analyze() {
  const values = nodeInput.value
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  statusEl.textContent = "Analyzing input...";
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

    buildSummaryCards(result);
    renderHierarchies(result);
    rawJsonEl.textContent = stringify(result);
    statusEl.textContent = "Analysis complete.";
  } catch (error) {
    statusEl.textContent = error.message || "Unable to process the request.";
    summaryCardsEl.innerHTML = "";
    hierarchiesEl.innerHTML = "";
    rawJsonEl.textContent = "{}";
  } finally {
    submitBtn.disabled = false;
  }
}

sampleBtn.addEventListener("click", () => {
  nodeInput.value = sampleInput;
});

submitBtn.addEventListener("click", analyze);

analyze();
