// Small inline SVG icon set (no icon library needed).
const PATHS = {
  layers: <path d="M12 3 2 8l10 5 10-5-10-5zM2 13l10 5 10-5M2 17.5l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  frame: <path d="M4 21V3h16v18M4 9h16M4 15h16M10 3v18M14 3v18" fill="none" stroke="currentColor" strokeWidth="2" />,
  wall: <path d="M3 5h18v14H3zM3 10h18M3 14.5h18M9 5v5M15 5v5M6 10v4.5M12 10v4.5M18 10v4.5M9 14.5V19M15 14.5V19" fill="none" stroke="currentColor" strokeWidth="1.8" />,
  window: <path d="M4 3h16v18H4zM12 3v18M4 12h16" fill="none" stroke="currentColor" strokeWidth="2" />,
  sun: <><circle cx="12" cy="12" r="4" fill="currentColor" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" stroke="currentColor" strokeWidth="2" /></>,
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor" />,
  tree: <path d="M12 2 5 12h4l-3 5h12l-3-5h4L12 2zM12 17v5" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />,
  drop: <path d="M12 2.5S5 10.5 5 15a7 7 0 0 0 14 0c0-4.5-7-12.5-7-12.5z" fill="currentColor" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" strokeWidth="2" />,
  heartFill: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor" />,
  pin: <path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="currentColor" />,
  search: <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5" fill="none" stroke="currentColor" strokeWidth="2" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" />,
  close: <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" />,
  replay: <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  check: <path d="M5 12.5 10 17l9-10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />,
  phone: <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill="currentColor" />,
  download: <path d="M12 3v12M7 10l5 5 5-5M4 20h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  whatsapp: <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z" fill="currentColor" />,
};

export default function Icon({ name, size = 20, className, label }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}
      aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label}>
      {PATHS[name]}
    </svg>
  );
}
