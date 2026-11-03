# CloudOpt — Software Requirements Specification (SRS)

## 1. Purpose
CloudOpt is a cloud-native platform that accepts job submissions, schedules them using classic OS
scheduling algorithms, optimizes resource placement using DAA techniques, and monitors security
events — deployed on Kubernetes using free-tier cloud infrastructure.

## 2. Scope
In scope: job submission, 5 scheduling algorithms, 2 optimization algorithms, ML-based burst-time
prediction, ML-based anomaly detection, authentication, a web dashboard, and a Kubernetes
deployment with autoscaling and network security policy.

Out of scope (noted explicitly as future work): multi-tenant billing, real workload execution
(jobs are simulated, not actually run as containers), service mesh, multi-region deployment.

## 3. Functional Requirements

| ID | Requirement |
|---|---|
| FR1 | User can register and log in (JWT-based auth) |
| FR2 | User can submit a job with name, arrival time, burst time, priority, memory, CPU cores |
| FR3 | System predicts burst time via ML and stores it alongside the declared value |
| FR4 | User can run any of FCFS / SJF / Round Robin / Priority / MLFQ against queued jobs |
| FR5 | System returns a Gantt chart and average waiting/turnaround time per run |
| FR6 | User can compare all 5 algorithms against the same job set in one action |
| FR7 | User can run Bin Packing to allocate jobs to capacity-limited VMs/pods |
| FR8 | User can run 0/1 Knapsack to select a job subset under a cost budget |
| FR9 | System logs login/job/scheduler actions to an audit log |
| FR10 | User can trigger an ML anomaly scan over recent audit log events |
| FR11 | Dashboard shows aggregate metrics (total/completed jobs, avg memory, flagged events) |

## 4. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR1 | Entire stack deployable on free-tier cloud services only (₹0 infrastructure cost) |
| NFR2 | Backend and frontend horizontally scalable via Kubernetes HPA |
| NFR3 | Network traffic between services restricted via default-deny NetworkPolicy |
| NFR4 | Secrets never committed to source control in plaintext |
| NFR5 | API responds to scheduling requests for ≤50 jobs within 2 seconds |

## 5. Use Case Summary

- **UC1 — Submit Job:** User fills job form → backend requests ML prediction → job persisted
- **UC2 — Run Scheduler:** User selects algorithm → backend computes schedule → Gantt + stats
  returned
- **UC3 — Optimize Allocation:** User runs bin packing or knapsack → backend returns allocation
- **UC4 — Monitor Security:** User triggers anomaly scan → ML service scores audit log → flagged
  events surfaced in UI

## 6. Agile Process Artifacts

This project was developed across 6 sprints (see project timeline doc). Each sprint produced:
- A sprint goal and backlog subset
- Working, demoable increment (not just documentation)
- A short retrospective note (what worked / what to change next sprint)

Suggested backlog format for your own tracking (Trello/Jira/GitHub Projects):
```
Epic: Scheduler Engine
  Story: As a user, I can run FCFS on my job queue so I can see execution order
  Story: As a user, I can compare all algorithms so I can pick the best fit
Epic: Security Layer
  Story: As a user, I can see flagged anomalous login attempts
```
