# Liquid Glass Statistics Widget

Interactive single page application that reads from a JSON file and renders:

- Line plot with threshold indicators
- Histogram with frequency distribution
- Summary statistics cards
- Multiple stacked widgets from one data array

## Requirements

- Node.js 20+ (for development)
- Any modern web browser
- No backend server required!

## Quick start

```bash
npm install
npm run dev
```

This will start esbuild's development server. Open: http://localhost:3000

## Build for production

Build the optimized bundle:

```bash
npm run build
```

The `public/` folder contains everything you need. You can:

- Open `public/index.html` directly in your browser
- Deploy the `public/` folder to any static hosting (GitHub Pages, Netlify, Vercel, etc.)
- Serve it with any static file server

## Preview production build

```bash
npm run preview
```

## Code quality checks

Run lint rules:

```bash
npm run lint
```

Run type checking:

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

## Data format

Edit `public/stats.json` using this array structure:

```json
[
  {
    "title": "Widget A",
    "unit": "ms",
    "thresholds": [
      { "label": "Warn", "value": 80 },
      { "label": "Critical", "value": 100, "color": "#ff6b6b" }
    ],
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

- Each object in the array becomes one widget on the page
- Widget order in the UI follows array order in stats.json
- `points` must be non-empty for every widget object
- `thresholds` is optional. If provided, each threshold needs a numeric value and can include optional label and color
- `title` defaults to "Statistics" if not provided
- `unit` defaults to "units" if not provided

## Architecture

This is a pure client-side single page application:

- No backend server needed
- All data processing happens in the browser
- Built with vanilla TypeScript and Plotly.js
- Styled with custom CSS (glassmorphism design)
