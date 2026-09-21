"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/runs")
      .then((res) => res.json())
      .then((data) => setRuns(data));
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">TuneTrack</h1>
      <p className="text-gray-400 mb-8">Fine-tuning run history</p>

      <div className="grid gap-4">
        {runs.map((run) => (
          <div key={run.run_id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Run #{run.run_id}</span>
              <span className="text-sm text-gray-400">{run.base_model}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <div>
                <span className="text-gray-500">LoRA Rank:</span> {run.lora_rank}
              </div>
              <div>
                <span className="text-gray-500">Steps:</span> {run.max_steps}
              </div>
              <div>
                <span className="text-gray-500">Final Loss:</span> {run.final_loss}
              </div>
              <div>
                <span className="text-gray-500">Time:</span> {run.training_seconds}s
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}