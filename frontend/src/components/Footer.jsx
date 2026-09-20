import { Database } from "lucide-react";

export default function Footer() {
  return (
    <footer id="about">
      <span>
        <Database size={16} /> Built with FastAPI <i /> NLTK <i /> XGBoost <i />{" "}
        Pandas <i /> Matplotlib
      </span>
    </footer>
  );
}
