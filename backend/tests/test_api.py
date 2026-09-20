import io
import json

import pytest
from fastapi.testclient import TestClient

import api


@pytest.fixture()
def client(monkeypatch):
    class FakeModel:
        classes_ = [0, 1]

        def predict_proba(self, features):
            import numpy as np
            return np.array([[0.2, 0.8] if row.sum() >= 0 else [0.8, 0.2] for row in features])

    class FakeVectorizer:
        vocabulary_ = {"good": 0}

        def transform(self, corpus):
            import numpy as np
            return np.array([[1] if "good" in text else [-1] for text in corpus])

    class FakeScaler:
        n_features_in_ = 1

        def transform(self, features):
            return features

    monkeypatch.setattr(api, "load_stopwords", lambda: set())
    monkeypatch.setattr(api, "load_models", lambda: (FakeModel(), FakeScaler(), FakeVectorizer()))
    with TestClient(api.app) as test_client:
        yield test_client


def test_health_model_info_and_examples(client):
    assert client.get("/health").json()["model"] == "loaded"
    assert client.get("/model-info").json()["supported_sentiment_classes"] == ["Positive", "Negative"]
    assert len(client.get("/examples").json()["examples"]) >= 2


def test_valid_single_prediction(client):
    response = client.post("/predict", json={"text": "good product"})
    assert response.status_code == 200
    assert response.json() == {"text": "good product", "prediction": "Positive"}


@pytest.mark.parametrize("text", ["", "   ", "x" * 2001])
def test_invalid_single_text(client, text):
    response = client.post("/predict", json={"text": text})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_valid_csv_and_statistics(client):
    csv_data = b"Sentence\ngood product\nbad product\n"
    response = client.post("/predict", files={"file": ("reviews.csv", csv_data, "text/csv")})
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    statistics = json.loads(response.headers["x-sentiment-statistics"])
    assert statistics["total_reviews"] == 2
    assert statistics["positive_count"] == 1
    assert statistics["negative_count"] == 1
    assert b"Predicted sentiment" in response.content
    assert response.headers["x-graph-exists"] == "true"


@pytest.mark.parametrize(
    "filename,content,code",
    [
        ("reviews.csv", b"Review\ngood\n", "MISSING_COLUMN"),
        ("reviews.csv", b"", "EMPTY_FILE"),
        ("reviews.txt", b"Sentence\ngood\n", "INVALID_FILE_TYPE"),
    ],
)
def test_invalid_csv_uploads(client, filename, content, code):
    response = client.post("/predict", files={"file": (filename, content, "text/plain")})
    assert response.status_code == 400
    assert response.json()["error"]["code"] == code


def test_missing_file_and_unsupported_body(client):
    missing = client.post("/predict", files={"upload": ("reviews.csv", b"Sentence\ngood\n", "text/csv")})
    assert missing.status_code == 400
    assert missing.json()["error"]["code"] == "MISSING_FILE"
    unsupported = client.post("/predict", content=b"text/plain")
    assert unsupported.status_code == 415
    assert unsupported.json()["error"]["code"] == "UNSUPPORTED_MEDIA_TYPE"


def test_model_class_mapping_respects_model_order():
    class ReversedClassesModel:
        classes_ = [1, 0]

        def predict_proba(self, features):
            import numpy as np
            return np.array([[0.8, 0.2] for _ in features])

    predictor = ReversedClassesModel()
    assert api.sentiment_mapping(predictor, 0) == "Positive"
    assert api.sentiment_mapping(predictor, 1) == "Negative"
