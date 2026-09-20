import base64
import json
import logging
import os
import pickle
import re
from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path
from typing import Any

import matplotlib
import nltk
import pandas as pd
from fastapi import FastAPI, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "Models"
MAX_TEXT_LENGTH = 2000
DEFAULT_MAX_UPLOAD_SIZE = 10 * 1024 * 1024
DEFAULT_BATCH_SIZE = 512
LOGGER = logging.getLogger("customer_sentiment_api")
matplotlib.use("Agg")
import matplotlib.pyplot as plt

CONTRACTION_MAP = {
    "ain't": "is not", "aren't": "are not", "can't": "cannot", "can't've": "cannot have",
    "could've": "could have", "couldn't": "could not", "didn't": "did not",
    "doesn't": "does not", "don't": "do not", "hadn't": "had not", "hasn't": "has not",
    "haven't": "have not", "he'd": "he would", "he'll": "he will", "he's": "he is",
    "how'd": "how did", "how'll": "how will", "how's": "how is", "i'd": "i would",
    "i'll": "i will", "i'm": "i am", "i've": "i have", "isn't": "is not",
    "it'd": "it would", "it'll": "it will", "it's": "it is", "let's": "let us",
    "mightn't": "might not", "might've": "might have", "mustn't": "must not",
    "must've": "must have", "needn't": "need not", "shan't": "shall not",
    "she'd": "she would", "she'll": "she will", "she's": "she is",
    "should've": "should have", "shouldn't": "should not", "that'd": "that would",
    "that's": "that is", "there'd": "there would", "there's": "there is",
    "they'd": "they would", "they'll": "they will", "they're": "they are",
    "they've": "they have", "wasn't": "was not", "we'd": "we would",
    "we'll": "we will", "we're": "we are", "we've": "we have", "weren't": "were not",
    "what'll": "what will", "what're": "what are", "what's": "what is",
    "what've": "what have", "where'd": "where did", "where's": "where is",
    "who'll": "who will", "who's": "who is", "won't": "will not", "would've": "would have",
    "wouldn't": "would not", "you'd": "you would", "you'll": "you will",
    "you're": "you are", "you've": "you have",
}
NEGATION_WORDS = {"no", "nor", "not", "never", "none", "nothing", "nowhere", "neither", "without", "cannot", "can", "against"}
CONTRACTION_PATTERN = re.compile(r"\b(" + "|".join(re.escape(key) for key in CONTRACTION_MAP) + r")\b", flags=re.IGNORECASE)
STEMMER = PorterStemmer()


class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    text: str = Field(..., min_length=1, max_length=MAX_TEXT_LENGTH)

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Text must contain at least one non-whitespace character.")
        return value


def get_int_setting(name: str, default: int) -> int:
    try:
        value = int(os.getenv(name, str(default)))
        if value <= 0:
            raise ValueError
        return value
    except ValueError:
        LOGGER.warning("Invalid %s setting; using default.", name)
        return default


def get_cors_origins() -> list[str]:
    default_origins = (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://0.0.0.0:5173,http://localhost:3000,"
        "http://127.0.0.1:3000,http://0.0.0.0:3000"
    )
    configured = os.getenv("CORS_ORIGINS", default_origins)
    return [origin.strip() for origin in configured.split(",") if origin.strip()]


def get_server_host() -> str:
    value = os.getenv("API_HOST", "0.0.0.0").strip() or "0.0.0.0"
    return value


def get_server_port() -> int:
    return get_int_setting("API_PORT", 8000)


def expand_contractions(text: str) -> str:
    def replace(match: re.Match[str]) -> str:
        return CONTRACTION_MAP.get(match.group(0).lower(), match.group(0))
    return CONTRACTION_PATTERN.sub(replace, text)


def load_stopwords() -> set[str]:
    try:
        english_stopwords = set(stopwords.words("english"))
    except LookupError:
        if nltk.download("stopwords", quiet=True):
            english_stopwords = set(stopwords.words("english"))
        else:
            raise RuntimeError("NLTK stopwords data is unavailable.") from None
    return english_stopwords - NEGATION_WORDS


