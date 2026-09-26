# TuneTrack

A small dashboard that tracks LoRA fine-tuning experiments. I built this to
actually learn how LLM fine-tuning works, not just read about it.

**Live demo:** https://tunetrack-dashboard.vercel.app
**Backend API:** https://tunetrack-1cs0.onrender.com/runs

## What this is

I took a small open model (Llama 3.2, 3B), fine-tuned it with LoRA/QLoRA on a
free Google Colab GPU using Unsloth, and used MLflow to track what happened
each time I changed a setting. This project is the dashboard that shows those
results.

Each run is real. Nothing is staged, including the run where I pushed
training steps too far and the model just memorized the data instead of
learning from it. I left that one in on purpose, since it was the most useful
result I got out of the whole experiment.

## Why I built it

Most portfolio projects show a model doing something. This one shows the
process of training a model, including the part that went wrong, and how I
figured out why. That felt more honest, and closer to what fine-tuning
actually looks like day to day: trying a setting, checking the numbers, and
adjusting.

## How it works

1. **Training** happens in a Colab notebook (based on Unsloth's official
   Llama 3.2 example), using a small Q&A dataset I generated from one of my
   own projects.
2. **MLflow** logs each run's settings (LoRA rank, training steps, base
   model) and results (final loss, training time, peak GPU memory).
3. A small **FastAPI backend** serves that run history as JSON.
4. A **Next.js frontend** displays it, styled to look like a lab notebook
   rather than a typical dashboard. It includes:
   - a line chart plotting loss across every run, so a trend is visible even
     as more runs get added
   - a 5 / 10 / all dropdown so the run list stays short and readable no
     matter how many experiments pile up
   - light/dark mode
   - a short, expandable note attached to each run explaining what I was
     testing and what actually happened

## Tech stack

- **Fine-tuning:** Unsloth, LoRA/QLoRA, Llama 3.2 (3B), Google Colab (free
  T4 GPU)
- **Experiment tracking:** MLflow
- **Backend:** FastAPI
- **Frontend:** Next.js (App Router), Tailwind CSS, Recharts
- **Deployment:** Render (backend), Vercel (frontend)

## What I actually learned

- Doubling the LoRA rank (16 to 32) barely changed the result but used
  almost double the GPU memory. More capacity doesn't automatically help,
  especially on a small dataset.
- Training for more steps isn't always better. Pushing from 60 to 100 steps
  on only 56 examples dropped the loss to almost zero, which looked great
  until I realized it meant the model had just memorized my questions
  instead of learning general patterns. That's overfitting, and it's easy
  to miss if you're only looking at the loss number and not thinking about
  what it means.

## Running it locally

**Backend:**
```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```
cd frontend
npm install
npm run dev
```

The frontend expects the backend running (or update the fetch URL in
`app/page.js` to point at your own backend).

## Notebook

The actual fine-tuning notebook (based on Unsloth's Llama 3.2 example) is
available here:
https://colab.research.google.com/drive/18DCR9jVhNQ2a5dsCn85h7Kg-lpdqYvlS?usp=sharing