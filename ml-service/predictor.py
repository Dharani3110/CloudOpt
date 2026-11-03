"""
AI Feature 1: Burst-time / resource usage predictor.

Replaces the naive "trust the user-declared burst time" assumption with a
regression model trained on job characteristics. Its output feeds directly
into the DAA optimizer (bin packing / knapsack) instead of the raw input,
and can drive KEDA predictive autoscaling.

For the demo/project we train on synthetic-but-realistic data at startup.
In a real deployment this model is retrained periodically on logged
(declared vs actual) burst times collected from completed jobs.
"""
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor

FEATURE_NAMES = ["memoryMB", "cpuCores", "declaredBurstTime", "priority"]


def _generate_synthetic_training_data(n=800, seed=42):
    rng = np.random.default_rng(seed)
    memory = rng.uniform(64, 2048, n)
    cpu = rng.integers(1, 5, n).astype(float)
    declared = rng.uniform(1, 30, n)
    priority = rng.integers(1, 10, n).astype(float)

    # Ground truth: actual burst time correlates with declared time but with
    # systematic noise (users under/over-estimate), scaled by resource footprint.
    noise = rng.normal(0, 1.5, n)
    actual = (
        declared * 0.85
        + (memory / 512) * 0.6
        + (cpu * 0.4)
        + (10 - priority) * 0.1
        + noise
    )
    actual = np.clip(actual, 0.5, None)

    X = np.column_stack([memory, cpu, declared, priority])
    y = actual
    return X, y


class BurstTimePredictor:
    def __init__(self):
        X, y = _generate_synthetic_training_data()
        self.model = GradientBoostingRegressor(n_estimators=150, max_depth=3, random_state=42)
        self.model.fit(X, y)

    def predict(self, jobs: list[dict]) -> list[float]:
        X = np.array([
            [
                j.get("memoryMB", 256),
                j.get("cpuCores", 1),
                j.get("declaredBurstTime", 5),
                j.get("priority", 5),
            ]
            for j in jobs
        ])
        preds = self.model.predict(X)
        return [round(float(p), 2) for p in preds]


predictor = BurstTimePredictor()
