import { BarChart3, Database, Lightbulb, ShieldCheck, Zap } from "lucide-react";
import SinglePrediction from "../components/SinglePrediction";
import BulkPrediction from "../components/BulkPrediction";
import PredictionResult from "../components/PredictionResult";
import SentimentChart from "../components/SentimentChart";

export default function Home({ state }) {
  const {
    review,
    setReview,
    loading,
    uploadedFile,
    fileName,
    downloadData,
    error,
    result,
    graphImage,
    statistics,
    onFileUpload,
    onSinglePrediction,
    onBulkPrediction,
    onDownload,
    onClear,
    onKeyDown,
    onNavigate,
  } = state;
  return (
    <section className="home-page" id="predictor">
      <div className="home-toolbar">
        <button onClick={() => onNavigate("landing")}>
          ← Back to overview
        </button>
        <span>Prediction workspace</span>
      </div>
      <section className="hero" id="predictor-intro">
        <div className="eyebrow">
          <Zap size={13} fill="currentColor" /> Powered by Machine Learning
        </div>
        <h1>Customer Sentiment Prediction</h1>
        <p>
          Analyze customer feedback from text or CSV files using advanced NLP
          and machine learning.
        </p>
        <span className="hero-subline">
          Get instant insights <i /> Understand your customers <i /> Make better
          decisions
        </span>
      </section>
      <section className="feature-strip">
        <Feature
          icon={<Lightbulb />}
          title="Supports Single & Bulk Text"
          text="Analyze one or many reviews"
        />
        <Feature
          icon={<Zap />}
          title="Fast & Accurate"
          text="Powered by XGBoost"
        />
        <Feature
          icon={<BarChart3 />}
          title="Visual Insights"
          text="See sentiment distribution"
        />
        <Feature
          icon={<ShieldCheck />}
          title="Privacy Focused"
          text="Your data stays safe"
        />
      </section>
      <section className="prediction-grid">
        <SinglePrediction
          {...{
            review,
            setReview,
            loading,
            onPredict: onSinglePrediction,
            onKeyDown,
          }}
        />
        <BulkPrediction
          {...{
            uploadedFile,
            fileName,
            loading,
            downloadData,
            onFileUpload,
            onPredict: onBulkPrediction,
            onDownload,
          }}
        />
      </section>
      <PredictionResult {...{ error, result, onClear }} />
      <section className="lower-grid">
        <article className="info-panel output-panel">
          <h2 className="panel-title">
            <Database size={19} /> Output
          </h2>
          <pre>
            {JSON.stringify(
              { text: review, sentiment: result || "Waiting for prediction" },
              null,
              2,
            )}
          </pre>
        </article>
        <SentimentChart {...{ graphImage, statistics }} />
      </section>
    </section>
  );
}
function Feature({ icon, title, text }) {
  return (
    <div className="feature">
      <span className="feature-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
    </div>
  );
}
