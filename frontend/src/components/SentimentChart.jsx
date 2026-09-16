import { BarChart3 } from "lucide-react";

export default function SentimentChart({ graphImage, statistics }) {
  return (
    <>
      <article className="info-panel table-panel">
        <h2 className="panel-title">
          <BarChart3 size={19} />
          Bulk Output
        </h2>
        {graphImage ? (
          <img
            className="graph-image"
            src={graphImage}
            alt="Sentiment distribution"
          />
        ) : (
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
            <div>
              Worth the price. <strong>Positive</strong>
            </div>
          </div>
        )}
        <small>
          Bulk prediction returns a CSV file and a chart in response headers.
        </small>
      </article>
      {statistics && (
        <div className="stats-line">
          {statistics.total_reviews} reviews analyzed{" "}
          <span>{statistics.positive_count} positive</span>{" "}
          <span className="negative-text">
            {statistics.negative_count} negative
          </span>
        </div>
      )}
    </>
  );
}
