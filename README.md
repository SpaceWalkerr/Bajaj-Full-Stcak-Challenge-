
# SRM Full Stack Engineering Challenge - Hierarchy Analyzer

A full-stack Node.js application that processes hierarchical relationships between nodes, detects cycles, and returns structured insights through a REST API.

## Features

- **REST API** (`POST /bfhl`) that accepts node relationships in the format `X->Y`
- **Hierarchical tree construction** with proper root detection
- **Cycle detection** for cyclic relationships
- **Duplicate edge handling** 
- **Depth calculation** for tree hierarchies
- **Beautiful frontend UI** for interacting with the API
- **CORS enabled** for cross-origin requests

## Tech Stack

- **Backend**: Node.js with native HTTP server (no external dependencies)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript
- **Fonts**: Google Fonts (Space Grotesk, Source Code Pro)

## Local Development

### Prerequisites
- Node.js 18.x or higher

### Installation & Running

```bash
# Clone the repository
git clone <your-repo-url>
cd Bajaj-Full-Stcak-Challenge-

# Install dependencies (if any)
npm install

# Start the server
npm start
```

Or with your personal information:

```bash
USER_ID="yourname_ddmmyyyy" EMAIL_ID="you@college.edu" COLLEGE_ROLL_NUMBER="21CS1001" npm start
```

The application will be available at `http://localhost:3000`

## Configuration

Before deployment, update your personal information in the `.env` file:

```env
USER_ID=yourname_ddmmyyyy          # Format: firstname+lastname_ddmmyyyy
EMAIL_ID=yourname@college.edu       # Your college email
COLLEGE_ROLL_NUMBER=21CS1001        # Your college roll number
```

When deploying to a hosting platform, set these as environment variables in the platform's dashboard instead.

## API Usage

### Endpoint
```
POST /bfhl
Content-Type: application/json
```

### Request Example
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

### Response Example
```json
{
  "user_id": "yourname_17091999",
  "email_id": "yourname@college.edu",
  "college_roll_number": "21CS1001",
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": { "D": {} },
          "C": {}
        }
      },
      "depth": 3
    },
    {
      "root": "X",
      "tree": {},
      "has_cycle": true
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 1,
    "largest_tree_root": "A"
  }
}
```

## Validation Rules

### Valid Format
- Each entry must be `X->Y` where X and Y are **single uppercase letters (A-Z)**
- Examples: `A->B`, `X->Y`, `Z->A`

### Invalid Entries (caught and reported)
- `hello` - Not a node format
- `1->2` - Not uppercase letters
- `AB->C` - Multi-character parent
- `A-B` - Wrong separator
- `A->` - Missing child node
- `A->A` - Self-loop
- Empty strings
- Whitespace-only strings

### Processing Rules
1. **Duplicate edges**: Only the first occurrence is used for tree construction
2. **Multi-parent nodes**: First-encountered parent wins, others are silently discarded
3. **Cycles**: Detected and reported with `has_cycle: true` and empty tree
4. **Pure cycles**: Lexicographically smallest node becomes root

## Deployment

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard:
- `USER_ID`
- `EMAIL_ID`
- `COLLEGE_ROLL_NUMBER`

### Option 2: Render
1. Push to GitHub
2. Connect repository to Render
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Add environment variables in Render dashboard

### Option 3: Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Option 4: Netlify (Frontend Only)
For the frontend, you can also deploy to Netlify and point API calls to your backend URL.

## Project Structure

```
├── server.js           # Node.js HTTP server with /bfhl endpoint
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (update with your info)
├── README.md          # This file
└── public/
    ├── index.html      # Frontend UI
    ├── app.js         # Frontend logic & API integration
    └── styles.css     # Styling
```

## Features Overview

### Backend Processing
- Validates input format
- Detects and tracks invalid entries
- Identifies duplicate edges
- Builds connected components
- Constructs tree hierarchies
- Detects cycles
- Calculates tree depths
- Returns summary statistics

### Frontend Capabilities
- Input textarea for node relationships
- Sample data loader button
- Real-time API integration
- Responsive UI with summary cards
- Tree structure visualization
- Invalid entries and duplicate edges display
- Raw JSON response viewer
- Error handling with user-friendly messages

## Performance
- API responds in under 3 seconds for inputs up to 50 nodes
- Zero external API dependencies
- Efficient graph algorithms for cycle detection and depth calculation

## Submission Checklist

- [ ] Update `.env` with your personal information
- [ ] Test locally with `npm start`
- [ ] Push code to public GitHub repository
- [ ] Deploy to hosting platform (Vercel/Render/Railway/etc)
- [ ] Verify API responds correctly from deployed URL
- [ ] Get API base URL (e.g., `https://your-app.vercel.app`)
- [ ] Get frontend URL (same as API if deployed together)
- [ ] Submit both URLs along with GitHub repo link

## Troubleshooting

### Port Already in Use
```bash
# Kill the process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Environment Variables Not Loading
- For local development: Restart the server after updating `.env`
- For hosted deployment: Ensure variables are set in platform dashboard

### CORS Issues
- The API already has CORS headers enabled
- No additional configuration needed

## Author Notes

This implementation uses vanilla Node.js with no external dependencies for the HTTP server, making it lightweight and deployment-friendly. The frontend is also built with vanilla HTML/CSS/JavaScript for maximum compatibility.

---

**Good luck with your submission! 🚀**


Example request:

```json
{
  "data": ["A->B", "A->C", "B->D"]
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
