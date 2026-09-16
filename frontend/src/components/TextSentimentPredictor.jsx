import * as React from "react";
import { AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Code2,
  CircleHelp,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Lightbulb,
  List,
  LockKeyhole,
  Monitor,
  Moon,
  Brain,
  Clipboard,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Upload,
  Zap,
} from "lucide-react";

const API_URL = "http://0.0.0.0:8000/predict";

export default function TextSentimentPredictor() {
  const [review, setReview] = React.useState("");
  const [uploadedFile, setUploadedFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const [downloadData, setDownloadData] = React.useState(null);
  const [fileName, setFileName] = React.useState("");
  const [graphImage, setGraphImage] = React.useState(null);
  const [statistics, setStatistics] = React.useState(null);
  const [darkMode, setDarkMode] = React.useState(false);
  const [page, setPage] = React.useState("home");
  const [exampleTab, setExampleTab] = React.useState("single");

  const clearResults = () => {
    setResult(null);
    setError(null);
    setDownloadData(null);
    setGraphImage(null);
    setStatistics(null);
  };
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a valid CSV file");
      return;
    }
    setUploadedFile(file);
    setFileName(file.name);
    clearResults();
  };
  async function handleSinglePrediction() {
    if (!review.trim()) {
      setError("Please enter some text to analyze");
      return;
    }
    setLoading(true);
    clearResults();
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: review }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error?.message ||
            data.error ||
            `Request failed with status ${response.status}`,
        );
      setResult(data.prediction || data.sentiment || data.label || "Unknown");
    } catch (requestError) {
      setError(
        requestError.message
          ? `Error: ${requestError.message}`
          : "Something went wrong while processing your request",
      );
    } finally {
      setLoading(false);
    }
  }
  async function handleBulkPrediction() {
    if (!uploadedFile) {
      setError("Please upload a CSV file first");
      return;
    }
    setLoading(true);
    clearResults();
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      const response = await fetch(API_URL, { method: "POST", body: formData });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error?.message ||
            data.error ||
            `Request failed with status ${response.status}`,
        );
      }
      const graphData = response.headers.get("X-Graph-Data");
      const statisticsData = response.headers.get("X-Sentiment-Statistics");
      if (graphData) setGraphImage(`data:image/png;base64,${graphData}`);
      if (statisticsData) setStatistics(JSON.parse(statisticsData));
      setDownloadData(await response.blob());
      setResult("Bulk prediction completed");
    } catch (requestError) {
      setError(
        requestError.message
          ? `Error: ${requestError.message}`
          : "Something went wrong while processing the file",
      );
    } finally {
      setLoading(false);
    }
  }
  const handleDownload = () => {
    if (!downloadData) return;
    const url = URL.createObjectURL(downloadData);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Predictions.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };
  const clearAll = () => {
    setReview("");
    setUploadedFile(null);
    setFileName("");
    clearResults();
    const input = document.getElementById("csv-upload");
    if (input) input.value = "";
  };
  const onKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      handleSinglePrediction();
    }
  };

  return (
    <main className={`app-shell ${darkMode ? "theme-dark" : ""}`}>
      <header className="topbar">
        <a className="brand" href="#home" aria-label="SentimentAI home">
          <span className="brand-mark">
            <BarChart3 size={24} strokeWidth={3} />
          </span>
          <span>
            <strong>SentimentAI</strong>
            <small>Understand Your Customers</small>
          </span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <a
            className={page === "home" ? "active" : ""}
            href="#home"
            onClick={() => setPage("home")}
          >
            Home
          </a>
          <a
            className={page === "how" ? "active" : ""}
            href="#how-it-works"
            onClick={() => setPage("how")}
          >
            How it works
          </a>
          <a
            className={page === "features" ? "active" : ""}
            href="#features"
            onClick={() => setPage("features")}
          >
            Features
          </a>
          <a
            className={page === "api" ? "active" : ""}
            href="#api-docs"
            onClick={() => setPage("api")}
          >
            API Docs
          </a>
          <a href="#about">About</a>
        </nav>
        <button
          className="icon-button"
          onClick={() => setDarkMode((value) => !value)}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </header>
      {page === "how" ? (
        <HowItWorksPage
          exampleTab={exampleTab}
          setExampleTab={setExampleTab}
          review={review}
          result={result}
          graphImage={graphImage}
          downloadData={downloadData}
          handleDownload={handleDownload}
          onTryExample={() => {
            setReview("This product is easy to use and works great");
            setPage("home");
          }}
        />
      ) : page === "features" ? (
        <FeaturesPage onTryNow={() => setPage("home")} />
      ) : page === "api" ? (
        <ApiDocsPage />
      ) : (
        <>
          <section className="hero" id="home">
            <div className="scribble scribble-left">
              Turn customer
              <br />
              feedback into
              <br />
              meaningful insights <ArrowRight size={30} />
            </div>
            <div className="scribble scribble-right">
              Better insights
              <br />
              Happier customers
              <br />
              Stronger business <ArrowRight size={30} />
            </div>
            <div className="eyebrow">
              <Zap size={13} fill="currentColor" /> Powered by Machine Learning
            </div>
            <h1>Customer Sentiment Prediction</h1>
            <p>
              Analyze customer feedback from text or CSV files using advanced
              NLP and machine learning.
            </p>
            <span className="hero-subline">
              Get instant insights <i /> Understand your customers <i /> Make
              better decisions
            </span>
          </section>
          <section className="feature-strip" id="features">
            <Feature
              icon={<CircleHelp />}
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
            <article className="work-card">
              <CardHeading
                icon={<FileText />}
                title="Single Text Prediction"
                subtitle="Enter a customer review and get instant sentiment"
                badge="TEXT"
              />
              <div className="card-body">
                <div className="field-label">
                  <label htmlFor="review">Enter Customer Review</label>
                  <span>{review.length}/2000</span>
                </div>
                <textarea
                  id="review"
                  value={review}
                  maxLength={2000}
                  onChange={(event) => {
                    setReview(event.target.value);
                    setError(null);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="Type or paste customer review here..."
                />
                <div className="examples">
                  <strong>Try an example:</strong>
                  <button onClick={() => setReview("Great product!")}>
                    "Great product!"
                  </button>
                  <button
                    onClick={() => setReview("Not satisfied with the support")}
                  >
                    "Not satisfied 😕"
                  </button>
                  <button onClick={() => setReview("Excellent service")}>
                    "Excellent service"
                  </button>
                </div>
                <button
                  className="primary-action"
                  disabled={!review.trim() || loading}
                  onClick={handleSinglePrediction}
                >
                  <Sparkles size={17} />{" "}
                  {loading ? "Analyzing..." : "Predict Sentiment"}
                </button>
              </div>
            </article>
            <article className="work-card">
              <CardHeading
                icon={<Upload />}
                title="Bulk CSV Prediction"
                subtitle="Upload a CSV file with customer reviews"
                badge="CSV"
              />
              <div className="card-body">
                <div className={`dropzone ${uploadedFile ? "has-file" : ""}`}>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                  />
                  <FileSpreadsheet size={40} />
                  <strong>{uploadedFile ? fileName : "Upload CSV File"}</strong>
                  <span>
                    {uploadedFile
                      ? "File ready for analysis"
                      : "Choose a CSV file or drag and drop it here"}
                  </span>
                  <label htmlFor="csv-upload" className="select-file">
                    <Upload size={15} />{" "}
                    {uploadedFile ? "Change File" : "Select File"}
                  </label>
                  <small>
                    CSV should have a “Sentence” column containing text to
                    analyze.
                  </small>
                </div>
                <button
                  className="primary-action"
                  disabled={!uploadedFile || loading}
                  onClick={handleBulkPrediction}
                >
                  <BarChart3 size={17} />{" "}
                  {loading ? "Processing..." : "Predict Bulk Sentiment"}
                </button>
                {downloadData && (
                  <button className="download-action" onClick={handleDownload}>
                    <Download size={16} /> Download Predictions.csv
                  </button>
                )}
              </div>
            </article>
          </section>
          <AnimatePresence mode="wait">
            {(error || result) && (
              <div
                className={`notice ${error ? "notice-error" : "notice-success"}`}
              >
                <strong>
                  {error ? "Something needs attention" : "Prediction result"}
                </strong>
                <span>{error || result}</span>
                <button onClick={clearAll}>Clear</button>
              </div>
            )}
          </AnimatePresence>
          <section className="lower-grid" id="how-it-works">
            <article className="info-panel process-panel">
              <PanelTitle icon={<Lightbulb />} title="How It Works" />
              <div className="steps">
                <Step number="1" title="Input" text="Text or CSV file" />
                <ChevronRight />
                <Step number="2" title="Preprocess" text="Clean & stem text" />
                <ChevronRight />
                <Step number="3" title="Transform" text="Vectorize & scale" />
                <ChevronRight />
                <Step number="4" title="Predict" text="XGBoost model" />
                <ChevronRight />
                <Step number="5" title="Get Results" text="Sentiment + chart" />
              </div>
            </article>
            <article className="info-panel output-panel">
              <PanelTitle icon={<BarChart3 />} title="Output" />
              {result && !graphImage ? (
                <pre>
                  {JSON.stringify({ text: review, sentiment: result }, null, 2)}
                </pre>
              ) : (
                <div className="empty-output">
                  <Database size={24} />
                  <span>Single prediction returns JSON</span>
                </div>
              )}
            </article>
            <article className="info-panel table-panel">
              <PanelTitle icon={<FileText />} title="Bulk Output" />
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
                Bulk prediction returns a CSV file and a chart in response
                headers.
              </small>
            </article>
          </section>
          {statistics && (
            <div className="stats-line">
              {statistics.total_reviews} reviews analyzed{" "}
              <span>{statistics.positive_count} positive</span>{" "}
              <span className="negative-text">
                {statistics.negative_count} negative
              </span>
            </div>
          )}
          <footer id="about">
            <span>
              <Database size={16} /> Built with FastAPI <i /> NLTK <i /> XGBoost{" "}
              <i /> Pandas <i /> Matplotlib
            </span>
            <span>
              <ShieldCheck size={16} /> API running on http://localhost:8000{" "}
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
              >
                View API Docs <ArrowRight size={15} />
              </a>
            </span>
          </footer>
          {(review || uploadedFile || result || error) && (
            <button className="clear-button" onClick={clearAll}>
              Clear all
            </button>
          )}
        </>
      )}
    </main>
  );
}

function ApiDocsPage() {
  const [tryTab, setTryTab] = React.useState("single");
  const [apiText, setApiText] = React.useState("This product is amazing!");
  const [apiFile, setApiFile] = React.useState(null);
  const [apiResponse, setApiResponse] = React.useState(null);
  const [apiLoading, setApiLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState(null);
  const [copied, setCopied] = React.useState(false);

  const copyBaseUrl = async () => {
    await navigator.clipboard?.writeText("http://localhost:8000");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  const sendApiRequest = async () => {
    setApiLoading(true);
    setApiError(null);
    setApiResponse(null);
    try {
      const options =
        tryTab === "single"
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: apiText }),
            }
          : (() => {
              const body = new FormData();
              if (apiFile) body.append("file", apiFile);
              return { method: "POST", body };
            })();
      if (tryTab === "bulk" && !apiFile)
        throw new Error("Choose a CSV file before sending the request.");
      const response = await fetch(API_URL, options);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error?.message ||
            data.error ||
            `Request failed with status ${response.status}`,
        );
      }
      setApiResponse(
        tryTab === "single"
          ? await response.json()
          : {
              status: "CSV response received",
              file: "Predictions.csv",
              contentType: response.headers.get("content-type"),
            },
      );
    } catch (requestError) {
      setApiError(requestError.message);
    } finally {
      setApiLoading(false);
    }
  };
  const scrollToEndpoint = (id) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <section className="api-page" id="api-docs">
      <aside className="api-sidebar">
        <h2>
          <BookOpen size={17} /> API DOCUMENTATION
        </h2>
        <button
          className="api-side-active"
          onClick={() => scrollToEndpoint("api-introduction")}
        >
          <BookOpen size={15} /> Introduction
        </button>
        <button onClick={() => scrollToEndpoint("api-authentication")}>
          <ShieldCheck size={15} /> Authentication
        </button>
        <button onClick={() => scrollToEndpoint("api-endpoints")}>
          <Code2 size={15} /> Endpoints <ChevronDown size={14} />
        </button>
        <div className="api-subnav">
          <button onClick={() => scrollToEndpoint("api-predict")}>
            POST /predict
          </button>
          <button onClick={() => scrollToEndpoint("api-health")}>
            Health Check
          </button>
          <button onClick={() => scrollToEndpoint("api-response")}>
            Response Format
          </button>
          <button onClick={() => scrollToEndpoint("api-errors")}>
            Error Codes
          </button>
        </div>
        <button onClick={() => scrollToEndpoint("api-examples")}>
          <Lightbulb size={15} /> Examples
        </button>
        <button onClick={() => scrollToEndpoint("api-rate-limits")}>
          <Zap size={15} /> Rate Limits
        </button>
        <button onClick={() => scrollToEndpoint("api-sdks")}>
          <Database size={15} /> SDKs & Libraries
        </button>
        <button onClick={() => scrollToEndpoint("api-changelog")}>
          <FileText size={15} /> Changelog
        </button>
        <div className="api-help">
          <CircleHelp size={18} />
          <strong>Need Help?</strong>
          <p>Check our GitHub or contact us if you face any issues.</p>
          <button>◉ View on GitHub</button>
          <button>✉ Contact Support</button>
        </div>
      </aside>
      <div className="api-main">
        <div className="api-main-hero" id="api-introduction">
          <div className="eyebrow">
            <BookOpen size={13} /> API DOCUMENTATION
          </div>
          <h1>SentimentAI API</h1>
          <p>
            Integrate powerful sentiment analysis into your applications with
            our simple and reliable API.
          </p>
        </div>
        <div className="api-highlights">
          <Feature
            icon={<Zap />}
            title="Simple REST API"
            text="Easy to integrate"
          />
          <Feature
            icon={<FileText />}
            title="JSON & CSV Support"
            text="Single and bulk prediction"
          />
          <Feature
            icon={<ShieldCheck />}
            title="Fast Response"
            text="< 1 second"
          />
          <Feature
            icon={<BarChart3 />}
            title="Production Ready"
            text="Reliable and scalable"
          />
        </div>
        <ApiSection number="1" id="api-authentication" title="Introduction">
          <p>
            The SentimentAI API allows you to analyze customer sentiment from
            text or CSV files using our trained XGBoost model. You can send
            individual reviews or multiple reviews in a CSV file and get
            predictions as <mark>Positive</mark> or <mark>Negative</mark>.
          </p>
        </ApiSection>
        <ApiSection number="2" title="Base URL">
          <div className="base-url">
            <code>http://localhost:8000</code>
            <button onClick={copyBaseUrl} title="Copy base URL">
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
            <b>Local Development</b>
          </div>
          <div className="api-info-note">
            ⓘ For production, replace with your deployed URL (e.g.,
            https://api.yourdomain.com).
          </div>
        </ApiSection>
        <ApiSection number="3" id="api-endpoints" title="Endpoints">
          <div className="endpoint-card" id="api-predict">
            <div className="endpoint-title">
              <b>POST</b>
              <strong>/predict</strong>
              <span>Predict sentiment for text or CSV file</span>
            </div>
            <p>
              Accepts either a JSON request with a text field or a CSV file with
              a Sentence column.
            </p>
            <div className="endpoint-columns">
              <div>
                <strong>▣ Content Type</strong>
                <code>application/json (for single text)</code>
                <code>multipart/form-data (for CSV file)</code>
              </div>
              <div>
                <strong>↗ Response</strong>
                <span>JSON (for single text)</span>
                <span>CSV file + chart (for bulk CSV)</span>
              </div>
            </div>
          </div>
        </ApiSection>
        <ApiSection number="4" id="api-examples" title="Single Text Prediction">
          <p>Send a single customer review and get the predicted sentiment.</p>
          <div className="api-code-block">
            <code>{`POST /predict\nContent-Type: application/json\n\n{\n  "text": "This product is amazing!"\n}`}</code>
          </div>
        </ApiSection>
        <div className="api-workbench" id="api-response">
          <div className="workbench-heading">
            <span>
              <Zap size={15} /> Try It Out
            </span>
            <small>Test the API directly from your browser.</small>
          </div>
          <div className="try-tabs">
            <button
              className={tryTab === "single" ? "selected" : ""}
              onClick={() => setTryTab("single")}
            >
              Single Text
            </button>
            <button
              className={tryTab === "bulk" ? "selected" : ""}
              onClick={() => setTryTab("bulk")}
            >
              CSV File
            </button>
          </div>
          {tryTab === "single" ? (
            <textarea
              value={apiText}
              onChange={(event) => setApiText(event.target.value)}
            />
          ) : (
            <input
              className="api-file-input"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => setApiFile(event.target.files?.[0] || null)}
            />
          )}
          {apiError && <div className="api-request-error">{apiError}</div>}
          <button
            className="send-request"
            onClick={sendApiRequest}
            disabled={apiLoading}
          >
            {apiLoading ? "Sending..." : "➤ Send Request"}
          </button>
          {apiResponse && (
            <pre className="api-live-response">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          )}
        </div>
        <ApiSection number="5" id="api-health" title="Health Check">
          <p>
            Use <code>GET /health</code> to verify that the API and trained
            model are available.
          </p>
        </ApiSection>
        <ApiSection number="6" id="api-response" title="Response Format">
          <p>
            Successful JSON predictions return <code>text</code> and{" "}
            <code>prediction</code>. Bulk requests return{" "}
            <code>Predictions.csv</code> and expose chart data through response
            headers.
          </p>
        </ApiSection>
        <ApiSection number="7" id="api-errors" title="Error Codes">
          <p>
            Validation and service failures use a consistent error object with a
            safe code and message.
          </p>
        </ApiSection>
        <div className="api-placeholder-sections">
          <span id="api-rate-limits">Rate Limits</span>
          <span id="api-sdks">SDKs & Libraries</span>
          <span id="api-changelog">Changelog</span>
        </div>
      </div>
      <aside className="api-rightbar">
        <div className="right-card">
          <h3>
            <Database size={18} /> Base URL <b>Development</b>
          </h3>
          <div className="right-code">
            http://localhost:8000 <Copy size={14} onClick={copyBaseUrl} />
          </div>
        </div>
        <div className="right-card endpoint-list">
          <h3>◉ Available Endpoints</h3>
          <button onClick={() => scrollToEndpoint("api-predict")}>
            <b>POST</b>
            <span>
              <strong>/predict</strong>Predict sentiment (text or CSV)
            </span>
            <ChevronRight />
          </button>
          <button onClick={() => scrollToEndpoint("api-introduction")}>
            <b>GET</b>
            <span>
              <strong>/</strong>API information
            </span>
            <ChevronRight />
          </button>
          <button onClick={() => scrollToEndpoint("api-health")}>
            <b>GET</b>
            <span>
              <strong>/health</strong>Health check
            </span>
            <ChevronRight />
          </button>
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
            <b>GET</b>
            <span>
              <strong>/docs</strong>Interactive documentation
            </span>
            <ChevronRight />
          </a>
          <a
            href="http://localhost:8000/redoc"
            target="_blank"
            rel="noreferrer"
          >
            <b>GET</b>
            <span>
              <strong>/redoc</strong>Alternative documentation
            </span>
            <ChevronRight />
          </a>
        </div>
      </aside>
    </section>
  );
}

