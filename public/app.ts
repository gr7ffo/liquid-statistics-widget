interface StatPoint {
  timestamp: string;
  value: number;
}

interface StatThreshold {
  label: string;
  value: number;
  color?: string;
}

interface StatsResponse {
  title: string;
  unit: string;
  thresholds: StatThreshold[];
  points: StatPoint[];
  summary: {
    count: number;
    min: number;
    max: number;
    avg: number;
  };
}

declare global {
  interface Window {
    Plotly: {
      newPlot: (
        container: string | HTMLElement,
        data: unknown[],
        layout: Record<string, unknown>,
        config?: Record<string, unknown>
      ) => void;
    };
  }
}

const chartBaseLayout = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: {
    family: "Sora, sans-serif",
    color: "#e9f6f6"
  },
  margin: { l: 45, r: 16, t: 12, b: 42 }
};

interface WidgetConfig {
  id: string;
  heading: string;
}

function createBins(values: number[], binCount: number): { mid: number[]; counts: number[] } {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const step = span / binCount;
  const counts = new Array(binCount).fill(0);

  for (const value of values) {
    const rawIndex = Math.floor((value - min) / step);
    const index = Math.min(rawIndex, binCount - 1);
    counts[index] += 1;
  }

  const mid = counts.map((_, i) => Number((min + step * (i + 0.5)).toFixed(2)));
  return { mid, counts };
}

function renderSummary(data: StatsResponse, id: string): void {
  const unit = data.unit;
  (document.getElementById(`${id}-title`) as HTMLElement).textContent = data.title;
  (document.getElementById(`${id}-subtitle`) as HTMLElement).textContent = `Unit: ${unit}`;

  const thresholdsText = data.thresholds.length
    ? `Thresholds: ${data.thresholds.map((threshold) => `${threshold.label} ${threshold.value} ${unit}`).join(" • ")}`
    : "Thresholds: none";
  (document.getElementById(`${id}-thresholds`) as HTMLElement).textContent = thresholdsText;

  (document.getElementById(`${id}-count`) as HTMLElement).textContent = String(data.summary.count);
  (document.getElementById(`${id}-avg`) as HTMLElement).textContent = `${data.summary.avg} ${unit}`;
  (document.getElementById(`${id}-min`) as HTMLElement).textContent = `${data.summary.min} ${unit}`;
  (document.getElementById(`${id}-max`) as HTMLElement).textContent = `${data.summary.max} ${unit}`;
}

function renderLinePlot(data: StatsResponse, id: string): void {
  const values = data.points.map((point) => point.value);
  const times = data.points.map((point) => point.timestamp);
  const thresholdPalette = ["#ffbf69", "#ff6b6b", "#7bdff2", "#b2f7ef"];
  const thresholdLines = data.thresholds.map((threshold, index) => ({
    x: times,
    y: new Array(times.length).fill(threshold.value),
    type: "scatter",
    mode: "lines",
    name: threshold.label,
    line: {
      color: threshold.color ?? thresholdPalette[index % thresholdPalette.length],
      width: 2,
      dash: "dot"
    },
    hovertemplate: `${threshold.label}: ${threshold.value} ${data.unit}<extra></extra>`
  }));

  window.Plotly.newPlot(
    `${id}-line`,
    [
      {
        x: times,
        y: values,
        type: "scatter",
        mode: "lines+markers",
        line: { color: "#61e4d2", width: 3, shape: "spline" },
        marker: { size: 6, color: "#f7ff72", line: { width: 1, color: "#1f2d35" } },
        name: data.title,
        hovertemplate: "%{x}<br>%{y:.2f}<extra></extra>"
      },
      ...thresholdLines
    ],
    {
      ...chartBaseLayout,
      showlegend: thresholdLines.length > 0,
      legend: {
        orientation: "h",
        yanchor: "bottom",
        y: 1.02,
        xanchor: "right",
        x: 1
      },
      xaxis: { gridcolor: "rgba(255,255,255,0.11)", title: "Time" },
      yaxis: { gridcolor: "rgba(255,255,255,0.11)", title: data.unit }
    },
    { displayModeBar: false, responsive: true }
  );
}

function renderHistogram(data: StatsResponse, id: string, binCount: number): void {
  const values = data.points.map((point) => point.value);
  const bins = createBins(values, binCount);

  window.Plotly.newPlot(
    `${id}-hist`,
    [
      {
        x: bins.mid,
        y: bins.counts,
        type: "bar",
        marker: {
          color: bins.counts,
          colorscale: [
            [0, "#86fff0"],
            [1, "#f7ff72"]
          ],
          line: {
            width: 1,
            color: "rgba(7, 28, 35, 0.6)"
          }
        },
        hovertemplate: `${data.unit}: %{x:.2f}<br>Count: %{y}<extra></extra>`
      }
    ],
    {
      ...chartBaseLayout,
      xaxis: { gridcolor: "rgba(255,255,255,0.11)", title: data.unit },
      yaxis: { gridcolor: "rgba(255,255,255,0.11)", title: "Frequency" }
    },
    { displayModeBar: false, responsive: true }
  );
}

function createWidgetShell(config: WidgetConfig): HTMLElement {
  const wrapper = document.createElement("section");
  wrapper.className = "widget-shell";
  wrapper.innerHTML = `
    <section class="hero glass-panel">
      <div>
        <h1 id="${config.id}-title">Liquid Glass Statistics</h1>
        <p id="${config.id}-subtitle" class="subtitle">Loading data...</p>
        <p id="${config.id}-thresholds" class="subtitle thresholds">Thresholds: none</p>
      </div>
    </section>
    <section class="summary-grid">
      <article class="glass-card">
        <p>Data points</p>
        <h2 id="${config.id}-count">-</h2>
      </article>
      <article class="glass-card">
        <p>Average</p>
        <h2 id="${config.id}-avg">-</h2>
      </article>
      <article class="glass-card">
        <p>Minimum</p>
        <h2 id="${config.id}-min">-</h2>
      </article>
      <article class="glass-card">
        <p>Maximum</p>
        <h2 id="${config.id}-max">-</h2>
      </article>
    </section>
    <section class="chart-grid">
      <article class="glass-panel">
        <h3>Line plot</h3>
        <div id="${config.id}-line" class="chart"></div>
      </article>
      <article class="glass-panel">
        <h3>Histogram</h3>
        <div id="${config.id}-hist" class="chart"></div>
      </article>
    </section>
  `;

  return wrapper;
}

function renderWidget(config: WidgetConfig, stats: StatsResponse): void {
  renderSummary(stats, config.id);
  renderLinePlot(stats, config.id);
  renderHistogram(stats, config.id, 5);
}

async function bootstrap(): Promise<void> {
  const response = await fetch("/api/stats");

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const statsItems = (await response.json()) as StatsResponse[];

  if (!Array.isArray(statsItems) || statsItems.length === 0) {
    throw new Error("API returned no widget datasets.");
  }

  const dashboard = document.getElementById("dashboard") as HTMLElement;

  for (let index = 0; index < statsItems.length; index += 1) {
    const config: WidgetConfig = {
      id: `widget-${index + 1}`,
      heading: `Widget ${index + 1}`
    };

    dashboard.appendChild(createWidgetShell(config));
    renderWidget(config, statsItems[index]);
  }
}

bootstrap().catch((error) => {
  const dashboard = document.getElementById("dashboard") as HTMLElement;
  const panel = document.createElement("section");
  panel.className = "hero glass-panel";
  panel.innerHTML = `<p class="subtitle">Failed to load data: ${error instanceof Error ? error.message : "Unknown error"}</p>`;
  dashboard.appendChild(panel);
});
