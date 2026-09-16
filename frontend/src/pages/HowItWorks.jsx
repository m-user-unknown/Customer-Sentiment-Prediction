import * as React from "react";
import {
  BarChart3,
  Brain,
  FileText,
  Lightbulb,
  List,
  SlidersHorizontal,
  Zap,
} from "lucide-react";

const steps = [
  ["Input", "You provide a review or CSV file.", FileText, "JSON or CSV"],
  [
    "Text Preprocessing",
    "We clean, lowercase, remove stopwords, and stem text.",
    Zap,
    "Clean Text",
  ],
  [
    "Feature Extraction",
    "CountVectorizer converts clean text to features.",
    List,
    "Vectorized Features",
  ],
  [
    "Feature Scaling",
    "A saved scaler prepares model input.",
    SlidersHorizontal,
    "Scaled Features",
  ],
  [
    "Prediction (XGBoost)",
    "The trained model predicts Positive or Negative.",
    Brain,
    "ML Model",
  ],
  [
    "Results",
    "Receive JSON or a CSV with a distribution chart.",
    BarChart3,
    "Insights",
  ],
];
export default function HowItWorks() {
  return (
    <section className="how-page">
      <div className="how-hero">
        <div className="eyebrow">
          <Lightbulb size={13} /> SIMPLE STEPS, POWERFUL INSIGHTS
        </div>
        <h1>How It Works</h1>
        <p>
          From raw customer reviews to meaningful insights, here&apos;s how
          SentimentAI analyzes text using
          <br />
          Natural Language Processing and Machine Learning.
        </p>
      </div>
      <div className="how-steps">
        {steps.map(([title, text, Icon, label], index) => (
          <article className="how-step" key={title}>
            <b className="step-number">{index + 1}</b>
            <span className="how-step-icon">
              {React.createElement(Icon, { size: 27 })}
            </span>
            <h2>{title}</h2>
            <p>{text}</p>
            <small>{label}</small>
          </article>
        ))}
      </div>
      <div className="how-output-grid">
        <article className="info-panel example-panel">
          <h2 className="panel-title">
            <FileText size={19} /> Example Input & Output
          </h2>
          <div className="json-flow">
            <pre className="example-code">{`{\n  "text": "This product is easy to use"\n}`}</pre>
            <BarChart3 className="flow-arrow" />
            <pre className="example-code">{`{\n  "prediction": "Positive"\n}`}</pre>
          </div>
        </article>
        <article className="info-panel bulk-panel">
          <h2 className="panel-title">
            <BarChart3 size={19} /> Bulk Prediction Output
          </h2>
          <div className="fake-table">
            <div>
              <b>Sentence</b>
              <b>Predicted sentiment</b>
            </div>
            <div>
              Great product! <strong>Positive</strong>
            </div>
            <div>
              Not satisfied with support.{" "}
              <strong className="negative">Negative</strong>
            </div>
          </div>
          <small className="panel-caption">
            Bulk prediction returns CSV results and a sentiment chart.
          </small>
        </article>
      </div>
    </section>
  );
}
