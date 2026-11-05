import { useEffect, useRef, useState } from "react";
import { mountConstruction } from "../three/buildScene.js";
import { useTheme } from "../context/ThemeContext.jsx";

/**
 * Mounts the Three.js construction scene on a <canvas> and cleans it up on unmount.
 * Returns [canvasRef, scene]; `scene` is null until mounted.
 * Options are read once at mount. Give the component a `key` to remount with new options.
 */
export function useBuildScene(options) {
  const canvasRef = useRef(null);
  const [scene, setScene] = useState(null);
  const { theme } = useTheme();
  const initial = useRef({ ...options, theme });

  useEffect(() => {
    const s = mountConstruction(canvasRef.current, initial.current);
    setScene(s);
    return () => {
      s.dispose(); // StrictMode mounts twice in dev, so this cleanup really matters
      setScene(null);
    };
  }, []);

  // keep 3D lighting in sync with the site theme
  useEffect(() => { scene?.setTheme(theme); }, [scene, theme]);

  return [canvasRef, scene];
}

/** Build progress as React state, rounded so we re-render ~200 times per build, not every frame. */
export function useSceneProgress(scene, initialValue = 0) {
  const [progress, setProgress] = useState(initialValue);
  useEffect(() => {
    if (!scene) return;
    return scene.onProgress((p) => setProgress(Math.round(p * 200) / 200));
  }, [scene]);
  return progress;
}
