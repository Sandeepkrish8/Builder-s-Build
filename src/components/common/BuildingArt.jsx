import { useMemo } from "react";
import { buildingArt } from "../../lib/buildingArt.js";

// Renders a generated SVG illustration. The markup comes from our own generator
// (no user input), so dangerouslySetInnerHTML is safe here.
export default function BuildingArt({ art, className }) {
  const html = useMemo(() => buildingArt(art), [art]);
  return <div className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}
