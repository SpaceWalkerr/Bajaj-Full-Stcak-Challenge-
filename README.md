
# Hierarchy Analyzer

A web application for visualizing and analyzing hierarchical relationships between nodes. Detect trees, identify cycles, and understand your data structure with an intuitive interface.

## Features

- **Analyze Node Relationships** - Input relationships in the format `X->Y` to build hierarchies
- **Tree Detection** - Automatically identifies valid tree structures
- **Cycle Detection** - Pinpoints circular dependencies and loops
- **Duplicate Handling** - Detects and manages duplicate edges
- **Depth Calculation** - Shows the depth of each tree hierarchy
- **Summary Statistics** - Quick overview of total trees, cycles, and largest root
- **Interactive UI** - Three views: Trees & Cycles, Issues, Raw JSON
- **Real-time Analysis** - Instant feedback as you input data

## Tech Stack

- **Backend**: Node.js 24.x with native HTTP server (no external frameworks)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript
- **Deployment**: Render.com with auto-deploy from GitHub

## Getting Started

### Prerequisites
- Node.js 24.x

### Installation

```bash
# Clone the repository
git clone https://github.com/SpaceWalkerr/Bajaj-Full-Stcak-Challenge-.git
cd Bajaj-Full-Stcak-Challenge-

# Start the server
npm start
```

The application will run on `http://localhost:3000`

## How to Use

1. **Input Your Data**: Enter node relationships in the textarea using the format `X->Y` (one per line)
   - Example: `A->B`, `A->C`, `B->D`
   
2. **Analyze**: Click the "Analyze" button or load sample data

3. **View Results**:
   - **Trees & Cycles** tab: See all hierarchies with their structure and depth
   - **Issues** tab: Review invalid entries and duplicate edges
   - **JSON** tab: View the raw API response

## API

### Endpoint
```
POST /bfhl
Content-Type: application/json
```

### Request
```json
{
  "data": [
    "A->B",
    "A->C",
    "B->D",
    "X->Y",
    "Y->Z",
    "Z->X"
  ]
}
```

### Response
```json
{
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": { "D": {} },
          "C": {}
        }
      },
      "depth": 3,
      "has_cycle": false
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

## Input Format

- **Valid**: Single uppercase letter to single uppercase letter (e.g., `A->B`)
- **Invalid**: Multiple characters, lowercase letters, self-loops (`A->A`), or incorrect format

## File Structure

```
├── server.js           # Backend HTTP server
├── package.json        # Node.js configuration
├── public/
│   ├── index.html      # HTML markup
│   ├── styles.css      # Styling
│   └── app.js          # Frontend logic
└── README.md           # This file
```

## Live Demo

Visit: [https://bajaj-full-stcak-challenge.onrender.com](https://bajaj-full-stcak-challenge.onrender.com)

## License

Open source project.

---

Made by Suraj Nandan
}
```

## Notes

- CORS is enabled.
- Duplicate edges are tracked once.
- Invalid entries are returned as provided in the request payload.
- Multi-parent conflicts keep the first parent edge and silently discard later ones.

## Before submission

Set your real:

- `USER_ID`
- `EMAIL_ID`
- `COLLEGE_ROLL_NUMBER`
