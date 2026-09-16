import { BarChart3, Download, FileSpreadsheet, Upload } from "lucide-react";

export default function BulkPrediction({
  uploadedFile,
  fileName,
  loading,
  downloadData,
  onFileUpload,
  onPredict,
  onDownload,
}) {
  return (
    <article className="work-card">
      <div className="card-heading">
        <span className="heading-icon">
          <Upload size={25} />
        </span>
        <span>
          <strong>Bulk CSV Prediction</strong>
          <small>Upload a CSV file with customer reviews</small>
        </span>
        <b>CSV</b>
      </div>
      <div className="card-body">
        <div className={`dropzone ${uploadedFile ? "has-file" : ""}`}>
          <input
            id="csv-upload"
            type="file"
            accept=".csv,text/csv"
            onChange={onFileUpload}
          />
          <FileSpreadsheet size={40} />
          <strong>{uploadedFile ? fileName : "Upload CSV File"}</strong>
          <span>
            {uploadedFile
              ? "File ready for analysis"
              : "Choose a CSV file or drag and drop it here"}
          </span>
          <label htmlFor="csv-upload" className="select-file">
            <Upload size={15} /> {uploadedFile ? "Change File" : "Select File"}
          </label>
          <small>
            CSV should have a “Sentence” column containing text to analyze.
          </small>
        </div>
        <button
          className="primary-action"
          disabled={!uploadedFile || loading}
          onClick={onPredict}
        >
          <BarChart3 size={17} />{" "}
          {loading ? "Processing..." : "Predict Bulk Sentiment"}
        </button>
        {downloadData && (
          <button className="download-action" onClick={onDownload}>
            <Download size={16} /> Download Predictions.csv
          </button>
        )}
      </div>
    </article>
  );
}
