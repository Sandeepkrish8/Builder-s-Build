import { STAGES, stageFor } from "../../three/buildScene.js";
import Icon from "../common/Icon.jsx";

export default function StageRail({ progress, onReplay }) {
  const now = STAGES.indexOf(stageFor(progress));
  return (
    <div className="rail">
      <button type="button" className="btn btn-dark rail-replay" onClick={onReplay}>
        <Icon name="replay" size={16} /> Replay
      </button>
      <ol className="steps" style={{ "--p": progress }} aria-label="Construction stages">
        {STAGES.map((s, i) => {
          const state = progress >= 0.999 || i < now ? "done" : i === now ? "now" : "";
          return (
            <li key={s.name} className={state} aria-current={i === now ? "step" : undefined}>
              <i /><span>{s.name}</span>
            </li>
          );
        })}
      </ol>
      <span className="rail-hint">Drag to rotate · Ctrl + scroll to zoom</span>
    </div>
  );
}
