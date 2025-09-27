import React from "react";
import "./RoomNavigation.css"

const RoomNavigation = ({ updateView, showComment }) => {
  
  // Zoom
    const handleZoom = () => {
    const roomCanvas = document.getElementById("room");
    if (roomCanvas) {
      roomCanvas.classList.toggle("zoomed");
      console.log("🔍 Zoom toggled");
    }
  };

   // Turn Left 
  const handleTurnLeft = () => {
    updateView("left");
  };

  // Turn Right 
  const handleTurnRight = () => {
    updateView("right");
  };

  // Hint 
  const handleHint = () => {
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
  };

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
        onClick={handleZoom}  // use local onZoom
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
    </nav>
  );
};

export default RoomNavigation;