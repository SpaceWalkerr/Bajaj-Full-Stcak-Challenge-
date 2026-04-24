const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const USER_INFO = {
  user_id: process.env.USER_ID || "yourname_ddmmyyyy",
  email_id: process.env.EMAIL_ID || "your-college-email@example.edu",
  college_roll_number: process.env.COLLEGE_ROLL_NUMBER || "YOUR_ROLL_NUMBER"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload, null, 2));
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, 404, { error: "File not found" });
      return;
    }

    const ext = path.extname(filePath);
    const contentTypes = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8"
    };

    res.writeHead(200, { "Content-Type": contentTypes[ext] || "text/plain; charset=utf-8" });
    res.end(data);
  });
}

function buildTreeNode(node, childMap) {
  const tree = {};
  const children = childMap.get(node) || [];

  for (const child of children) {
    tree[child] = buildTreeNode(child, childMap);
  }

  return tree;
}

function getDepth(node, childMap) {
  const children = childMap.get(node) || [];
  if (children.length === 0) {
    return 1;
  }

  let maxDepth = 0;
  for (const child of children) {
    maxDepth = Math.max(maxDepth, getDepth(child, childMap));
  }

  return 1 + maxDepth;
}

function detectCycleFromNode(startNode, childMap, state) {
  const currentState = state.get(startNode) || 0;
  if (currentState === 1) {
    return true;
  }
  if (currentState === 2) {
    return false;
  }

  state.set(startNode, 1);

  for (const child of childMap.get(startNode) || []) {
    if (detectCycleFromNode(child, childMap, state)) {
      return true;
    }
  }

  state.set(startNode, 2);
  return false;
}

function analyzeGroup(nodes, edges) {
  const nodeSet = new Set(nodes);
  const childMap = new Map();
  const inDegree = new Map();

  for (const node of nodeSet) {
    childMap.set(node, []);
    inDegree.set(node, 0);
  }

  for (const edge of edges) {
    childMap.get(edge.parent).push(edge.child);
    inDegree.set(edge.child, (inDegree.get(edge.child) || 0) + 1);
  }

  const roots = [...nodeSet].filter((node) => (inDegree.get(node) || 0) === 0).sort();
  const root = roots.length > 0 ? roots[0] : [...nodeSet].sort()[0];
  const state = new Map();
  const hasCycle = detectCycleFromNode(root, childMap, state);

  if (hasCycle) {
    return {
      root,
      tree: {},
      has_cycle: true
    };
  }

  return {
    root,
    tree: {
      [root]: buildTreeNode(root, childMap)
    },
    depth: getDepth(root, childMap)
  };
}

function buildConnectedComponents(edges) {
  const adjacency = new Map();

  for (const { parent, child } of edges) {
    if (!adjacency.has(parent)) adjacency.set(parent, new Set());
    if (!adjacency.has(child)) adjacency.set(child, new Set());
    adjacency.get(parent).add(child);
    adjacency.get(child).add(parent);
  }

  const visited = new Set();
  const components = [];

  for (const node of adjacency.keys()) {
    if (visited.has(node)) continue;

    const queue = [node];
    const nodes = [];
    visited.add(node);

    while (queue.length > 0) {
      const current = queue.shift();
      nodes.push(current);

      for (const neighbor of adjacency.get(current) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    components.push(nodes.sort());
  }

  return components;
}

function solveChallenge(payload) {
  const data = payload && Array.isArray(payload.data) ? payload.data : null;

  if (!data) {
    return {
      statusCode: 400,
      body: {
        error: "Request body must contain a data array."
      }
    };
  }

  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();
  const chosenParentByChild = new Map();
  const acceptedEdges = [];

  for (const rawEntry of data) {
    const entry = typeof rawEntry === "string" ? rawEntry.trim() : "";

    if (!/^[A-Z]->[A-Z]$/.test(entry)) {
      invalidEntries.push(rawEntry);
      continue;
    }

    const [parent, child] = entry.split("->");
    if (parent === child) {
      invalidEntries.push(rawEntry);
      continue;
    }

    if (seenEdges.has(entry)) {
      if (!duplicateEdges.includes(entry)) {
        duplicateEdges.push(entry);
      }
      continue;
    }
    seenEdges.add(entry);

    if (chosenParentByChild.has(child)) {
      continue;
    }

    chosenParentByChild.set(child, parent);
    acceptedEdges.push({ parent, child, raw: entry });
  }

  const components = buildConnectedComponents(acceptedEdges);
  const hierarchies = [];

  for (const nodes of components) {
    const nodeSet = new Set(nodes);
    const componentEdges = acceptedEdges.filter(
      (edge) => nodeSet.has(edge.parent) && nodeSet.has(edge.child)
    );

    hierarchies.push(analyzeGroup(nodes, componentEdges));
  }

  hierarchies.sort((a, b) => a.root.localeCompare(b.root));

  const treeHierarchies = hierarchies.filter((item) => !item.has_cycle);
  const cycleHierarchies = hierarchies.filter((item) => item.has_cycle);

  let largestTreeRoot = "";
  let maxDepth = -1;
  for (const hierarchy of treeHierarchies) {
    if (
      hierarchy.depth > maxDepth ||
      (hierarchy.depth === maxDepth && hierarchy.root < largestTreeRoot)
    ) {
      maxDepth = hierarchy.depth;
      largestTreeRoot = hierarchy.root;
    }
  }

  return {
    statusCode: 200,
    body: {
      ...USER_INFO,
      hierarchies,
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges,
      summary: {
        total_trees: treeHierarchies.length,
        total_cycles: cycleHierarchies.length,
        largest_tree_root: largestTreeRoot
      }
    }
  };
}

function handleApi(req, res) {
  let rawBody = "";

  req.on("data", (chunk) => {
    rawBody += chunk;
  });

  req.on("end", () => {
    try {
      const payload = rawBody ? JSON.parse(rawBody) : {};
      const result = solveChallenge(payload);
      sendJson(res, result.statusCode, result.body);
    } catch {
      sendJson(res, 400, { error: "Invalid JSON body." });
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  if (req.url === "/bfhl" && req.method === "POST") {
    handleApi(req, res);
    return;
  }

  if (req.url === "/bfhl" && req.method !== "POST") {
    sendJson(res, 405, { error: "Use POST /bfhl." });
    return;
  }

  if (req.url === "/" || req.url === "/index.html") {
    sendFile(res, path.join(PUBLIC_DIR, "index.html"));
    return;
  }

  if (req.url === "/styles.css") {
    sendFile(res, path.join(PUBLIC_DIR, "styles.css"));
    return;
  }

  if (req.url === "/app.js") {
    sendFile(res, path.join(PUBLIC_DIR, "app.js"));
    return;
  }

  sendJson(res, 404, { error: "Route not found." });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = {
  solveChallenge
};
