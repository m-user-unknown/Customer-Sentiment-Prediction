# SentimentAI Frontend

A React + Vite frontend for the Customer Sentiment Prediction application. It provides a clean landing experience, sentiment analysis workflow, bulk CSV predictions, charts, and API documentation for the backend service.

## Overview

This frontend lets users:

- analyze a single customer review
- upload a CSV file and run bulk sentiment predictions
- view sentiment results and visual insights
- switch between overview, how-it-works, features, API docs, and about pages
- use a light/dark theme toggle in the top navigation

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Lucide React icons
- Fetch-based API integration

## Main Features

### Landing page

The landing screen introduces the product and directs users to the prediction workspace or the how-it-works guide.

### Prediction workspace

Users can:

- enter free-text feedback
- submit a single review for sentiment analysis
- upload a CSV file for bulk predictions
- download generated prediction CSV results
- view output JSON and sentiment charts

### Additional pages

The app includes:

- How It Works
- Features
- API Docs
- About

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

## Environment Setup

The frontend connects to the backend API through the `VITE_API_URL` environment variable.

If you do not set it, the app defaults to:

```bash
http://0.0.0.0:8000
```

You can define it in a `.env` file like this:

```bash
VITE_API_URL=http://0.0.0.0:8000
```

## Installation

From the frontend folder:

```bash
npm install
```

## Run the App

Start the development server:

```bash
npm run dev
```

Then open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Production Build

```bash
npm run build
```

This creates the optimized production files in the `dist` folder.

## Preview Production Build

```bash
npm run preview
```

## API Integration

The frontend calls the backend endpoints through `src/services/api.js`:

- `POST /predict` for single text analysis
- `POST /predict` for CSV bulk prediction

The API response may include:

- prediction text or label
- generated graph image data
- sentiment statistics
- downloadable CSV output

## Notes

This frontend is designed to work alongside the Python FastAPI backend in the `backend/` folder. Make sure the backend server is running before using the prediction features.