def load_models() -> tuple[Any, Any | None, Any]:
    LOGGER.info("Loading trained model artifacts.")
    try:
        with open(MODELS_DIR / "model_xgb.pkl", "rb") as model_file:
            predictor = pickle.load(model_file)

        vectorizer_path = MODELS_DIR / "countVectorizer.pkl"
        with open(vectorizer_path, "rb") as vectorizer_file:
            vectorizer = pickle.load(vectorizer_file)

        scaler = None
        scaler_path = MODELS_DIR / "scaler.pkl"
        if scaler_path.exists():
            with open(scaler_path, "rb") as scaler_file:
                scaler = pickle.load(scaler_file)
    except Exception as error:
        LOGGER.exception("Model artifacts could not be loaded: %s", type(error).__name__)
        raise RuntimeError("Model artifacts could not be loaded.") from error
    LOGGER.info("Model artifacts loaded successfully.")
    return predictor, scaler, vectorizer


@asynccontextmanager
async def lifespan(application: FastAPI):
    application.state.max_upload_size = get_int_setting("MAX_UPLOAD_SIZE_BYTES", DEFAULT_MAX_UPLOAD_SIZE)
    application.state.batch_size = get_int_setting("PREDICTION_BATCH_SIZE", DEFAULT_BATCH_SIZE)
    try:
        application.state.stopwords = load_stopwords()
        application.state.predictor, application.state.scaler, application.state.vectorizer = load_models()
        application.state.model_error = None
    except Exception as error:
        application.state.model_error = str(error)
        LOGGER.error("Startup model loading failed.")
    yield


app = FastAPI(
    title="Customer Sentiment Prediction API",
    description="Predict customer sentiment for individual reviews or CSV uploads.",
    version="2.0.0",
    lifespan=lifespan,
    openapi_tags=[
        {"name": "status", "description": "Service and model status."},
        {"name": "prediction", "description": "Single and bulk sentiment predictions."},
        {"name": "frontend", "description": "Frontend discovery and example data."},
    ],
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
    expose_headers=["Content-Disposition", "X-Graph-Data", "X-Graph-Exists", "X-Sentiment-Statistics"],
)


def error_response(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"error": {"code": code, "message": message}})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    LOGGER.warning("Validation failure on %s: %s", request.url.path, len(exc.errors()))
    return error_response(422, "VALIDATION_ERROR", "The request contains invalid data.")


@app.exception_handler(Exception)
async def unexpected_exception_handler(request: Request, exc: Exception):
    LOGGER.exception("Unexpected error on %s: %s", request.url.path, type(exc).__name__)
    return error_response(500, "INTERNAL_ERROR", "An unexpected server error occurred.")


def require_model(application: FastAPI) -> tuple[Any, Any, Any]:
    if getattr(application.state, "model_error", None):
        raise RuntimeError("The prediction model is unavailable.")
    return application.state.predictor, application.state.scaler, application.state.vectorizer


@app.get("/", tags=["status"], summary="API overview")
def home():
    return {"name": app.title, "docs": "/docs", "health": "/health"}


@app.get("/test", tags=["status"], include_in_schema=False)
def test():
    return {"message": "Test request received successfully. Service is running."}


@app.get("/health", tags=["status"], summary="Check API and model health")
def health():
    model_loaded = not bool(getattr(app.state, "model_error", None))
    payload = {"status": "ok" if model_loaded else "degraded", "api": "ok", "model": "loaded" if model_loaded else "unavailable"}
    return JSONResponse(status_code=200 if model_loaded else 503, content=payload)


