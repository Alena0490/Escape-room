import React, { useState, useEffect } from 'react';
import "./GhostComponent.css"

const GhostComponent = ({ lightsOn }) => {
  const [ghost, setGhost] = useState({ visible: false, top: 0, left: 0 });

  useEffect(() => {
    let timeoutId;

    const spawnGhost = () => {
      if (window.gameEnded) return;

      const chance = lightsOn ? 0.2 : 0.6;
      if (Math.random() < chance) {
        const top = Math.floor(Math.random() * 70) + 10;
        const left = Math.floor(Math.random() * 70) + 10;
        setGhost({ visible: true, top, left });
        setTimeout(() => setGhost(g => ({ ...g, visible: false })), 2000);
      }
      timeoutId = setTimeout(spawnGhost, Math.random() * 20000 + 10000);
    };

    timeoutId = setTimeout(spawnGhost, Math.random() * 5000 + 5000);

    return () => clearTimeout(timeoutId);
  }, [lightsOn]);
  if (!ghost.visible) return null;

  return (
    <div
      className="shadow-ghost"
      style={{ top: `${ghost.top}%`, left: `${ghost.left}%` }}
    />
  );
};

export default GhostComponent;