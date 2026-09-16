import { FileText, Sparkles } from "lucide-react";

export default function SinglePrediction({
  review,
  setReview,
  loading,
  onPredict,
  onKeyDown,
}) {
  return (
    <article className="work-card">
      <div className="card-heading">
        <span className="heading-icon">
          <FileText size={25} />
        </span>
        <span>
          <strong>Single Text Prediction</strong>
          <small>Enter a customer review and get instant sentiment</small>
        </span>
        <b>TEXT</b>
      </div>
      <div className="card-body">
        <div className="field-label">
          <label htmlFor="review">Enter Customer Review</label>
          <span>{review.length}/2000</span>
        </div>
        <textarea
          id="review"
          value={review}
          maxLength={2000}
          onChange={(event) => setReview(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type or paste customer review here..."
        />
        <div className="examples">
          <strong>Try an example:</strong>
          <button onClick={() => setReview("Great product!")}>
            "Great product!"
          </button>
          <button onClick={() => setReview("Not satisfied with the support")}>
            "Not satisfied"
          </button>
          <button onClick={() => setReview("Excellent service")}>
            "Excellent service"
          </button>
        </div>
        <button
          className="primary-action"
          disabled={!review.trim() || loading}
          onClick={onPredict}
        >
          <Sparkles size={17} />{" "}
          {loading ? "Analyzing..." : "Predict Sentiment"}
        </button>
      </div>
    </article>
  );
}
