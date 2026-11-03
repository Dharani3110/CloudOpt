from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
from predictor import predictor
from anomaly import detector

app = FastAPI(title="CloudOpt ML Service", version="1.0.0")


class PredictRequest(BaseModel):
    jobs: List[Dict[str, Any]]


class AnomalyRequest(BaseModel):
    events: List[Dict[str, Any]]


@app.get("/health")
def health():
    return {"status": "ok", "service": "cloudopt-ml-service"}


@app.post("/predict")
def predict(req: PredictRequest):
    predictions = predictor.predict(req.jobs)
    return {"predictions": predictions}


@app.post("/anomaly")
def anomaly(req: AnomalyRequest):
    results = detector.score(req.events)
    return {"results": results}
