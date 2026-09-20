import * as React from "react";
import { BarChart3, Menu, Moon, Sun, X } from "lucide-react";

export default function Navbar({ page, setPage, darkMode, setDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigate = (nextPage) => (event) => {
    event.preventDefault();
    setPage(nextPage);
    setMobileMenuOpen(false);
  };
  return (
    <header className="topbar">
      <div className="topbar-container">
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
            className={page === "about" ? "active" : ""}
            href="#about"
            onClick={navigate("about")}
          >
            About
          </a>
        </nav>
        <div className="topbar-actions">
          <button
            className="icon-button"
            onClick={() => setDarkMode((value) => !value)}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            className="icon-button mobile-toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
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
            className={page === "about" ? "active" : ""}
            href="#about"
            onClick={navigate("about")}
          >
            About
          </a>
        </nav>
      )}
    </header>
  );
}
