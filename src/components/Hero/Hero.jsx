import { useMemo, useState } from "react";
import BuildCanvas from "../common/BuildCanvas.jsx";
import InsightLayer from "./InsightLayer.jsx";
import StageRail from "./StageRail.jsx";
import { useSceneProgress } from "../../hooks/useBuildScene.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { HERO_INSIGHTS } from "../../data/content.js";
import "./Hero.css";

const clamp01 = (v) => Math.max(0, Math.min(1, v));

export default function Hero() {
  const isMobile = useMediaQuery("(max-width: 760px)");
  const [scene, setScene] = useState(null);
  const progress = useSceneProgress(scene);

  // camera framing differs on phones; `key` below remounts the scene when it changes
  const options = useMemo(() => ({
    progress: 1, speed: 0.075, landscape: true, effects: true, radius: 44,
    view: isMobile ? { theta: 0.62, phi: 1.05, look: [0.2, 2.2, 0.4] } : { theta: 0.6, phi: 1.07, look: [-0.6, 3.6, 0.4] },
  }), [isMobile]);

  // random star field, created once
  const stars = useMemo(() => Array.from({ length: 110 }, (_, i) => ({
    id: i, left: Math.random() * 100, top: Math.random() * 100, opacity: 0.25 + Math.random() * 0.75,
  })), []);

  const floors = Math.round(clamp01((progress - 0.25) / 0.45) * 14);
  const trees = Math.round(clamp01((progress - 0.14) / 0.85) * 120);

  return (
    <section id="home" className="hero">
      <div className="hero-sky" aria-hidden="true">
        <div className="hero-sun" /><div className="hero-moon" />
        <div className="hero-stars">{stars.map((s) => <i key={s.id} style={{ left: `${s.left}%`, top: `${s.top}%`, opacity: s.opacity }} />)}</div>
      </div>

      <div className="hero-copy">
        <p className="hero-pill"><span className="pulse" />Now building · Urbanstone Skyline, Whitefield</p>
        <h1>From blueprint<br />to <span className="hero-fill" style={{ "--p": `${Math.round(progress * 100)}%` }}>your home</span>.</h1>
        <p className="hero-lead">Watch every stage of construction, from the first foundation pour to the final tree in the garden. RERA registered and built to last generations.</p>
        <div className="hero-ctas">
          <a className="btn btn-gold" href="#projects">Explore Projects →</a>
          <a className="btn btn-line" href="#units">View Floor Plans</a>
        </div>
        <dl className="hero-counters">
          <div><dt>Floors built</dt><dd>{floors}</dd></div>
          <div><dt>Trees planted</dt><dd>{trees}</dd></div>
          <div><dt>Project complete</dt><dd>{Math.round(progress * 100)}%</dd></div>
        </dl>
      </div>

      <div className="hero-stage">
        <BuildCanvas key={isMobile ? "m" : "d"} options={options} onReady={setScene}
          label="Animated 3D model of an apartment building being constructed, from empty plot to finished home" />
        <InsightLayer scene={scene} insights={HERO_INSIGHTS} compact={isMobile} />
      </div>

      <StageRail progress={progress} onReplay={() => scene?.replay()} />
    </section>
  );
}