function ApiSection({ number, title, id, children }) {
  return (
    <section className="api-section" id={id}>
      <b className="api-number">{number}.</b>
      <div>
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  );
}

function FeaturesPage({ onTryNow }) {
  const featureCards = [
    {
      icon: <FileText />,
      title: "Single Text Prediction",
      text: "Analyze the sentiment of an individual customer review or feedback text.",
      points: [
        "Instant prediction (Positive / Negative)",
        "Clean and easy to use",
        "Example texts provided",
      ],
      kind: "text",
    },
    {
      icon: <Upload />,
      title: "Bulk CSV Prediction",
      text: "Upload a CSV file with multiple reviews and get predictions for all at once.",
      points: [
        "Supports large files (thousands of reviews)",
        "Download results as CSV",
        "Get sentiment distribution chart",
      ],
      kind: "upload",
    },
    {
      icon: <BarChart3 />,
      title: "Visual Insights",
      text: "Get a clear visual representation of customer sentiment.",
      points: [
        "Sentiment distribution charts",
        "Positive vs Negative breakdown",
        "Charts returned as image (base64)",
      ],
      kind: "chart",
    },
    {
      icon: <Zap />,
      title: "Fast & Accurate",
      text: "Powered by a trained XGBoost model for high performance.",
      points: [
        "Quick response time",
        "Trained on real customer reviews",
        "Reliable sentiment classification",
      ],
      kind: "speed",
    },
    {
      icon: <Lightbulb />,
      title: "Advanced NLP Preprocessing",
      text: "Clean and normalize text for better accuracy.",
      points: [
        "Remove non-letter characters",
        "Lowercase conversion",
        "Remove English stopwords",
        "Porter stemming",
      ],
      kind: "nlp",
    },
    {
      icon: <Database />,
      title: "Trained ML Model",
      text: "Uses a pre-trained CountVectorizer, scaler and XGBoost model.",
      points: [
        "CountVectorizer for feature extraction",
        "Feature scaling for better performance",
        "XGBoost for accurate predictions",
      ],
      kind: "model",
    },
    {
      icon: <ShieldCheck />,
      title: "Privacy Focused",
      text: "Your data is processed temporarily and not stored permanently.",
      points: [
        "Files are processed in memory",
        "No long-term storage of your data",
        "Safe and secure",
      ],
      kind: "privacy",
    },
    {
      icon: <MonitorIcon />,
      title: "Easy to Integrate",
      text: "Use our simple REST API to integrate sentiment analysis into your own apps.",
      points: [
        "Simple /predict endpoint",
        "Supports JSON and CSV",
        "Interactive API documentation",
      ],
      kind: "api",
    },
  ];
  return (
    <section className="features-page" id="features">
      <div className="features-hero">
        <div className="eyebrow">
          <Sparkles size={13} fill="currentColor" /> POWERFUL FEATURES
        </div>
        <h1>Features</h1>
        <p>
          Everything you need to analyze customer sentiment — simple, fast and
          accurate.
          <br />
          Turn customer feedback into meaningful insights.
        </p>
      </div>
      <div className="feature-card-grid">
        {featureCards.map((card) => (
          <FeatureDetailCard key={card.title} {...card} />
        ))}
      </div>
      <section className="use-case-band">
        <div className="use-case-content">
          <h2>
            <TargetIcon /> Real-World Use Cases
          </h2>
          <p>SentimentAI can help in various domains:</p>
          <div className="use-case-list">
            <UseCase
              icon={<ShoppingCartIcon />}
              title="E-commerce"
              text="Analyze product reviews and customer feedback"
            />
            <UseCase
              icon={<HeadphonesIcon />}
              title="Customer Support"
              text="Understand customer satisfaction"
            />
            <UseCase
              icon={<BarChart3 />}
              title="Market Research"
              text="Track brand perception and trends"
            />
            <UseCase
              icon={<CircleHelp />}
              title="Social Media"
              text="Monitor public opinion"
            />
            <UseCase
              icon={<Database />}
              title="Business Intelligence"
              text="Make data-driven decisions"
            />
          </div>
        </div>
        <div className="growth-callout">
          <ArrowUpIcon />
          <div>
            <h2>Turn Feedback into Growth</h2>
            <p>
              Start analyzing customer sentiment today
              <br />
              and make better decisions.
            </p>
          </div>
          <button onClick={onTryNow}>
            Try It Now <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </section>
  );
}

