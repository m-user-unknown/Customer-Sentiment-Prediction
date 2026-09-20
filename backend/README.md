# Customer Sentiment Prediction Backend

This backend powers the customer sentiment prediction feature for the project. It exposes a FastAPI service that loads a trained sentiment model, preprocesses customer review text, and returns either a single sentiment label or bulk predictions for CSV uploads.

## Backend folder analysis

The backend folder contains the ML API, model assets, data files, and test coverage for the service.

```text
backend/
├── api.py                     # FastAPI application and prediction logic
├── requirements.txt          # Python dependencies
├── pytest.ini                # pytest configuration
├── README.md                 # Backend documentation
├── .gitignore                # Ignores large ML artifacts and local files
├── _Correct_Data_Exploration__Modelling.ipynb
│                           # Notebook used for data exploration and training logic
├── Data/                     # Local dataset folder for training/testing data
├── Models/                   # Serialized trained model, vectorizer, and scaler
├── tests/
│   └── test_api.py          # API validation tests
└── .venv/                   # Local virtual environment (not committed)
```

### Main responsibilities

- `api.py`: defines the API server, startup model loading, validation, preprocessing, prediction logic, and CSV bulk-processing endpoints.
- `requirements.txt`: includes FastAPI, Uvicorn, pandas, scikit-learn, xgboost, nltk, matplotlib, and testing tools.
- `tests/test_api.py`: verifies the health endpoint, single prediction, CSV upload behavior, and error handling.
- `Data/`: stores training or sample review datasets, often excluded from git because of size.
- `Models/`: stores serialized model artifacts such as the trained XGBoost classifier, vectorizer, and optional scaler.
- `_Correct_Data_Exploration__Modelling.ipynb`: tracks the data science and model-building workflow used before deployment.

## Tech stack

- Python 3
- FastAPI for the REST API
- Pydantic for request validation
- Pandas for CSV reading and result processing
- NLTK for stopword handling and stemming
- scikit-learn / vectorizer preprocessing
- XGBoost for sentiment classification
- pytest for API tests

## Setup

From the `backend` directory:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m nltk.downloader stopwords
```

## Run the API

```bash
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

Then open:

- http://localhost:8000/docs
- http://localhost:8000/redoc

## Run tests

```bash
pytest -q
```

## Environment variables

The app reads these settings from the environment:

| Variable                | Default                                                                                                                           | Description                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `CORS_ORIGINS`          | `http://localhost:5173,http://127.0.0.1:5173,http://0.0.0.0:5173,http://localhost:3000,http://127.0.0.1:3000,http://0.0.0.0:3000` | Allowed frontend origins           |
| `MAX_UPLOAD_SIZE_BYTES` | `10485760`                                                                                                                        | Maximum CSV upload size (10 MB)    |
| `PREDICTION_BATCH_SIZE` | `512`                                                                                                                             | Number of rows processed per batch |
| `API_HOST`              | `0.0.0.0`                                                                                                                         | Host used by Uvicorn               |
| `API_PORT`              | `8000`                                                                                                                            | Port used by Uvicorn               |

Example:

```bash
export CORS_ORIGINS=http://localhost:5173
export MAX_UPLOAD_SIZE_BYTES=10485760
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

## Prediction flow

The backend follows this process:

1. Loads stopwords and model artifacts at application startup.
2. Cleans review text by expanding contractions, removing non-letter characters, removing English stopwords, and applying Porter stemming.
3. Converts text into vectorized features using the saved `CountVectorizer`.
4. Uses the trained XGBoost model to classify the review as `Positive` or `Negative`.
5. For CSV uploads, predicts each row, returns the new file, and adds sentiment statistics and a chart payload for the frontend.

## API endpoints

### `GET /`

Returns the service name and quick links to docs and health endpoints.

### `GET /health`

Returns API and model health status.

```json
{
  "status": "ok",
  "api": "ok",
  "model": "loaded"
}
```

### `GET /model-info`

Returns safe metadata about the model, preprocessing pipeline, vectorizer size, and supported classes.

### `GET /examples`

Returns example reviews and their expected sentiment labels.

### `POST /predict` with JSON

Request:

```json
{
  "text": "This product is easy to use and works great."
}
```

Response:

```json
{
  "text": "This product is easy to use and works great.",
  "prediction": "Positive"
}
```

### `POST /predict` with CSV upload

Upload a CSV file with a `Sentence` column in a multipart form:

```bash
curl -X POST "http://localhost:8000/predict" \
  -F "file=@reviews.csv"
```

The response is a CSV file with the original columns plus a `Predicted sentiment` column.
It also includes frontend headers:

- `X-Graph-Exists`
- `X-Graph-Data`
- `X-Sentiment-Statistics`

The statistics payload has this shape:

```json
{
  "total_reviews": 2,
  "positive_count": 1,
  "negative_count": 1,
  "positive_percentage": 50.0,
  "negative_percentage": 50.0
}
```

## Error handling

The API returns structured JSON errors like:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data."
  }
}
```

Common error codes include:

- `VALIDATION_ERROR`
- `MISSING_FILE`
- `INVALID_FILE_TYPE`
- `FILE_TOO_LARGE`
- `EMPTY_FILE`
- `INVALID_CSV`
- `MISSING_COLUMN`
- `EMPTY_ROWS`
- `MODEL_UNAVAILABLE`
- `PREDICTION_FAILED`
- `INTERNAL_ERROR`

## Data and model notes

This project keeps large ML assets outside the git repository to avoid pushing heavy files into source control. The backend expects the following local files to be present:

- `Data/combined_sentiment.tsv` or equivalent dataset files
- `Models/model_xgb.pkl`
- `Models/countVectorizer.pkl`
- `Models/scaler.pkl` (optional, if the model pipeline uses scaling)

If the data or trained models are not included in the repo, download them from your preferred storage location and place them in the matching folders before running the service.

## Notes

- The backend is designed to support the frontend app while keeping compatibility with the existing React UI contract.
- Model loading is performed during app startup, and if model files are missing the health endpoint reports degraded status instead of crashing the app.
- Bulk prediction supports CSV uploads and returns both predictions and a visualization-ready graph for the frontend.
