import * as React from "react";
import {
  BarChart3,
  Database,
  FileText,
  Lightbulb,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
const features = [
  [FileText, "Single Text Prediction", "Analyze individual customer reviews."],
  [
    Upload,
    "Bulk CSV Prediction",
    "Upload multiple reviews and download results.",
  ],
  [BarChart3, "Visual Insights", "See sentiment distribution clearly."],
  [Zap, "Fast & Accurate", "Powered by the trained XGBoost model."],
  [
    Lightbulb,
    "Advanced NLP Preprocessing",
    "Clean and normalize text for accuracy.",
  ],
  [
    Database,
    "Trained ML Model",
    "CountVectorizer, scaler and XGBoost pipeline.",
  ],
  [ShieldCheck, "Privacy Focused", "Process data temporarily in memory."],
  [MonitorIcon, "Easy to Integrate", "Simple REST API for your applications."],
];
export default function Features({ onTryNow }) {
  return (
    <section className="features-page">
      <div className="features-hero">
        <div className="eyebrow">
          <Sparkles size={13} /> POWERFUL FEATURES
        </div>
        <h1>Features</h1>
        <p>
          Everything you need to analyze customer sentiment, simple, fast and
          accurate.
        </p>
      </div>
      <div className="feature-card-grid">
        {features.map(([Icon, title, text]) => (
          <article className="feature-detail-card" key={title}>
            <div className="detail-card-head">
              <span>{React.createElement(Icon, { size: 25 })}</span>
              <div>
                <h2>{title}</h2>
                <p>{text}</p>
              </div>
            </div>
            <ul>
              <li>
                <b>✓</b>Simple and easy to use
              </li>
              <li>
                <b>✓</b>Reliable sentiment classification
              </li>
              <li>
                <b>✓</b>Ready for real-world feedback
              </li>
            </ul>
            <div className="feature-demo centered-demo">
              {title === "Single Text Prediction"
                ? "This product is amazing!"
                : title === "Bulk CSV Prediction"
                  ? "Choose a CSV file...  Upload"
                  : title === "Visual Insights"
                    ? "Positive  80% - Negative  20%"
                    : title}
            </div>
          </article>
        ))}
      </div>
      <section className="use-case-band">
        <div>
          <h2>
            <BarChart3 /> Real-World Use Cases
          </h2>
          <p>
            SentimentAI can help in e-commerce, support, research, social media
            and business intelligence.
          </p>
        </div>
        <div className="growth-callout">
          <h2>Turn Feedback into Growth</h2>
          <p>Start analyzing customer sentiment today.</p>
          <button onClick={onTryNow}>Try It Now</button>
        </div>
      </section>
    </section>
  );
}
function MonitorIcon(props) {
  return <Database {...props} />;
}
