import React from "react";
import "./RoomNavigation.css"

const RoomNavigation = ({ onLeft, onRight, onZoom, onHint }) => {
  return (
    <nav className="room-nav">
      <button
        id="turnLeft"
        data-title="Turn Left"
        aria-label="Turn left"
        onClick={onLeft}
      >
        <i>👈</i>
        <span className="hidden">Turn Left</span>
      </button>

      <button
        id="turnRight"
        data-title="Turn Right"
        aria-label="Turn right"
        onClick={onRight}
      >
        <i>👉</i>
        <span className="hidden">Turn Right</span>
      </button>

      <button
        id="zoom"
        data-title="Look"
        aria-label="Zoom"
        onClick={onZoom}
      >
        <i>🔎</i>
        <span className="hidden">Look</span>
      </button>

      <button
        id="hint"
        data-title="Hint!"
        aria-label="Show hint"
        onClick={onHint}
      >
        <i>💡</i>
        <span className="hidden">Hint</span>
      </button>
    </nav>
  );
};

export default RoomNavigation;
