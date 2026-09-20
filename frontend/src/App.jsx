import * as React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import HowItWorks from "./pages/HowItWorks";
import Features from "./pages/Features";
import ApiDocs from "./pages/ApiDocs";
import About from "./pages/About";
import { predictCsv, predictText } from "./services/api";

export default function App() {
  const [page, setPage] = React.useState("landing");
  const [darkMode, setDarkMode] = React.useState(() => {
    try {
      const saved = localStorage.getItem("sentimentai_theme");
      if (saved !== null) return saved === "dark";
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches || false;
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem("sentimentai_theme", darkMode ? "dark" : "light");
    } catch {
      // Ignore storage restrictions if any
    }
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const [review, setReview] = React.useState("");
  const [uploadedFile, setUploadedFile] = React.useState(null);
  const [fileName, setFileName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const [downloadData, setDownloadData] = React.useState(null);
  const [graphImage, setGraphImage] = React.useState(null);
  const [statistics, setStatistics] = React.useState(null);

  const clearResults = () => {
    setResult(null);
    setError(null);
    setDownloadData(null);
    setGraphImage(null);
    setStatistics(null);
  };
  const onFileUpload = (event) => {
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
  const onSinglePrediction = async () => {
    if (!review.trim()) {
      setError("Please enter some text to analyze");
      return;
    }
    setLoading(true);
    clearResults();
    try {
      const data = await predictText(review);
      setResult(data.prediction || data.sentiment || data.label || "Unknown");
    } catch (requestError) {
      setError(`Error: ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  };
  const onBulkPrediction = async () => {
    if (!uploadedFile) {
      setError("Please upload a CSV file first");
      return;
    }
    setLoading(true);
    clearResults();
    try {
      const data = await predictCsv(uploadedFile);
      if (data.graphData)
        setGraphImage(`data:image/png;base64,${data.graphData}`);
      if (data.statistics) setStatistics(JSON.parse(data.statistics));
      setDownloadData(data.blob);
      setResult("Bulk prediction completed");
    } catch (requestError) {
      setError(`Error: ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  };
  const onDownload = () => {
    if (!downloadData) return;
    const url = URL.createObjectURL(downloadData);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Predictions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  const onClear = () => {
    setReview("");
    setUploadedFile(null);
    setFileName("");
    clearResults();
  };
  const onKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      onSinglePrediction();
    }
  };
  const state = {
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
    onNavigate: setPage,
  };
  return (
    <main className={`app-shell ${darkMode ? "theme-dark" : ""}`}>
      <Navbar {...{ page, setPage, darkMode, setDarkMode }} />
      {page === "landing" && <LandingPage onNavigate={setPage} />}
      {page === "home" && <Home state={state} />}
      {page === "how" && <HowItWorks />}
      {page === "features" && <Features onTryNow={() => setPage("home")} />}
      {page === "api" && <ApiDocs />}
      {page === "about" && <About />}
      <Footer />
    </main>
  );
}
