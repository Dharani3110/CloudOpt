"""
AI Feature 3: Log anomaly detector for the security module.

Scores recent audit-log events (login attempts, job submissions, scheduler
runs) for anomalous patterns using Isolation Forest -- an unsupervised model
that needs no labeled "attack" data, which matters since we don't have real
incident history to train on. This directly implements the AWS Security
Specialty "logging & monitoring" + "threat detection" domains.
"""
import numpy as np
from sklearn.ensemble import IsolationForest

ACTION_ENCODING = {"login": 0, "job_submit": 1, "scheduler_run": 2, "optimizer_run": 3}


def _generate_synthetic_normal_traffic(n=500, seed=7):
    rng = np.random.default_rng(seed)
    success = rng.choice([1, 1, 1, 1, 0], size=n)  # mostly successful events
    action = rng.integers(0, 4, size=n).astype(float)
    return np.column_stack([success, action])


class AnomalyDetector:
    def __init__(self):
        X = _generate_synthetic_normal_traffic()
        self.model = IsolationForest(contamination=0.08, random_state=42)
        self.model.fit(X)

    def score(self, events: list[dict]) -> list[dict]:
        X = np.array([
            [e.get("success", 1), ACTION_ENCODING.get(e.get("action", "login"), 0)]
            for e in events
        ])
        raw_scores = self.model.decision_function(X)  # higher = more normal
        preds = self.model.predict(X)  # -1 = anomaly, 1 = normal
        results = []
        for e, s, p in zip(events, raw_scores, preds):
            results.append({
                "id": e.get("id"),
                "score": round(float(s), 4),
                "flagged": bool(p == -1)
            })
        return results


detector = AnomalyDetector()