@app.get("/model-info", tags=["status"], summary="Return safe model metadata")
def model_info():
    try:
        predictor, scaler, vectorizer = require_model(app)
    except RuntimeError:
        return error_response(503, "MODEL_UNAVAILABLE", "The prediction model is unavailable.")
    classes = getattr(predictor, "classes_", [0, 1])
    return {
        "model": {"type": type(predictor).__name__, "classes": [str(value) for value in classes]},
        "preprocessing": {"text_cleaning": "contractions expanded, non-letters removed, negation words preserved, English stopwords removed, Porter stemming"},
        "vectorizer": {"type": type(vectorizer).__name__, "vocabulary_size": len(getattr(vectorizer, "vocabulary_", {}))},
        "scaler": {"type": type(scaler).__name__ if scaler else "none", "feature_count": getattr(scaler, "n_features_in_", None) if scaler else None},
        "supported_sentiment_classes": ["Positive", "Negative"],
    }


@app.get("/examples", tags=["frontend"], summary="Return example customer reviews")
def examples():
    return {"examples": [
        {"text": "This product is easy to use and works great.", "sentiment": "Positive"},
        {"text": "The quality was excellent and delivery was fast.", "sentiment": "Positive"},
        {"text": "The item stopped working after one day.", "sentiment": "Negative"},
        {"text": "Customer support did not resolve my issue.", "sentiment": "Negative"},
    ]}


@app.post("/predict", tags=["prediction"], summary="Predict one review or a CSV upload")
async def predict(request: Request):
    try:
        predictor, scaler, vectorizer = require_model(app)
    except RuntimeError:
        return error_response(503, "MODEL_UNAVAILABLE", "The prediction model is unavailable.")
    content_type = request.headers.get("content-type", "")
    LOGGER.info("Prediction request type: %s", "bulk" if content_type.startswith("multipart/") else "single")
    try:
        if content_type.startswith("multipart/form-data") or content_type.startswith("application/x-www-form-urlencoded"):
            form = await request.form()
            file = form.get("file")
            if not isinstance(file, UploadFile) and not hasattr(file, "read"):
                return error_response(400, "MISSING_FILE", "Provide a CSV file in the 'file' field.")
            return await predict_bulk(file, predictor, scaler, vectorizer)
        if content_type.startswith("application/json"):
            payload = PredictionRequest.model_validate(await request.json())
            prediction = single_prediction(predictor, scaler, vectorizer, payload.text, app.state.stopwords)
            return {"text": payload.text, "prediction": prediction}
        return error_response(415, "UNSUPPORTED_MEDIA_TYPE", "Use JSON or multipart/form-data.")
    except ValidationError:
        return error_response(422, "VALIDATION_ERROR", "The request contains invalid data.")
    except ValueError as error:
        return error_response(400, "INVALID_CSV", str(error))
    except Exception:
        LOGGER.exception("Prediction request failed.")
        return error_response(500, "PREDICTION_FAILED", "The prediction could not be completed.")


async def predict_bulk(file: UploadFile, predictor: Any, scaler: Any, vectorizer: Any):
    filename = file.filename or ""
    if not filename.lower().endswith(".csv"):
        return error_response(400, "INVALID_FILE_TYPE", "Only CSV files are supported.")
    content = await file.read(app.state.max_upload_size + 1)
    if len(content) > app.state.max_upload_size:
        return error_response(413, "FILE_TOO_LARGE", "The uploaded file exceeds the size limit.")
    if not content.strip():
        return error_response(400, "EMPTY_FILE", "The uploaded CSV file is empty.")
    try:
        data = pd.read_csv(BytesIO(content))
    except (pd.errors.EmptyDataError, pd.errors.ParserError, UnicodeDecodeError):
        return error_response(400, "INVALID_CSV", "The uploaded file is not a valid CSV.")
    if "Sentence" not in data.columns:
        return error_response(400, "MISSING_COLUMN", "CSV file must contain a 'Sentence' column.")
    if data.empty or data["Sentence"].isna().any() or data["Sentence"].astype(str).str.strip().eq("").any():
        return error_response(400, "EMPTY_ROWS", "The 'Sentence' column cannot contain empty rows.")
    LOGGER.info("Bulk request contains %d rows.", len(data))
    predictions_csv, graph, statistics = bulk_prediction(predictor, scaler, vectorizer, data, app.state.stopwords, app.state.batch_size)
    return StreamingResponse(predictions_csv, media_type="text/csv", headers={
        "Content-Disposition": "attachment; filename=Predictions.csv",
        "X-Graph-Exists": "true",
        "X-Graph-Data": base64.b64encode(graph.getbuffer()).decode("ascii"),
        "X-Sentiment-Statistics": json.dumps(statistics, separators=(",", ":")),
    })


