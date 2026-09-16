import { ArrowRight, Database, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer id="about">
      <span>
        <Database size={16} /> Built with FastAPI <i /> NLTK <i /> XGBoost <i />{" "}
        Pandas <i /> Matplotlib
      </span>
      <span>
        <ShieldCheck size={16} /> API running on http://localhost:8000{" "}
        <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
          View API Docs <ArrowRight size={15} />
        </a>
      </span>
    </footer>
  );
}
