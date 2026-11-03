# CloudOpt — Architecture & Algorithm Design

## 1. Component Overview

| Component | Tech | Responsibility |
|---|---|---|
| Frontend | React (Vite) | Dashboard, job submission, visualizations |
| Backend | Node.js / Express | REST API, scheduling, optimization, auth, orchestrates calls to ML service |
| ML Service | Python / FastAPI / scikit-learn | Burst-time prediction, anomaly detection |
| Database | MongoDB (Atlas free tier) | Jobs, users, audit logs |
| Orchestration | k3s (Kubernetes) | Deployment, scaling, networking, security policy |

Data flow for a job submission:
```
User → Frontend → Backend /api/jobs → ML Service /predict → Backend stores job
                                                               (declared + predicted burst time)
```

Data flow for scheduling:
```
Frontend "Run Scheduler" → Backend /api/scheduler/run
  → pulls queued jobs, prefers predictedBurstTime over declared burstTime
  → runs chosen algorithm → returns Gantt chart + stats
```

## 2. OS Scheduling Algorithms — Complexity Analysis

| Algorithm | Time Complexity | Notes |
|---|---|---|
| FCFS | O(n log n) | Dominated by the arrival-time sort; scheduling pass itself is O(n) |
| SJF (non-preemptive) | O(n²) | Naive re-scan for shortest available job each step; fine at job-queue scale (n < 1000) |
| Round Robin | O(n · ⌈burst/quantum⌉) | Each job re-queued until its remaining burst is exhausted |
| Priority (non-preemptive) | O(n²) | Same re-scan pattern as SJF |
| MLFQ | O(n · levels · ⌈burst/quantum⌉) | Worst case similar to RR, multiplied by queue levels (3 here) |

**Observed behavior (from a 4-job test set in this repo):** SJF and Priority produced the lowest
average waiting time; Round Robin and MLFQ produced higher waiting time on this particular set
due to context-switch-style overhead from time-slicing — this matches OS theory (RR/MLFQ trade
some throughput for fairness and responsiveness) and is a good discussion point for your report.

## 3. DAA Optimization — Complexity Analysis

| Algorithm | Time Complexity | Purpose |
|---|---|---|
| Bin Packing (First-Fit-Decreasing) | O(n log n + n·k), k = bins | Approximation algorithm (not optimal, but within 11/9 OPT + 1 bin, a well-known bound) — minimizes number of VMs/pods needed |
| 0/1 Knapsack (Dynamic Programming) | O(n · budget) | Exact optimal solution — selects job subset maximizing value within a cost budget |

Both are classic NP-hard-adjacent problems (bin packing is NP-hard; knapsack is NP-hard but
pseudo-polynomial via DP) — a natural place to discuss approximation vs exact algorithms in your
DAA report.

## 4. AI / ML Layer

### 4.1 Burst-time predictor (`ml-service/predictor.py`)
- **Model:** Gradient Boosting Regressor (scikit-learn)
- **Features:** memory (MB), CPU cores, user-declared burst time, priority
- **Why it matters:** the scheduler and optimizer both prefer the *predicted* burst time over the
  raw user input, so a bad user estimate doesn't propagate into a bad schedule
- **Training data:** synthetic for this project build (documented in code) — in a production
  system this would retrain on logged declared-vs-actual burst times from completed jobs

### 4.2 Anomaly detector (`ml-service/anomaly.py`)
- **Model:** Isolation Forest (unsupervised — doesn't need labeled attack data)
- **Features:** event success/failure, action type (login / job submit / scheduler run)
- **Why Isolation Forest specifically:** no historical incident data exists for a new project, so
  a supervised classifier isn't viable; Isolation Forest flags statistical outliers (e.g. a burst
  of failed logins) without needing examples of "what an attack looks like"

### 4.3 Where AI fits vs where it doesn't
Both models are classical ML (not LLM-based) — they run on a few hundred KB of model weights with
no GPU, keeping the cluster within free-tier CPU/RAM limits and making predictions explainable
(important for a viva: you can point to feature importances, not a black box).

## 5. Security Design (maps to AWS Security Specialty domains)

| Domain | Implementation |
|---|---|
| Identity & Access Management | JWT auth on the API; Kubernetes RBAC (`k8s/rbac.yaml`) scoping the backend's ServiceAccount to only `get/list/watch` pods and configmaps in its own namespace |
| Infrastructure Security | `NetworkPolicy` default-deny with explicit allow rules between frontend/backend/ml-service (`k8s/networkpolicy.yaml`) |
| Data Protection | Secrets (Mongo URI, JWT secret) kept out of git via `kubectl create secret` / Helm `--set`, never committed in plaintext |
| Logging & Monitoring | `AuditLog` collection records every login/job/scheduler action; Isolation Forest scores them for anomalies |
| Governance | Kyverno policy-as-code (install documented in deployment guide) for cluster-wide guardrails |

## 6. Why Kubernetes (not just a VM)

The original project design used a single VM as the "compute layer." Upgrading to k3s gives:
- Real auto-scaling (HPA, optionally KEDA) instead of a static VM
- RBAC and NetworkPolicy as concrete, gradeable security artifacts
- A direct application of the CKA certification material
- A more realistic "cloud-native" story for the Cloud Application Development course
