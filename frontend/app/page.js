"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [runs, setRuns] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [openNotes, setOpenNotes] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/runs")
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

  const maxLoss = runs.length ? Math.max(...runs.map((r) => r.final_loss)) : 1;

  function getBadge(run) {
    const reasonable = runs.filter((r) => r.final_loss > 0.05);
    const minReasonable = reasonable.length
      ? Math.min(...reasonable.map((r) => r.final_loss))
      : null;

    if (run.final_loss < 0.05) {
      return { label: "Overfit (memorized the data)", tone: "warn" };
    }
    if (run.final_loss === minReasonable) {
      return { label: "Best result", tone: "good" };
    }
    return { label: "Baseline", tone: "neutral" };
  }

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
          <button
            onClick={toggleTheme}
            className="text-sm border border-[var(--border)] rounded-full px-3 py-1.5 text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text-dim)] transition-colors"
          >
            {theme === "dark" ? "☀ light" : "☾ dark"}
          </button>
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
            what actually happened.
          </p>
        </section>

        {/* Runs */}
        <section className="mb-12">
          <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--text-dim)] mb-4">
            Runs
          </h2>
          <div className="space-y-3">
            {runs.map((run) => {
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
                    <Stat label="final loss" value={run.final_loss} />
                    <Stat label="time" value={`${run.training_seconds}s`} />
                  </div>

                  <div className="h-1.5 bg-[var(--accent-soft)] rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max((run.final_loss / maxLoss) * 100, 2)}%`,
                        background:
                          badge.tone === "warn"
                            ? "var(--warn)"
                            : "var(--accent)",
                      }}
                    />
                  </div>

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