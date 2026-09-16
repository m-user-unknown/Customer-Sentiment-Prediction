import * as React from "react";
import {
  BarChart3,
  Brain,
  Check,
  Database,
  FileText,
  Heart,
  Lightbulb,
  LockKeyhole,
  Network,
  Quote,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

const values = [
  [
    Lightbulb,
    "Why We Built This",
    "We saw how valuable customer feedback is, and we wanted to create a tool that makes it easy to analyze and understand that feedback using modern machine learning.",
  ],
  [
    Users,
    "Who It's For",
    "Developers, data enthusiasts, product teams, small businesses, researchers, and anyone who wants to understand customer sentiments from text data.",
  ],
  [
    Zap,
    "What Makes Us Different",
    "A clean and simple interface, powerful ML model, support for both single text and bulk CSV analysis, and privacy-focused processing.",
  ],
  [
    BarChart3,
    "Our Goal",
    "To help you turn raw customer opinions into meaningful insights that drive better products, happier customers, and stronger businesses.",
  ],
];

export default function About() {
  return (
    <section className="about-page">
      <div className="about-hero">
        <div className="about-copy">
          <div className="eyebrow">
            <Users size={13} /> ABOUT SENTIMENTAI
          </div>
          <h1>Our Mission</h1>
          <p>
            At SentimentAI, we believe that every customer opinion matters. Our
            mission is to make sentiment analysis simple, fast, and accessible
            for everyone — from individual developers to growing businesses.
          </p>
          <div className="mission-points">
            <MissionPoint icon={<ShieldCheck />} text="Understand Customers" />
            <MissionPoint
              icon={<BarChart3 />}
              text="Turn Feedback into Insights"
            />
            <MissionPoint icon={<Users />} text="Build Better Products" />
          </div>
          <blockquote>
            <Quote size={27} />{" "}
            <span>
              “Data is just numbers until it tells a human story.
              <br />
              We help you hear your customers.” <small>— SentimentAI</small>
            </span>
          </blockquote>
        </div>
        <ProductIllustration />
      </div>
      <div className="about-divider">
        <span /> Simple. Powerful. Real Impact. <span />
      </div>
      <div className="about-values">
        {values.map(([Icon, title, text]) => (
          <article className="about-value" key={title}>
            <span>{React.createElement(Icon, { size: 24 })}</span>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="about-lower">
        <TechStack />
        <Story />
      </div>
      <div className="about-metrics">
        <Metric icon={<Users />} value="1K+" label="Reviews Analyzed" />
        <Metric icon={<Zap />} value="< 1s" label="Average Response Time" />
        <Metric icon={<ShieldCheck />} value="99%" label="Uptime Goal" />
        <Metric
          icon={<Heart />}
          value="Built with Passion"
          label="for a Better Customer Experience"
        />
        <span className="about-quote">
          “Happy customers build great businesses.”<small>— SentimentAI</small>
        </span>
      </div>
    </section>
  );
}

function MissionPoint({ icon, text }) {
  return (
    <div>
      <span>{icon}</span>
      <strong>{text}</strong>
    </div>
  );
}
function ProductIllustration() {
  return (
    <div className="product-illustration">
      <div className="feedback-stack">
        <span>
          <FileText /> Customer
          <br />
          Reviews
        </span>
        <span>
          <Check /> Product
          <br />
          Feedback
        </span>
        <span>
          <Users /> Support
          <br />
          Tickets
        </span>
        <span>
          <Check /> Surveys
        </span>
      </div>
      <div className="laptop">
        <div className="screen">
          <div className="review-bubble">“This product is amazing!”</div>
          <b>↓</b>
          <div className="sentiment-card">
            <span>●</span>
            <strong>
              Sentiment<em>Positive</em>
              <small>Confidence: 0.96</small>
            </strong>
          </div>
        </div>
        <i />
      </div>
      <div className="insight-card">
        <BarChart3 />
        <strong>
          Actionable
          <br />
          Insights
        </strong>
        <p>
          ✓ Understand sentiment
          <br />✓ Identify trends
          <br />✓ Make data-driven decisions
        </p>
      </div>
      <div className="illustration-note">
        From feedback
        <br />
        to better decisions
      </div>
    </div>
  );
}
function TechStack() {
  return (
    <article className="tech-stack">
      <h2>
        <Network /> Tech Stack
      </h2>
      <p>Built with modern, reliable technologies</p>
      <div className="tech-pills">
        <Tech icon={<Brain />} text="Python" />
        <Tech icon={<Zap />} text="FastAPI" />
        <Tech icon={<BarChart3 />} text="XGBoost" />
        <Tech icon={<Database />} text="Pandas" />
        <Tech icon={<Brain />} text="NLTK" />
        <Tech icon={<BarChart3 />} text="Matplotlib" />
        <Tech icon={<Database />} text="Uvicorn" />
        <Tech icon={<FileText />} text="CSV Support" />
        <Tech icon={<Zap />} text="REST API" />
      </div>
    </article>
  );
}
function Tech({ icon, text }) {
  return (
    <span>
      {icon}
      {text}
    </span>
  );
}
function Story() {
  return (
    <article className="story-panel">
      <h2>
        <FileText /> Our Story
      </h2>
      <div className="timeline">
        <StoryItem
          year="2024"
          title="Idea & research"
          text="Explored NLP and sentiment analysis to solve real-world problems."
        />
        <StoryItem
          year="2024"
          title="Model development"
          text="Trained and optimized an XGBoost model for accurate predictions."
        />
        <StoryItem
          year="2025"
          title="SentimentAI launch"
          text="Built a simple and beautiful web interface to make it accessible."
        />
        <StoryItem
          year="Future"
          title="More features"
          text="Multi-language support, deeper insights, and advanced analytics."
        />
      </div>
    </article>
  );
}
function StoryItem({ year, title, text }) {
  return (
    <div>
      <b>{year}</b>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
    </div>
  );
}
function Metric({ icon, value, label }) {
  return (
    <div className="metric">
      {icon}
      <span>
        <strong>{value}</strong>
        <small>{label}</small>
      </span>
    </div>
  );
}
