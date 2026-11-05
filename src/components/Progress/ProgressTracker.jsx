import { useState } from "react";
import BuildCanvas from "../common/BuildCanvas.jsx";
import BuildingArt from "../common/BuildingArt.jsx";
import Icon from "../common/Icon.jsx";
import { useSceneProgress } from "../../hooks/useBuildScene.js";
import { STAGES, stageFor } from "../../three/buildScene.js";
import { MILESTONES, SITE_PHOTOS } from "../../data/content.js";
import "./Progress.css";

const SITE_OPTIONS = { progress: 0.84, radius: 46 };

export default function ProgressTracker() {
  const [scene, setScene] = useState(null);
  const progress = useSceneProgress(scene);
  const stage = stageFor(progress);
  const stageNo = STAGES.indexOf(stage) + 1;

  return (
    <section id="progress" className="section">
      <div className="section-head">
        <h2>Watch your home rise, week by week.</h2>
        <p>Milestones, dated site photos and a 3D model build trust with buyers and cut down "what's the status?" calls to the sales team.</p>
      </div>
      <div className="prog-grid">
        <div className="timeline">
          <dl className="overall">
            <div><dt>Overall</dt><dd>68%</dd></div>
            <div><dt>Possession</dt><dd>Dec 2027</dd></div>
            <div><dt>Last update</dt><dd>2 days ago</dd></div>
          </dl>
          <ol className="tl">
            {MILESTONES.map((m, i) => (
              <li key={m.title} className={`tl-item ${m.state} ${stageFor(m.p) === stage ? "viewing" : ""}`}>
                <button type="button" onClick={() => scene?.setProgress(m.p)} aria-label={`Show ${m.title} in the 3D model`}>
                  <span className="tl-dot">{m.state === "done" ? <Icon name="check" size={14} /> : i + 1}</span>
                  <span className="tl-text"><b>{m.title}</b><small>{m.text}</small></span>
                  <span className="tl-when">{m.when}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="site-col">
          <div className="site3d">
            <BuildCanvas options={SITE_OPTIONS} onReady={setScene} label="Interactive 3D construction model of Tower B" />
            <span className="site-tag">3D construction model · Tower B</span>
            <p className="site-stage" aria-live="polite"><small>Showing stage</small><b>{stage.name}</b><span>Stage {stageNo} of 6</span></p>
            <div className="site-controls">
              <button type="button" className="btn btn-dark" onClick={() => scene?.replay()}><Icon name="replay" size={16} /> Replay build</button>
              <label className="scrub">
                <span>Drag to travel through time</span>
                <input type="range" min="0" max="100" value={Math.round(progress * 100)} style={{ "--p": `${progress * 100}%` }}
                  onChange={(e) => scene?.jump(Number(e.target.value) / 100)} />
              </label>
            </div>
          </div>
          <ul className="thumbs" aria-label="Site photos">
            {SITE_PHOTOS.map((p) => (
              <li key={p.when}><BuildingArt art={p.art} className="thumb-art" /><span>{p.when}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
