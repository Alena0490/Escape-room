import React, { useState, useEffect, useCallback } from "react";
import "./RoomNavigation.css"

const RoomNavigation = ({ updateView, showComment, setMuted, isMuted, stopAllAudio }) => {
  const [muted, setMutedState] = useState(() => localStorage.getItem("muted") === "1");

  // Synchronizace s localStorage při mount
  useEffect(() => {
    const savedMuted = localStorage.getItem("muted") === "1";
    setMutedState(savedMuted);
    if (setMuted) {
      setMuted(savedMuted);
    }
  }, [setMuted]);

  // Mute toggle function
  const toggleMute = useCallback(() => {
    const newMutedState = !muted;
    
    setMutedState(newMutedState);
    localStorage.setItem("muted", newMutedState ? "1" : "0");

    // Zavolej funkci z hooku pro nastavení mute stavu
    if (setMuted) {
      setMuted(newMutedState);
    }

    if (newMutedState) {
      // Mute - zastavit všechny zvuky
      if (stopAllAudio) {
        stopAllAudio();
      }
    } else {
      // Unmute - obnovit Web Audio API context pokud existuje
      if (window.__audioCtx?.resume) {
        try { 
          window.__audioCtx.resume(); 
        } catch {}
      }
    }
  }, [muted, setMuted, stopAllAudio]);

  // Keyboard shortcut "M" for mute
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return; // nepřekážet při psaní
      
      if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleMute();
      }
    };
    
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleMute]);
  
  // Zoom function
  const handleZoom = useCallback(() => {
    const roomCanvas = document.getElementById("room");
    if (roomCanvas) {
      roomCanvas.classList.toggle("zoomed");
    }
  }, []);

  // Turn Left 
  const handleTurnLeft = useCallback(() => {
    updateView("left");
  }, [updateView]);

  // Turn Right 
  const handleTurnRight = useCallback(() => {
    updateView("right");
  }, [updateView]);

  // Hint function
  const handleHint = useCallback(() => {
    const hints = [
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
    
    const random = hints[Math.floor(Math.random() * hints.length)];
    showComment(random, "hint");

    // Save hints used
    const used = parseInt(localStorage.getItem("hintsUsed") || "0", 10);
    localStorage.setItem("hintsUsed", used + 1);
  }, [showComment]);

  // Použij buď předaný isMuted nebo lokální stav
  const currentMutedState = isMuted ? isMuted() : muted;

  return (
    <nav className="room-nav">
      <button
        id="turnLeft"
        data-title="Turn Left"
        aria-label="Turn left"
        onClick={handleTurnLeft}
      >
        <i>👈</i>
        <span className="hidden">Turn Left</span>
      </button>

      <button
        id="turnRight"
        data-title="Turn Right"
        aria-label="Turn right"
        onClick={handleTurnRight}
      >
        <i>👉</i>
        <span className="hidden">Turn Right</span>
      </button>

      <button
        id="zoom"
        data-title="Look"
        aria-label="Zoom"
        onClick={handleZoom}
      >
        <i>🔎</i>
        <span className="hidden">Look</span>
      </button>

      <button
        id="hint"
        data-title="Hint!"
        aria-label="Show hint"
        onClick={handleHint}
      >
        <i>💡</i>
        <span className="hidden">Hint</span>
      </button>

      <button
        type="button"
        id="sound"
        data-title={currentMutedState ? "Unmute (M)" : "Mute (M)"}
        onClick={toggleMute}
        aria-pressed={currentMutedState}
        aria-label={currentMutedState ? "Unmute (M)" : "Mute (M)"}
      >
        <i>{currentMutedState ? "🔇" : "🔈"}</i>
        <span className="hidden">{currentMutedState ? "Unmute" : "Mute"}</span>
      </button>
    </nav>
  );
};

export default RoomNavigation;