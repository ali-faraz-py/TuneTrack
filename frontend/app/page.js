"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import ScatterPlot3D from "./ScatterPlot3D";

export default function Home() {
  const [runs, setRuns] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [openNotes, setOpenNotes] = useState({});
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  useEffect(() => {
    fetch("https://tunetrack-1cs0.onrender.com/runs")
      .then((res) => res.json())
      .then((data) => setRuns(data));
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  }

  function toggleNote(id) {
    setOpenNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const maxLoss = runs.length ? Math.max(...runs.map((r) => r.avg_loss)) : 1;

  function getBadge(run) {
    if (run.overfit) {
      return { label: "Overfit (memorized the data)", tone: "warn" };
    }
    const notOverfit = runs.filter((r) => !r.overfit);
    const best = notOverfit.length
      ? Math.min(...notOverfit.map((r) => r.avg_loss))
      : null;
    if (run.avg_loss === best) {
      return { label: "Best result", tone: "good" };
    }
    return { label: "Baseline", tone: "neutral" };
  }

  const chartData = runs.map((r) => ({
    name: `run_${r.run_id.toString().padStart(2, "0")}`,
    loss: r.avg_loss,
  }));

  const runsNewestFirst = [...runs].reverse();
  const visibleRuns =
    visibleCount === "all"
      ? runsNewestFirst
      : runsNewestFirst.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] px-6 py-10 sm:px-10 md:px-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="font-[family-name:var(--font-mono)] text-2xl sm:text-3xl font-bold tracking-tight">
              TuneTrack
            </h1>
            <p className="text-[var(--text-dim)] text-sm mt-1">
              a small log of fine-tuning experiments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/ali-faraz-py/TuneTrack"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm border border-[var(--border)] rounded-full px-3 py-1.5 text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text-dim)] transition-colors"
            >
              GitHub
            </a>
            <button
              onClick={toggleTheme}
              className="text-sm border border-[var(--border)] rounded-full px-3 py-1.5 text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text-dim)] transition-colors"
            >
              {theme === "dark" ? "☀ light" : "☾ dark"}
            </button>
          </div>
        </div>

        {/* Intro */}
        <section className="mb-12 leading-relaxed text-[15px] text-[var(--text)]">
          <p className="mb-4">
            I wanted to actually learn how LLM fine-tuning works, not just
            read about it. So I took a small open model (Llama 3.2, 3B),
            trained it with LoRA on a free Colab GPU using a handful of
            Q&amp;A pairs pulled from one of my own projects, and used{" "}
            <span className="font-[family-name:var(--font-mono)] text-[13px] bg-[var(--accent-soft)] text-[var(--accent)] px-1.5 py-0.5 rounded">
              MLflow
            </span>{" "}
            to keep a record of what happened each time I changed a setting.
          </p>
          <p className="text-[var(--text-dim)]">
            This page is that record, updated every time I run a new
            experiment. Nothing here is staged. There
            {runs.length === 1 ? " is " : " are "}
            {runs.length} {runs.length === 1 ? "run" : "runs"} logged so far,
            and each one has a short note explaining what I was testing and
            what actually happened. Some runs also have a real question I
            asked the fine-tuned model, with its actual answer, so you can
            see it working, not just a loss number.
          </p>
        </section>

        {/* Loss trend chart */}
        {runs.length > 0 && (
          <section className="mb-12">
            <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--text-dim)] mb-4">
              Average loss across runs
            </h2>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--text-dim)", fontSize: 11 }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--text-dim)", fontSize: 11 }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    labelStyle={{ color: "var(--text)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="loss"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--accent)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-[var(--text-dim)] mt-2">
              This is the loss averaged over the whole run, so it includes the
              high early steps. A run can still be overfit if its loss at the
              very end is near zero, so check each run&apos;s notes.
            </p>
          </section>
        )}

        {/* 3D scatter plot */}
        {runs.length > 0 && (
          <section className="mb-12">
            <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--text-dim)] mb-4">
              Rank, steps, and loss together
            </h2>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
              <ScatterPlot3D runs={runs} />
            </div>
            <p className="text-xs text-[var(--text-dim)] mt-2">
              Drag to rotate, scroll to zoom. Bigger dots took longer to
              train.
            </p>
          </section>
        )}

        {/* Runs */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--text-dim)]">
              Runs, most recent first
            </h2>
            {runs.length > 5 && (
              <select
                value={visibleCount}
                onChange={(e) => {
                  const val = e.target.value;
                  setVisibleCount(val === "all" ? "all" : Number(val));
                }}
                className="text-xs bg-[var(--bg-card)] border border-[var(--accent)] rounded-md pl-2 pr-7 py-1 text-[var(--text-dim)] appearance-none focus:outline-none cursor-pointer"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236f6a5e' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                }}
              >
                <option value={5}>Show 5</option>
                <option value={10}>Show 10</option>
                <option value="all">Show all ({runs.length})</option>
              </select>
            )}
          </div>
          <div className="space-y-3">
            {visibleRuns.map((run) => {
              const badge = getBadge(run);
              const isOpen = !!openNotes[run.run_id];
              const toneMap = {
                good: "text-[var(--good)] bg-[var(--good-soft)]",
                warn: "text-[var(--warn)] bg-[var(--warn-soft)]",
                neutral: "text-[var(--text-dim)] bg-[var(--accent-soft)]",
              };
              return (
                <div
                  key={run.run_id}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="font-[family-name:var(--font-mono)] text-sm text-[var(--text-dim)]">
                      run_{run.run_id.toString().padStart(2, "0")} ·{" "}
                      {run.base_model}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${toneMap[badge.tone]}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4 text-sm mb-4">
                    <Stat label="LoRA rank" value={run.lora_rank} />
                    <Stat label="steps" value={run.max_steps} />
                    <Stat label="avg loss" value={run.avg_loss} />
                    <Stat label="time" value={`${run.training_seconds}s`} />
                  </div>

                  <div className="h-1.5 bg-[var(--accent-soft)] rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max((run.avg_loss / maxLoss) * 100, 2)}%`,
                        background:
                          badge.tone === "warn"
                            ? "var(--warn)"
                            : "var(--accent)",
                      }}
                    />
                  </div>

                  {run.sample_qa && (
                    <div className="mb-4 bg-[var(--accent-soft)] rounded-md p-3 text-sm">
                      <p className="text-[var(--text-dim)] mb-1">
                        <span className="font-medium text-[var(--accent)]">
                          Q:
                        </span>{" "}
                        {run.sample_qa.question}
                      </p>
                      <p className="text-[var(--text)]">
                        <span className="font-medium text-[var(--accent)]">
                          A:
                        </span>{" "}
                        {run.sample_qa.answer}
                      </p>
                    </div>
                  )}

                  {run.note && (
                    <div>
                      <button
                        onClick={() => toggleNote(run.run_id)}
                        className="text-xs font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
                      >
                        {isOpen ? "Hide notes" : "Read notes"}
                      </button>
                      {isOpen && (
                        <p className="text-sm text-[var(--text-dim)] leading-relaxed mt-2 pl-3 border-l-2 border-[var(--border)]">
                          {run.note}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <footer className="text-xs text-[var(--text-dim)] pt-6 border-t border-[var(--border)]">
          Built by Syed Ali Faraz. Fine-tuned with Unsloth and LoRA, tracked
          with MLflow.
        </footer>
      </div>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-[var(--text-dim)]">
        {label}
      </div>
      <div className="font-[family-name:var(--font-mono)] text-[var(--text)]">
        {value}
      </div>
    </div>
  );
}