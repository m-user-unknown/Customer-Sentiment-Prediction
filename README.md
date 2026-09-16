# Customer Sentiment Prediction

An NLP application that predicts whether a customer review is **Positive** or **Negative**. The project includes a React frontend for interactive predictions and a FastAPI backend that serves a trained XGBoost model for single reviews and CSV uploads.

## Features

- Analyze an individual review and receive an immediate sentiment prediction.
- Upload a CSV file for bulk predictions.
- Download bulk results as `Predictions.csv`.
- View a sentiment distribution chart generated from bulk predictions.
- Check API health and inspect safe model metadata through backend endpoints.
- Validate review text, CSV structure, file type, and upload size.

## Technology stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React icons

### Backend and machine learning

- Python 3.12+
- FastAPI and Uvicorn
- Pandas for CSV processing
- NLTK and Porter stemming for text preprocessing
- CountVectorizer and scikit-learn scaling
- XGBoost for sentiment classification
- Matplotlib for bulk prediction charts

## Project structure

```text
.
├── backend/
│   ├── api.py
│   ├── requirements.txt
│   ├── tests/
│   ├── Data/
│   └── Models/
└── frontend/
		├── package.json
		└── src/
```

The trained model artifacts are stored in `backend/Models`. The backend resolves them relative to its own file location, so it does not depend on the current working directory.

## Run locally

### 1. Start the backend

From the `backend` directory:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m nltk.downloader stopwords
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

The backend is available at `http://localhost:8000`.

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`

### 2. Start the frontend

In a second terminal, from the `frontend` directory:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## API usage

### Single prediction

```bash
curl -X POST http://localhost:8000/predict \
	-H "Content-Type: application/json" \
	-d '{"text":"This product is easy to use and works great"}'
```

Example response:

```json
{
  "text": "This product is easy to use and works great",
  "prediction": "Positive"
}
```

### Bulk prediction

The CSV must contain a `Sentence` column and must not contain empty rows.

```bash
curl -X POST http://localhost:8000/predict \
	-F "file=@backend/Data/SentimentBulk.csv" \
	-o Predictions.csv
```

The response includes the original CSV columns plus `Predicted sentiment`. The existing frontend also reads the `X-Graph-Data` response header to display the distribution chart.

## Testing

Run backend tests from the `backend` directory:

```bash
.venv/bin/python -m pytest -q
```

## Configuration

The backend supports these environment variables:

| Variable                | Default                                       | Purpose                           |
| ----------------------- | --------------------------------------------- | --------------------------------- |
| `CORS_ORIGINS`          | `http://localhost:5173,http://localhost:3000` | Comma-separated browser origins   |
| `MAX_UPLOAD_SIZE_BYTES` | `10485760`                                    | Maximum CSV upload size           |
| `PREDICTION_BATCH_SIZE` | `512`                                         | CSV rows processed per model call |

For additional backend endpoint and error details, see [backend/README.md](backend/README.md).