function FeatureDetailCard({ icon, title, text, points, kind }) {
  return (
    <article className="feature-detail-card">
      <div className="detail-card-head">
        <span>{React.cloneElement(icon, { size: 25 })}</span>
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
      </div>
      <ul>
        {points.map((point) => (
          <li key={point}>
            <b>✓</b>
            {point}
          </li>
        ))}
      </ul>
      <FeatureDemo kind={kind} />
    </article>
  );
}

function FeatureDemo({ kind }) {
  if (kind === "text")
    return (
      <div className="feature-demo text-demo">
        <span>This product is amazing!</span>
        <b>
          <ArrowRight size={15} />
        </b>
      </div>
    );
  if (kind === "upload")
    return (
      <div className="feature-demo upload-demo">
        <span>
          <FileText size={15} /> Choose a CSV file...
        </span>
        <b>Upload</b>
      </div>
    );
  if (kind === "chart")
    return (
      <div className="feature-demo mini-bars">
        <span>Positive</span>
        <i />
        <b>80%</b>
        <span>Negative</span>
        <i className="negative-bar" />
        <b>20%</b>
      </div>
    );
  if (kind === "speed")
    return (
      <div className="feature-demo speed-demo">
        <CircleHelp size={22} />
        <span>
          Average response time<strong>&lt; 1 second</strong>
        </span>
      </div>
    );
  if (kind === "nlp")
    return (
      <div className="feature-demo code-demo">
        "This Product!!!" -&gt; "product"
      </div>
    );
  if (kind === "model")
    return (
      <div className="feature-demo centered-demo">
        Model: XGBoost Classifier
        <br />
        Labels: Positive / Negative
      </div>
    );
  if (kind === "privacy")
    return (
      <div className="feature-demo privacy-demo">
        <LockKeyhole size={25} />
        <span>
          <strong>Your data stays private</strong>
          <small>We value your trust.</small>
        </span>
      </div>
    );
  return (
    <div className="feature-demo api-demo">
      <strong>POST /predict</strong>
      <span>Content-Type: application/json</span>
      <Clipboard size={14} />
    </div>
  );
}