def preprocess_text(text: str, stopword_list: set[str]) -> str:
    normalized = text.lower()
    normalized = expand_contractions(normalized)
    review = re.sub(r"[^a-zA-Z]", " ", normalized)
    words = review.split()
    return " ".join(STEMMER.stem(word) for word in words if word not in stopword_list)


def single_prediction(predictor: Any, scaler: Any, vectorizer: Any, text_input: str, stopword_list: set[str]) -> str:
    features = vectorizer.transform([preprocess_text(text_input, stopword_list)])
    if scaler is not None:
        features = scaler.transform(vectorizer_features(features))

    if hasattr(predictor, "predict_proba"):
        prediction = predictor.predict_proba(vectorizer_features(features)).argmax(axis=1)[0]
    else:
        prediction = int(predictor.predict(vectorizer_features(features))[0])
    return sentiment_mapping(predictor, prediction)


def bulk_prediction(predictor: Any, scaler: Any, vectorizer: Any, data: pd.DataFrame, stopword_list: set[str], batch_size: int):
    result = data.copy()
    predictions: list[int] = []
    for start in range(0, len(result), batch_size):
        batch = result["Sentence"].iloc[start:start + batch_size].astype(str)
        corpus = [preprocess_text(text, stopword_list) for text in batch]
        features = vectorizer.transform(corpus)
        if scaler is not None:
            features = scaler.transform(vectorizer_features(features))

        if hasattr(predictor, "predict_proba"):
            predictions.extend(predictor.predict_proba(vectorizer_features(features)).argmax(axis=1).tolist())
        else:
            predictions.extend(int(value) for value in predictor.predict(vectorizer_features(features)))
    result["Predicted sentiment"] = [sentiment_mapping(predictor, value) for value in predictions]
    statistics = get_sentiment_statistics(result)
    predictions_csv = BytesIO()
    result.to_csv(predictions_csv, index=False)
    predictions_csv.seek(0)
    return predictions_csv, get_distribution_graph(result), statistics


def vectorizer_features(transformed: Any) -> Any:
    return transformed.toarray() if hasattr(transformed, "toarray") else transformed


def get_sentiment_statistics(data: pd.DataFrame) -> dict[str, int | float]:
    total = len(data)
    positive = int((data["Predicted sentiment"] == "Positive").sum())
    negative = int((data["Predicted sentiment"] == "Negative").sum())
    return {"total_reviews": total, "positive_count": positive, "negative_count": negative,
            "positive_percentage": round(positive / total * 100, 2) if total else 0.0,
            "negative_percentage": round(negative / total * 100, 2) if total else 0.0}


def get_distribution_graph(data: pd.DataFrame) -> BytesIO:
    figure = plt.figure(figsize=(5, 5))
    tags = data["Predicted sentiment"].value_counts().reindex(["Positive", "Negative"], fill_value=0)
    tags.plot(kind="pie", autopct="%1.1f%%", shadow=True, colors=("green", "red"), startangle=90,
              wedgeprops={"linewidth": 1, "edgecolor": "black"}, title="Sentiment Distribution", xlabel="", ylabel="")
    graph = BytesIO()
    figure.savefig(graph, format="png")
    plt.close(figure)
    graph.seek(0)
    return graph


def sentiment_mapping(predictor: Any, value: int) -> str:
    classes = getattr(predictor, "classes_", [0, 1])
    label_value = value
    if isinstance(value, int) and 0 <= value < len(classes):
        label_value = classes[value]
    normalized = str(label_value).strip().lower()
    if normalized in {"1", "positive", "true"}:
        return "Positive"
    if normalized in {"0", "negative", "false"}:
        return "Negative"
    return "Positive" if int(value) == 1 else "Negative"


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host=get_server_host(), port=get_server_port(), reload=True)