import { ArrowRight, BarChart3, CheckCircle2, MessageCircle, ShieldCheck, Target, Users, Zap } from "lucide-react";

export default function LandingPage({ onNavigate }) {
  return <>
    <section className="landing-hero" id="landing">
      <div className="landing-copy">
        <div className="eyebrow"><Zap size={13} fill="currentColor" /> CUSTOMER INSIGHTS, SIMPLIFIED</div>
        <h1>Turn customer feedback into <em>better decisions.</em></h1>
        <p>Understand what your customers really think with fast, accurate sentiment analysis powered by machine learning.</p>
        <div className="landing-actions"><button className="landing-primary" onClick={() => onNavigate("home")}>Analyze feedback <ArrowRight size={17} /></button><button className="landing-secondary" onClick={() => onNavigate("how")}>See how it works</button></div>
        <div className="landing-proof"><span><CheckCircle2 size={15} /> No setup required</span><span><CheckCircle2 size={15} /> Single & bulk analysis</span><span><CheckCircle2 size={15} /> Privacy focused</span></div>
      </div>
      <div className="landing-visual"><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" /><div className="insight-window"><div className="window-top"><span /><span /><span /><small>Sentiment overview</small></div><div className="window-content"><div className="score-ring"><strong>82%</strong><small>Positive</small></div><div className="insight-bars"><span><b>Positive</b><i style={{ width: "82%" }} /></span><span><b>Negative</b><i style={{ width: "18%" }} /></span><span><b>Reviews</b><i className="neutral-bar" style={{ width: "64%" }} /></span></div></div><div className="window-caption"><MessageCircle size={15} /> “Your customers are telling you what to build next.”</div></div><div className="floating-chip chip-top"><BarChart3 size={16} /><span><strong>+24%</strong><small>customer clarity</small></span></div><div className="floating-chip chip-bottom"><Users size={16} /><span><strong>1,000+</strong><small>reviews analyzed</small></span></div></div>
  </section>
    <section className="landing-metrics"><LandingMetric value="1K+" label="Reviews analyzed" /><LandingMetric value="&lt; 1s" label="Average response" /><LandingMetric value="99%" label="Model uptime goal" /><LandingMetric value="2 ways" label="To analyze feedback" /></section>
    <section className="landing-values"><div><span className="landing-icon"><Target size={22} /></span><h2>See the signal in every sentence.</h2><p>From a quick product review to thousands of survey responses, SentimentAI turns unstructured feedback into a clear direction for your next move.</p></div><div className="landing-value-list"><LandingValue icon={<Zap />} title="Fast enough for real work" text="Get a prediction in seconds, not hours." /><LandingValue icon={<BarChart3 />} title="Insights you can see" text="Use distribution charts to spot patterns." /><LandingValue icon={<ShieldCheck />} title="Built with privacy in mind" text="Data is processed temporarily for analysis." /></div></section>
  </>;
}

function LandingMetric({ value, label }) { return <div><strong>{value}</strong><span>{label}</span></div>; }
function LandingValue({ icon, title, text }) { return <div className="landing-value"><span>{icon}</span><div><strong>{title}</strong><small>{text}</small></div></div>; }
