import { ArrowRight, Database, ShieldCheck } from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/$/, "");
const API_DOCS_URL = `${API_BASE_URL}/docs`;

export default function Footer() {
  return (
    <footer id="about">
      <span>
        <Database size={16} /> Built with FastAPI <i /> NLTK <i /> XGBoost <i />{" "}
        Pandas <i /> Matplotlib
      </span>
      <span>
        <ShieldCheck size={16} /> API running on {API_BASE_URL}{" "}
        <a href={API_DOCS_URL} target="_blank" rel="noreferrer">
          View API Docs <ArrowRight size={15} />
        </a>
      </span>
    </footer>
  );
}
