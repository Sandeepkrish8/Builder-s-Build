import { useEffect, useRef } from "react";
import Icon from "../common/Icon.jsx";

/**
 * Insight cards pinned to 3D points with dotted leader lines.
 * Positions change every animation frame, so we update the DOM directly through refs
 * instead of React state (re-rendering 60 times a second would be wasteful).
 */
export default function InsightLayer({ scene, insights, compact }) {
  const layerRef = useRef(null);
  const cards = useRef([]);
  const lines = useRef([]);
  const dots = useRef([]);

  useEffect(() => {
    if (!scene) return;
    const scale = compact ? 0.6 : 1;
    return scene.onFrame((p) => {
      const layer = layerRef.current;
      if (!layer) return;
      // phones show one insight at a time, cycling every few seconds
      const active = insights.filter((it) => p >= it.from && p < it.to);
      const pick = active[Math.floor(performance.now() / 3200) % Math.max(1, active.length)];

      insights.forEach((it, i) => {
        const card = cards.current[i], line = lines.current[i], dot = dots.current[i];
        if (!card) return;
        const on = compact ? it === pick : p >= it.from && p < it.to;
        const a = scene.project(it.at);
        const w = card.offsetWidth, h = card.offsetHeight;
        let x = compact ? 12 : a.x + it.dx * scale;
        let y = compact ? 10 : a.y + it.dy * scale;
        x = Math.max(8, Math.min(layer.clientWidth - w - 8, x));
        y = Math.max(8, Math.min(layer.clientHeight - h - 8, y));
        card.style.transform = `translate(${x}px, ${y}px)`;
        card.classList.toggle("on", on);
        card.setAttribute("aria-hidden", String(!on));
        const ex = compact ? x + w / 2 : it.dx < 0 ? x + w : x;
        const ey = compact ? y + h : y + h / 2;
        line.setAttribute("d", `M${a.x},${a.y} L${ex},${ey}`);
        dot.setAttribute("cx", a.x);
        dot.setAttribute("cy", a.y);
        line.style.opacity = dot.style.opacity = on ? 1 : 0;
      });
    });
  }, [scene, insights, compact]);

  return (
    <div className="insights" ref={layerRef}>
      <svg className="insight-lines" aria-hidden="true">
        {insights.map((it, i) => (
          <g key={it.title}>
            <path ref={(el) => (lines.current[i] = el)} />
            <circle r="4" ref={(el) => (dots.current[i] = el)} />
          </g>
        ))}
      </svg>
      {insights.map((it, i) => (
        <div key={it.title} className="insight" aria-hidden="true" ref={(el) => (cards.current[i] = el)}>
          <span className="insight-ico"><Icon name={it.icon} /></span>
          <span><b>{it.title}</b><small>{it.text}</small></span>
        </div>
      ))}
    </div>
  );
}
