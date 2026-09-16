import { AnimatePresence } from "framer-motion";

export default function PredictionResult({ error, result, onClear }) {
  return (
    <AnimatePresence mode="wait">
      {(error || result) && (
        <div className={`notice ${error ? "notice-error" : "notice-success"}`}>
          <strong>
            {error ? "Something needs attention" : "Prediction result"}
          </strong>
          <span>{error || result}</span>
          <button onClick={onClear}>Clear</button>
        </div>
      )}
    </AnimatePresence>
  );
}
