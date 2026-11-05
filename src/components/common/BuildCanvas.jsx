import { useEffect } from "react";
import { useBuildScene } from "../../hooks/useBuildScene.js";

/**
 * A <canvas> running the 3D construction scene.
 * onReady(scene) hands the scene API to the parent (for timelines, sliders, labels).
 */
export default function BuildCanvas({ options, onReady, label, className }) {
  const [canvasRef, scene] = useBuildScene(options);
  useEffect(() => { onReady?.(scene); }, [scene, onReady]);
  return <canvas ref={canvasRef} className={className} role="img" aria-label={label} />;
}
