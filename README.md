# Liquid Glass Statistics Widget (TypeScript + Node)

Interactive local widget that reads from a JSON file and renders:

- Line plot
- Histogram with live bin slider
- Summary statistics cards
- Any number of stacked widgets from one array

## Requirements

- Node.js 20+

## Quick start

```bash
npm install
npm run dev
```

Open: http://localhost:3000

## Build and start

Build only:

```bash
npm run build
```

Build and run server:

```bash
npm start
```

## Code quality checks

Run lint rules (including cognitive complexity thresholds):

```bash
npm run lint
```

Run type checking only:

```bash
npm run typecheck
```

Check formatting:

```bash
npm run format:check
```

Auto-fix formatting:

```bash
npm run format:write
```

## JSON shape

Edit data/stats.json using this array structure:

```json
[
  {
    "title": "Widget A",
    "unit": "ms",
    "points": [
      { "timestamp": "2026-03-01", "value": 10.5 },
      { "timestamp": "2026-03-02", "value": 12.1 }
    ]
  },
  {
    "title": "Widget B",
    "unit": "requests/min",
    "points": [
      { "timestamp": "2026-03-01", "value": 90 },
      { "timestamp": "2026-03-02", "value": 95 }
    ]
  }
]
```

Notes:

- Each object in the array becomes one widget on the page.
- Widget order in the UI follows array order in data/stats.json.
- points must be non-empty for every widget object.

## Use another file path

Command Prompt:

```bash
set STATS_FILE=d:\\path\\to\\your\\stats.json
npm run dev
```

PowerShell:

```powershell
$env:STATS_FILE = "D:\\path\\to\\your\\stats.json"
npm run dev
```
