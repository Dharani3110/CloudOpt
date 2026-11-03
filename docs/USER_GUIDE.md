# CloudOpt — User Guide

## 1. Signing in

Open the deployed URL (or `http://localhost:3000` locally). On first visit you'll see a sign-in
screen — click **"Need an account? Register"**, pick a username/password, and you're in. There's
no email verification step for this project-scope build.

## 2. Overview tab

Shows system-wide metrics: total jobs submitted, jobs completed, average memory requested per
job, and how many security events have been flagged by the anomaly detector. This is your
at-a-glance dashboard for a demo or viva.

## 3. Jobs tab

**Submit a job** with:
- **Name** — any label (e.g. `render-job-1`)
- **Arrival time** — when the job "arrives" in the simulated timeline (0 = immediately)
- **Declared burst time** — how long you expect it to run
- **Priority** — 1 = highest priority, 10 = lowest
- **Memory (MB)** and **CPU cores** — resource footprint, used by the optimizer

After submitting, the **Job Queue** table shows both your declared burst time and the
**AI-predicted** burst time side by side — this is the ML prediction feature in action. If the
ML service is unreachable, the predicted column just shows `—` and the system falls back to the
declared value everywhere else.

## 4. Scheduler tab

Pick one of 5 classic OS scheduling algorithms and click **Run Scheduler**:
- **FCFS** — runs jobs strictly in arrival order
- **SJF** — always runs the shortest remaining job next
- **Round Robin** — time-slices every job (set the quantum first)
- **Priority** — runs the highest-priority job available
- **MLFQ** — starts every job at high priority, demotes it the longer it runs

You'll get a **Gantt chart** (colored blocks showing which job ran when) plus **average waiting
time** and **average turnaround time** stat cards.

Click **Compare All 5 Algorithms** to see a side-by-side table — useful for your DAA
complexity-vs-actual-performance writeup.

## 5. Optimizer tab

Two independent DAA tools, both operating on your current job queue:

- **Bin Packing** — enter a VM/pod memory capacity (MB) and click **Pack Jobs**. Shows how many
  "VMs" your jobs were packed into and the utilization of each — this is the Bin-Packing
  (First-Fit-Decreasing) algorithm minimizing wasted capacity.
- **0/1 Knapsack** — enter a compute-cost budget and click **Select Optimal Jobs**. Shows which
  jobs get selected to run (and which get rejected) to maximize total priority-value without
  exceeding the budget.

## 6. Security tab

Click **Run Anomaly Scan (ML)** to score recent login/job/scheduler events using the Isolation
Forest anomaly detector. Flagged events (e.g. repeated failed logins) show a red **flagged**
badge; normal events show green **ok**. This is the practical demo of your AWS Security
Specialty "logging & monitoring" knowledge.

## 7. Typical demo flow (for your OD presentation)

1. Register/sign in
2. Submit 4–5 jobs with varied burst times, priorities, and memory sizes
3. Run each scheduling algorithm once, screenshot the Gantt charts
4. Run **Compare All 5** and screenshot the stats table
5. Run Bin Packing with a couple of different capacities to show allocation changing
6. Run Knapsack with a tight vs generous budget to show job selection changing
7. Deliberately fail a login 3–4 times, then go to Security tab and run a scan to show it getting
   flagged
8. Show the Overview tab metrics updating live
