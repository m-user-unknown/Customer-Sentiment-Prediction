# Customer Sentiment Prediction Backend

FastAPI service for the trained XGBoost customer sentiment model. The service keeps the existing React contract for single and bulk predictions while adding health, metadata, examples, validation, and production-friendly local configuration.

## Setup

From this directory:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m nltk.downloader stopwords
```

## Environment variables

| Variable                | Default                                       | Description                                                                                  |
| ----------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `CORS_ORIGINS`          | `http://localhost:5173,http://localhost:3000` | Comma-separated allowed browser origins. Never set this to `*` when credentials are enabled. |
| `MAX_UPLOAD_SIZE_BYTES` | `10485760`                                    | Maximum CSV upload size, 10 MiB by default.                                                  |
| `PREDICTION_BATCH_SIZE` | `512`                                         | Number of CSV rows processed per model call.                                                 |

Example:

```bash
export CORS_ORIGINS=http://localhost:5173
export MAX_UPLOAD_SIZE_BYTES=10485760
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

Model files are resolved relative to `backend/Models`, so Uvicorn can be started from another working directory.

## Run and test

```bash
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
pytest -q
```

Interactive OpenAPI documentation is available at `http://localhost:8000/docs`; ReDoc is available at `http://localhost:8000/redoc`.

## API endpoints

### `GET /health`

Returns API and model status. A loaded model returns HTTP 200; a startup model-loading failure returns HTTP 503.

```json
{ "status": "ok", "api": "ok", "model": "loaded" }
```

### `GET /model-info`

Returns safe model type, class, preprocessing, vectorizer vocabulary size, scaler feature count, and supported classes. It never returns filesystem paths or model internals.

### `GET /examples`

Returns example reviews and their example sentiment labels for frontend use.

### `POST /predict` with JSON

Request content type: `application/json`

```json
{ "text": "This product is easy to use and works great" }
```

`text` must contain non-whitespace content and be no longer than 2000 characters. Response:

```json
{
  "text": "This product is easy to use and works great",
  "prediction": "Positive"
}
```

### `POST /predict` with CSV

Request content type: `multipart/form-data`, field name `file`. The filename must end in `.csv`, the file must contain a `Sentence` column, and rows cannot be empty. The response is `Predictions.csv` with the original columns plus `Predicted sentiment`.

The response preserves `X-Graph-Exists` and `X-Graph-Data` for the existing React frontend. It also includes `X-Sentiment-Statistics` as JSON:

```json
{
  "total_reviews": 2,
  "positive_count": 1,
  "negative_count": 1,
  "positive_percentage": 50.0,
  "negative_percentage": 50.0
}
```

### `GET /` and `GET /test`

Compatibility and service-overview endpoints retained for local development. `/test` is hidden from the generated OpenAPI schema.

## Errors

Errors use a consistent shape and do not expose stack traces, paths, or customer data:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data."
  }
}
```

Common codes include `VALIDATION_ERROR`, `MISSING_FILE`, `INVALID_FILE_TYPE`, `FILE_TOO_LARGE`, `EMPTY_FILE`, `INVALID_CSV`, `MISSING_COLUMN`, `EMPTY_ROWS`, `MODEL_UNAVAILABLE`, `PREDICTION_FAILED`, and `INTERNAL_ERROR`.

## Directory structure

```text
backend/
├── api.py
├── requirements.txt
├── README.md
├── tests/
│   └── test_api.py
├── Data/
│   ├── amazon_alexa.tsv
│   ├── Predictions.csv
│   └── SentimentBulk.csv
└── Models/
  ├── model_xgb.pkl
  ├── countVectorizer.pkl
  └── scaler.pkl
```
