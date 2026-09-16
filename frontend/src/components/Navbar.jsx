import { BarChart3, Moon, Sun } from "lucide-react";

export default function Navbar({ page, setPage, darkMode, setDarkMode }) {
  const navigate = (nextPage) => (event) => {
    event.preventDefault();
    setPage(nextPage);
  };
  return (
    <header className="topbar">
      <a
        className="brand"
        href="#landing"
        onClick={navigate("landing")}
        aria-label="SentimentAI home"
      >
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
          onClick={navigate("home")}
        >
          Home
        </a>
        <a
          className={page === "how" ? "active" : ""}
          href="#how-it-works"
          onClick={navigate("how")}
        >
          How it works
        </a>
        <a
          className={page === "features" ? "active" : ""}
          href="#features"
          onClick={navigate("features")}
        >
          Features
        </a>
        <a
          className={page === "api" ? "active" : ""}
          href="#api-docs"
          onClick={navigate("api")}
        >
          API Docs
        </a>
        <a
          className={page === "about" ? "active" : ""}
          href="#about"
          onClick={navigate("about")}
        >
          About
        </a>
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
  );
}
