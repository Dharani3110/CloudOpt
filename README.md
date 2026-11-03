# CloudOpt

**Intelligent Cloud Resource Scheduler & Cost Optimizer** — a Kubernetes-native platform that
schedules compute jobs using classic OS algorithms, optimizes resource placement using DAA
techniques, predicts workload and detects security anomalies with classical ML, and deploys
entirely on free-tier cloud infrastructure.

Built to map across: **Operating Systems**, **Design & Analysis of Algorithms**, **Full Stack
Development**, **Software Engineering & Agile**, and **Cloud Application Development** (primary).

## What's in this repo

```
cloudopt/
├── backend/          Node/Express API: scheduling, optimization, auth, security
├── frontend/          React dashboard (Vite)
├── ml-service/        Python FastAPI: burst-time prediction + anomaly detection
├── k8s/                Raw Kubernetes manifests
├── helm/cloudopt/      Helm chart (preferred deployment method)
├── docs/               Architecture, Deployment Guide, User Guide, SRS
├── docker-compose.yml  Local dev — all 4 services + MongoDB in one command
└── .github/workflows/  CI/CD pipeline (GitHub Actions → GHCR → Helm deploy)
```

## Quick start (local, no Kubernetes needed)

```bash
docker compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/health
- ML service: http://localhost:8000/health

## Deploying to Kubernetes (free-tier cloud)

See **[docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** for the full step-by-step walkthrough
from a blank Oracle Cloud VM to a live HTTPS URL.

## Using the app

See **[docs/USER_GUIDE.md](docs/USER_GUIDE.md)**.

## How it's built

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the full component breakdown, algorithm
complexity analysis, and AI model design.

## Project requirements

See **[docs/SRS.md](docs/SRS.md)**.
