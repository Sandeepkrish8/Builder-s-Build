import { useEffect, useMemo, useState } from "react";
import ProjectCard from "./ProjectCard.jsx";
import Icon from "../common/Icon.jsx";
import { PROJECTS } from "../../data/projects.js";
import { filterProjects } from "../../lib/projects.js";
import "./Projects.css";

const STATUS_CHIPS = [["all", "All"], ["ongoing", "Ongoing"], ["ready", "Ready to move"], ["upcoming", "Upcoming"]];
const TYPE_CHIPS = [["apartment", "Apartments"], ["villa", "Villas"]];

function loadShortlist() {
  try { return new Set(JSON.parse(localStorage.getItem("shortlist") ?? "[]")); } catch { return new Set(); }
}

export default function Projects() {
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");
  const [shortlist, setShortlist] = useState(loadShortlist);

  const visible = useMemo(() => filterProjects(PROJECTS, { status, type, query }), [status, type, query]);

  useEffect(() => {
    try { localStorage.setItem("shortlist", JSON.stringify([...shortlist])); } catch { /* ignore */ }
  }, [shortlist]);

  const toggleSave = (id) => setShortlist((prev) => {
    const next = new Set(prev); // never mutate state directly: copy, change, return
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <section id="projects" className="section">
      <div className="section-head">
        <h2>Find the home that fits your life.</h2>
        <p>Filter by status and type. Every project shows live construction progress, so buyers always know where things stand.</p>
      </div>

      <div className="ptoolbar">
        <div className="pfilters" role="group" aria-label="Filter projects">
          {STATUS_CHIPS.map(([id, label]) => (
            <button key={id} type="button" className="chip" aria-pressed={status === id} onClick={() => setStatus(id)}>{label}</button>
          ))}
          <span className="pfilters-gap" />
          {TYPE_CHIPS.map(([id, label]) => (
            <button key={id} type="button" className="chip" aria-pressed={type === id}
              onClick={() => setType((t) => (t === id ? "all" : id))}>{label}</button>
          ))}
        </div>
        <label className="psearch">
          <Icon name="search" size={18} />
          <span className="sr-only">Search projects</span>
          <input type="search" placeholder="Search by location or project" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      {visible.length ? (
        <div className="pgrid">
          {visible.map((p) => <ProjectCard key={p.id} project={p} saved={shortlist.has(p.id)} onToggleSave={toggleSave} />)}
        </div>
      ) : (
        <div className="pempty">
          <p>No projects match these filters.</p>
          <button type="button" className="btn btn-line" onClick={() => { setStatus("all"); setType("all"); setQuery(""); }}>Clear filters</button>
        </div>
      )}
      <p className="sr-only" aria-live="polite">{visible.length} projects shown</p>
    </section>
  );
}
