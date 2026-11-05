import BuildingArt from "../common/BuildingArt.jsx";
import BuildCanvas from "../common/BuildCanvas.jsx";
import Icon from "../common/Icon.jsx";
import { STATUS } from "../../data/projects.js";
import { formatLakhCr } from "../../lib/finance.js";

const MINI_SITE = { progress: 0.84, interactive: false, radius: 36 };

export default function ProjectCard({ project, saved, onToggleSave }) {
  const status = STATUS[project.status];
  return (
    <article className="pcard">
      <div className="pcard-media">
        {project.media === "site3d"
          ? <BuildCanvas options={MINI_SITE} label={`3D model of ${project.name} under construction`} />
          : <BuildingArt art={project.art} className="pcard-art" />}
        <span className={`pcard-status ${status.tone}`}>{status.label}</span>
        <button type="button" className="pcard-save" aria-pressed={saved} onClick={() => onToggleSave(project.id)}
          aria-label={saved ? `Remove ${project.name} from shortlist` : `Save ${project.name} to shortlist`}>
          <Icon name={saved ? "heartFill" : "heart"} size={18} />
        </button>
        {project.media === "site3d" && <span className="pcard-3d">3D</span>}
      </div>
      <div className="pcard-body">
        <h3>{project.name}</h3>
        <p className="pcard-loc"><Icon name="pin" size={15} />{project.location}</p>
        <ul className="pcard-specs">{project.specs.map((s) => <li key={s}>{s}</li>)}</ul>
        <div className="pcard-progress">
          <span>{project.progressLabel}</span><b>{project.progressText ?? `${project.progress}%`}</b>
        </div>
        <div className="bar" role="progressbar" aria-valuenow={project.progress} aria-valuemin={0} aria-valuemax={100}
          aria-label={`${project.name} ${project.progressLabel}`}><i style={{ width: `${project.progress}%` }} /></div>
        <div className="pcard-foot">
          <p><small>{project.priceLabel}</small><b>{formatLakhCr(project.price)}</b></p>
          <a href="#contact">{project.cta} →</a>
        </div>
      </div>
    </article>
  );
}
