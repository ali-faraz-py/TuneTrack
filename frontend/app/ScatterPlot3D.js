"use client";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function ScatterPlot3D({ runs }) {
  if (!runs.length) return null;

  const x = runs.map((r) => r.lora_rank);
  const y = runs.map((r) => r.max_steps);
  const z = runs.map((r) => r.avg_loss);
  const text = runs.map(
    (r) =>
      `run_${r.run_id.toString().padStart(2, "0")}<br>rank ${r.lora_rank}, steps ${r.max_steps}<br>loss ${r.avg_loss}<br>time ${r.training_seconds}s`
  );
  const size = runs.map((r) => Math.max(r.training_seconds / 8, 8));
  const color = runs.map((r) => (r.overfit ? "#d9695a" : "#dd8e4f"));

  return (
    <Plot
      data={[
        {
          type: "scatter3d",
          mode: "markers",
          x,
          y,
          z,
          text,
          hoverinfo: "text",
          marker: {
            size,
            color,
            opacity: 0.85,
            line: { color: "#00000000", width: 0 },
          },
        },
      ]}
      layout={{
        autosize: true,
        height: 380,
        margin: { l: 0, r: 0, t: 0, b: 0 },
        paper_bgcolor: "transparent",
        scene: {
          xaxis: { title: "LoRA rank", color: "#928d80" },
          yaxis: { title: "steps", color: "#928d80" },
          zaxis: { title: "avg loss", color: "#928d80" },
        },
        font: { color: "#928d80", size: 11 },
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: "100%", height: "100%" }}
    />
  );
}