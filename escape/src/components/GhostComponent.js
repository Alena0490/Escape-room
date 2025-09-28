import { useState, useEffect, useRef, useCallback, memo } from "react";
import "./GhostComponent.css";

const GhostComponent = ({ lightsOn }) => {
  const [ghost, setGhost] = useState({ visible: false, top: 0, left: 0 });
  const timeoutRef = useRef(null);

  const schedule = useCallback(() => {
    // shedule another try after 10–30 s
    timeoutRef.current = setTimeout(() => {
      if (window.gameEnded) return;

      const chance = lightsOn ? 0.2 : 0.6;
      if (Math.random() < chance) {
        const top = Math.floor(Math.random() * 70) + 10;
        const left = Math.floor(Math.random() * 70) + 10;
        setGhost({ visible: true, top, left });

        // ghost disapperas after 2 s
        setTimeout(() => setGhost(g => ({ ...g, visible: false })), 2000);
      }

      // schedule next occurrence
      schedule();
    }, Math.random() * 20000 + 10000);
  }, [lightsOn]);

  useEffect(() => {
    schedule();
    return () => clearTimeout(timeoutRef.current);
  }, [schedule]);

  if (!ghost.visible) return null;

  return (
    <div
      className="shadow-ghost"
      style={{ top: `${ghost.top}%`, left: `${ghost.left}%` }}
    />
  );
};

export default memo(GhostComponent);
