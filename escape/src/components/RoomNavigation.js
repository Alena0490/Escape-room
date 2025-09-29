import { useState, useEffect, useCallback, memo } from "react";
import "./RoomNavigation.css";

const HINTS = [
  "Talk to the old spirits.",
  "Somewhere here is the key to decrypting the code.",
  "Get the code first.",
  "Don't forget to look into boxes.",
  "You need to search all the stuff.",
  "Play sports.",
  "How about learning a little anatomy?",
  "How about bringing back some old hits from the '80s?",
  "Read the book.",
  "It's always better with lights on.",
  "Don't be afraid of ghosts.",
  "Don't forget to check under the rug.",
  "Don't be skeptical about the search for extraterrestrial intelligence.",
];

const RoomNavigation = ({ updateView, showComment, setMuted, isMuted, stopAllAudio }) => {
  const [muted, setMutedState] = useState(() => localStorage.getItem("muted") === "1");

  // Sync from localStorage and propagate to the global audio manager
  useEffect(() => {
    const saved = localStorage.getItem("muted") === "1";
    setMutedState(saved);
    setMuted?.(saved);
  }, [setMuted]);

  const toggleMute = useCallback(() => {
    const next = ! (isMuted ? isMuted() : muted);
    setMutedState(next);
    localStorage.setItem("muted", next ? "1" : "0");
    setMuted?.(next);
    if (next) stopAllAudio?.();
    else if (window.__audioCtx?.resume) { try { window.__audioCtx.resume(); } catch {} }
  }, [muted, isMuted, setMuted, stopAllAudio]);

  // Keyboard shortcut: M toggles mute
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key.toLowerCase() === "m") { e.preventDefault(); toggleMute(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleMute]);

  const handleZoom = useCallback(() => {
    const el = document.getElementById("room");
    el?.classList.toggle("zoomed");
  }, []);

  const handleTurnLeft  = useCallback(() => updateView("left"),  [updateView]);
  const handleTurnRight = useCallback(() => updateView("right"), [updateView]);

  const handleHint = useCallback(() => {
    const random = HINTS[(Math.random() * HINTS.length) | 0];
    showComment(random, "hint");
    const used = parseInt(localStorage.getItem("hintsUsed") || "0", 10);
    localStorage.setItem("hintsUsed", used + 1);
  }, [showComment]);

  const currentMuted = isMuted ? !!isMuted() : muted;

  return (
    <nav className="room-nav">
      <button 
        id="turnLeft" 
        type="button" 
        data-title="Turn Left"  
        aria-label="Turn left"  
        onClick={handleTurnLeft}>
          <i>👈</i><span className="hidden">Turn Left</span>
      </button>

      <button
        id="turnRight"
        type="button" 
        data-title="Turn Right" 
        aria-label="Turn right" 
        onClick={handleTurnRight}>
          <i>👉</i><span className="hidden">Turn Right</span>
      </button>

      <button 
        id="zoom" 
        type="button"
        data-title="Look" 
        aria-label="Zoom" 
        onClick={handleZoom}>
          <i>🔎</i><span className="hidden">Look</span>
      </button>

      <button 
        id="hint" 
        type="button"
        data-title="Hint!" 
        aria-label="Show hint" 
        onClick={handleHint}>
          <i>💡</i><span className="hidden">Hint</span>
      </button>

      <button
        type="button"
        id="sound"
        data-title={currentMuted ? "Unmute (M)" : "Mute (M)"}
        onClick={toggleMute}
        aria-pressed={currentMuted}
        aria-label={currentMuted ? "Unmute (M)" : "Mute (M)"}
      >
        <i>{currentMuted ? "🔇" : "🔈"}</i>
        <span className="hidden">{currentMuted ? "Unmute" : "Mute"}</span>
      </button>
    </nav>
  );
};

export default memo(RoomNavigation);