function UseCase({ icon, title, text }) {
  return (
    <div className="use-case">
      <span>{React.cloneElement(icon, { size: 22 })}</span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </div>
  );
}
function MonitorIcon(props) {
  return <Monitor {...props} />;
}
function TargetIcon(props) {
  return <CircleHelp {...props} />;
}
function ShoppingCartIcon(props) {
  return <Upload {...props} />;
}
function HeadphonesIcon(props) {
  return <CircleHelp {...props} />;
}
function ArrowUpIcon(props) {
  return <ArrowRight {...props} />;
}

function HowItWorksPage({
  exampleTab,
  setExampleTab,
  review,
  result,
  graphImage,
  downloadData,
  handleDownload,
  onTryExample,
}) {
  const singleRequest = review || "This product is easy to use and works great";
  const singleResponse = result || "Positive";
  return (
    <section className="how-page" id="how-it-works">
      <div className="how-hero">
        <div className="eyebrow">
          <Lightbulb size={13} /> SIMPLE STEPS, POWERFUL INSIGHTS
        </div>
        <h1>How It Works</h1>
        <p>
          From raw customer reviews to meaningful insights — here&apos;s how
          SentimentAI analyzes text using
          <br className="desktop-only" /> Natural Language Processing and
          Machine Learning.
        </p>
      </div>
      <div className="how-steps">
        <HowStep number="1" icon={<FileText />} title="Input">
          You provide a single review (text) or upload a CSV file containing
          multiple reviews.
        </HowStep>
        <HowStep number="2" icon={<Zap />} title="Text Preprocessing">
          We clean the text by removing non-letter characters, converting to
          lowercase, removing stopwords, and applying Porter stemming.
        </HowStep>
        <HowStep number="3" icon={<List />} title="Feature Extraction">
          The cleaned text is converted into numerical features using a
          pre-trained CountVectorizer.
        </HowStep>
        <HowStep
          number="4"
          icon={<SlidersHorizontal />}
          title="Feature Scaling"
        >
          The features are transformed using a saved scaler to match the format
          expected by the trained model.
        </HowStep>
        <HowStep number="5" icon={<Brain />} title="Prediction (XGBoost)">
          The processed features are passed to a trained XGBoost model which
          predicts the sentiment as Positive or Negative.
        </HowStep>
        <HowStep number="6" icon={<BarChart3 />} title="Results">
          For single text input, you get a JSON response. For CSV input, you get
          a Predictions.csv file and a sentiment distribution chart.
        </HowStep>
      </div>
      <div className="how-output-grid">
        <article className="example-panel info-panel">
          <PanelTitle icon={<FileText />} title="Example Input & Output" />
          <div className="example-tabs">
            <button
              className={exampleTab === "single" ? "selected" : ""}
              onClick={() => setExampleTab("single")}
            >
              Single Text
            </button>
            <button
              className={exampleTab === "bulk" ? "selected" : ""}
              onClick={() => setExampleTab("bulk")}
            >
              Bulk CSV
            </button>
          </div>
          {exampleTab === "single" ? (
            <div className="json-flow">
              <ExampleCode
                title="Request (JSON)"
                code={`{\n  "text": "${singleRequest}"\n}`}
              />
              <ArrowRight className="flow-arrow" />
              <ExampleCode
                title="Response (JSON)"
                code={`{\n  "text": "${singleRequest}",\n  "sentiment": "${singleResponse}"\n}`}
              />
            </div>
          ) : (
            <div className="bulk-example">
              <ExampleTable />
              <button
                className="download-action"
                disabled={!downloadData}
                onClick={handleDownload}
              >
                <Download size={14} />{" "}
                {downloadData
                  ? "Download Predictions.csv"
                  : "Run a bulk prediction on Home"}
              </button>
            </div>
          )}
          {exampleTab === "single" && (
            <button className="try-example" onClick={onTryExample}>
              <Sparkles size={14} /> Try this example on Home
            </button>
          )}
        </article>
        <article className="bulk-panel info-panel">
          <PanelTitle icon={<BarChart3 />} title="Bulk Prediction Output" />
          {graphImage ? (
            <img
              className="how-graph"
              src={graphImage}
              alt="Sentiment distribution chart"
            />
          ) : (
            <>
              <ExampleTable />
              <div className="chart-placeholder">
                <BarChart3 size={22} />
                <span>Sentiment Distribution Chart</span>
                <div className="bars">
                  <i style={{ height: "62%" }}>
                    <b>80</b>
                  </i>
                  <i style={{ height: "24%" }}>
                    <b>20</b>
                  </i>
                </div>
                <div className="bar-labels">
                  <span>Positive</span>
                  <span>Negative</span>
                </div>
              </div>
            </>
          )}
          <small className="panel-caption">
            {statisticsCaption(graphImage)}
          </small>
        </article>
      </div>
      <div className="how-benefits">
        <Feature
          icon={<Zap />}
          title="Fast & Accurate"
          text="Get sentiment predictions in seconds using XGBoost."
        />
        <Feature
          icon={<ShieldCheck />}
          title="Supports Bulk Analysis"
          text="Upload CSV files and analyze thousands of reviews at once."
        />
        <Feature
          icon={<BarChart3 />}
          title="Visual Insights"
          text="View sentiment distribution charts for better understanding."
        />
        <Feature
          icon={<LockKeyhole />}
          title="Privacy Focused"
          text="Your data is processed securely and not stored permanently."
        />
      </div>
      <div className="how-footer">
        © 2024 SentimentAI. Built for better customer experiences.
        <span>Privacy Policy | Terms of Service | Contact</span>
      </div>
    </section>
  );
}

