# CloudOpt — Deployment Guide

This walks you from a blank free-tier cloud account to a live, HTTPS-secured, auto-scaling
deployment of CloudOpt. Total cost: **₹0**, using only free-tier services.

---

## Part 0 — Prerequisites

- A GitHub account (for GHCR + Actions)
- An Oracle Cloud account (Always Free tier — no credit expiry) **or** an AWS account
  (12-month free tier)
- `kubectl`, `helm`, and `git` installed on your local machine
- A domain name (optional — you can use a free `nip.io` wildcard DNS instead, see Step 5)

---

## Part 1 — Provision the free-tier VM

1. Sign up for **Oracle Cloud Always Free** (oracle.com/cloud/free).
2. Create a Compute instance:
   - Shape: **VM.Standard.A1.Flex** (ARM, Always Free — up to 4 OCPU / 24GB RAM free) or
     **VM.Standard.E2.1.Micro** (AMD, smaller but simpler)
   - Image: Ubuntu 22.04
   - Open ports in the VM's **Security List / Network Security Group**: 22 (SSH), 80 (HTTP),
     443 (HTTPS), 6443 (Kubernetes API, optional if you want remote kubectl access)
3. SSH into the VM:
   ```bash
   ssh ubuntu@<VM_PUBLIC_IP>
   ```

---

## Part 2 — Install k3s (lightweight Kubernetes)

```bash
curl -sfL https://get.k3s.io | sh -
sudo systemctl status k3s   # confirm it's running
```

k3s ships with Traefik as its default ingress controller. For this guide we use **ingress-nginx**
instead (matches the manifests in this repo) — disable Traefik and install nginx:

```bash
# Re-install k3s with Traefik disabled
curl -sfL https://get.k3s.io | sh -s - --disable traefik

# Install ingress-nginx via Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  -n ingress-nginx --create-namespace
```

Copy the kubeconfig so you can run `kubectl`/`helm` from your laptop too:
```bash
# on the VM
sudo cat /etc/rancher/k3s/k3s.yaml
# copy the output locally to ~/.kube/config, then replace "127.0.0.1" with your VM's public IP
```

---

## Part 3 — cert-manager (free HTTPS)

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \
  -n cert-manager --create-namespace \
  --set installCRDs=true
```

Create a `ClusterIssuer` for Let's Encrypt:
```yaml
# cluster-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: YOUR_EMAIL@example.com
    privateKeySecretRef:
      name: letsencrypt-prod-key
    solvers:
      - http01:
          ingress:
            class: nginx
```
```bash
kubectl apply -f cluster-issuer.yaml
```

---

## Part 4 — Domain (or free DNS)

**Option A — You have a domain:** point an A record at the VM's public IP, e.g.
`cloudopt.yourdomain.com`.

**Option B — No domain:** use `nip.io`, which resolves any `<ip>.nip.io` to that IP for free —
no DNS setup needed. If your VM's IP is `140.1.2.3`, your host is `cloudopt.140.1.2.3.nip.io`.

Update `helm/cloudopt/values.yaml` → `ingress.host` with whichever you use.

---

## Part 5 — MongoDB (free-tier managed database)

1. Create a free cluster at **mongodb.com/cloud/atlas** (M0 tier, 512MB, free forever).
2. Add your VM's public IP to the Atlas IP allowlist (Network Access).
3. Create a database user, then copy the connection string:
   `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/cloudopt`

---

## Part 6 — GitHub Container Registry

1. Create a GitHub **Personal Access Token** (classic) with `write:packages` scope.
2. Create the image-pull secret on the cluster:
   ```bash
   kubectl create namespace cloudopt
   kubectl create secret docker-registry ghcr-secret \
     -n cloudopt \
     --docker-server=ghcr.io \
     --docker-username=YOUR_GH_USERNAME \
     --docker-password=YOUR_PAT \
     --docker-email=YOUR_EMAIL
   ```
3. Reference it in the deployments by adding `imagePullSecrets: [{ name: ghcr-secret }]` under
   each Deployment's `spec.template.spec` (the manifests in this repo assume public GHCR images —
   add this only if you make the packages private).

---

## Part 7 — Secrets

```bash
kubectl create secret generic cloudopt-secrets -n cloudopt \
  --from-literal=MONGO_URI="mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/cloudopt" \
  --from-literal=JWT_SECRET="$(openssl rand -hex 32)"
```
(The Helm chart also has a `secrets:` block in `values.yaml` — either approach works; don't do
both or the Helm one will overwrite this.)

---

## Part 8 — Self-hosted GitHub Actions runner (for CI/CD)

GitHub-hosted runners can't reach your private k3s cluster, so install a **self-hosted runner**
directly on the VM:

1. In your GitHub repo: Settings → Actions → Runners → New self-hosted runner → Linux.
2. Follow the generated `./config.sh` + `./run.sh` commands on the VM.
3. Install it as a service so it survives reboots:
   ```bash
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```
4. Make sure `helm` and `kubectl` are on the runner's PATH (they're already on the VM from
   Part 2–3).

Now every push to `main` will build images, push to GHCR, and run `helm upgrade` automatically
(see `.github/workflows/ci-cd.yaml`).

---

## Part 9 — First deploy

```bash
git clone <your-repo-url>
cd cloudopt

helm install cloudopt ./helm/cloudopt \
  -n cloudopt --create-namespace \
  --set image.registry=ghcr.io/YOUR_GH_USERNAME \
  --set ingress.host=cloudopt.YOUR_DOMAIN_OR_NIP_IO
```

Check status:
```bash
kubectl get pods -n cloudopt
kubectl get ingress -n cloudopt
```

Visit `https://cloudopt.YOUR_DOMAIN_OR_NIP_IO` — give cert-manager 1–2 minutes to issue the TLS
certificate on first load.

---

## Part 10 — Observability (optional but recommended for your report)

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace
```
Port-forward Grafana to view dashboards locally:
```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3001:80
# default login: admin / prom-operator
```

---

## Part 11 — Policy enforcement with Kyverno (ties to your Security Layer)

```bash
helm repo add kyverno https://kyverno.github.io/kyverno/
helm install kyverno kyverno/kyverno -n kyverno --create-namespace
```
Add a sample policy (e.g. disallow `:latest` tags in production, or require resource limits on
every pod) under a new `k8s/kyverno-policies/` folder as a stretch goal.

---

## Part 12 — Predictive autoscaling with KEDA (optional, the "AI scaling" demo)

```bash
helm repo add kedacore https://kedacore.github.io/charts
helm install keda kedacore/keda -n keda --create-namespace
kubectl apply -f k8s/keda-scaledobject.yaml
```
This requires exposing a `cloudopt_predicted_queue_depth` Prometheus metric from the backend
(derived from the ML service's burst-time predictions) — see `docs/ARCHITECTURE.md` for the
metric design. If you run short on time, documenting this as a designed-but-not-fully-wired
stretch goal is a legitimate and common scoping decision — say so explicitly in your report.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Pods stuck `Pending` | VM out of free-tier CPU/RAM | Check `kubectl describe pod`, reduce replica counts |
| `ImagePullBackOff` | Wrong registry path or private package without pull secret | Verify `image.registry` value, add `ghcr-secret` (Part 6) |
| Ingress 404 | DNS/nip.io host mismatch | Confirm `ingress.host` matches what you're browsing to |
| TLS cert stuck pending | cert-manager can't complete HTTP-01 challenge | Confirm port 80 is open and ingress-nginx is reachable publicly |
| Backend can't reach Mongo | Atlas IP allowlist | Add the VM's public IP (or `0.0.0.0/0` for demo only) in Atlas Network Access |
