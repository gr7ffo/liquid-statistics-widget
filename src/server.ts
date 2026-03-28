import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

interface StatsPayload {
  title?: string;
  unit?: string;
  thresholds?: Array<{
    label?: string;
    value: number;
    color?: string;
  }>;
  points: Array<{
    timestamp: string;
    value: number;
  }>;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const app = express();
const port = Number(process.env.PORT ?? 3000);
const statsFilePath = process.env.STATS_FILE ?? path.join(rootDir, "data", "stats.json");

function computeSummary(points: StatsPayload["points"]) {
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;

  return {
    count: values.length,
    min,
    max,
    avg: Number(avg.toFixed(2))
  };
}

function assertPoints(
  points: StatsPayload["points"] | undefined
): asserts points is StatsPayload["points"] {
  if (!points || points.length === 0) {
    throw new Error("Each stats array item must include non-empty points data.");
  }
}

function normalizeThresholds(thresholds: StatsPayload["thresholds"] | undefined) {
  if (!thresholds) {
    return [];
  }

  return thresholds.map((threshold, index) => {
    if (!Number.isFinite(threshold.value)) {
      throw new Error(`Threshold at index ${index} must include a finite numeric value.`);
    }

    return {
      label: threshold.label?.trim() || `Threshold ${index + 1}`,
      value: threshold.value,
      color: threshold.color
    };
  });
}

function normalizeStatsItem(entry: StatsPayload) {
  const points = entry.points;
  assertPoints(points);

  return {
    title: entry.title ?? "Statistics",
    unit: entry.unit ?? "units",
    thresholds: normalizeThresholds(entry.thresholds),
    points,
    summary: computeSummary(points)
  };
}

async function loadStats(filePath: string) {
  const raw = await fs.readFile(filePath, "utf-8");
  const payload = JSON.parse(raw) as StatsPayload[];

  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error("Stats file must be a non-empty array.");
  }

  return payload.map(normalizeStatsItem);
}

app.use(express.static(path.join(rootDir, "public")));

app.get("/api/stats", async (_req, res) => {
  try {
    res.json(await loadStats(statsFilePath));
  } catch (error) {
    res.status(500).json({
      error: "Failed to load stats file.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(rootDir, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Widget server is running at http://localhost:${port}`);
  console.log(`Reading data from ${statsFilePath}`);
});