function HowStep({ number, icon, title, children }) {
  return (
    <article className="how-step">
      <b className="step-number">{number}</b>
      <span className="how-step-icon">
        {React.cloneElement(icon, { size: 27 })}
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
      <small>
        {number === "1"
          ? "JSON or CSV"
          : number === "2"
            ? "Clean Text"
            : number === "3"
              ? "Vectorized Features"
              : number === "4"
                ? "Scaled Features"
                : number === "5"
                  ? "ML Model"
                  : "Insights"}
      </small>
    </article>
  );
}

function ExampleCode({ title, code }) {
  return (
    <div className="example-code">
      <strong>{title}</strong>
      <pre>{code}</pre>
      <Clipboard size={13} />
    </div>
  );
}
function ExampleTable() {
  return (
    <div className="how-table">
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
      <div>
        ... <strong>...</strong>
      </div>
    </div>
  );
}
function statisticsCaption(graphImage) {
  return graphImage
    ? "Live distribution from your uploaded CSV."
    : "Bulk prediction returns a CSV file and a sentiment distribution chart.";
}

function Feature({ icon, title, text }) {
  return (
    <div className="feature">
      <span className="feature-icon">
        {React.cloneElement(icon, { size: 22 })}
      </span>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
    </div>
  );
}
function CardHeading({ icon, title, subtitle, badge }) {
  return (
    <div className="card-heading">
      <span className="heading-icon">
        {React.cloneElement(icon, { size: 25 })}
      </span>
      <span>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>
      <b>{badge}</b>
    </div>
  );
}
function PanelTitle({ icon, title }) {
  return (
    <h2 className="panel-title">
      {React.cloneElement(icon, { size: 19 })}
      {title}
    </h2>
  );
}
function Step({ number, title, text }) {
  return (
    <div className="step">
      <b>{number}</b>
      <strong>{title}</strong>
      <small>{text}</small>
    </div>
  );
}
