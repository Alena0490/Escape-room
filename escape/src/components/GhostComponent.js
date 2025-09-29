import { useState, useEffect, useRef, useCallback, memo } from "react";
import "./GhostComponent.css";

/**
 * GhostComponent
 * - Occasionally shows a faint ghost at a random screen position.
 * - Probability depends on lightsOn (higher chance in the dark).
 * - Never overlaps its own appearance (waits until current one hides).
 * - Fully cleans up scheduled timeouts on unmount.
 */
const GhostComponent = ({ lightsOn }) => {
  const [ghost, setGhost] = useState({ visible: false, top: 0, left: 0 });

  // Timeouts for scheduling next appearance and for hiding the current one
  const scheduleRef = useRef(null);
  const hideRef = useRef(null);

  // Keep a live flag of current visibility to avoid overlapping spawns
  const visibleRef = useRef(false);
  useEffect(() => {
    visibleRef.current = ghost.visible;
  }, [ghost.visible]);

  /**
   * Schedule the next attempt:
   * - wait a random 10–30s,
   * - if a ghost is already visible, just reschedule,
   * - otherwise roll the dice (higher chance when lights are off),
   * - if it appears, hide after 2s, then schedule the next attempt again.
   */
  const schedule = useCallback(() => {
    // random delay between 10s and 30s
    const delay = Math.random() * 20000 + 10000;

    scheduleRef.current = setTimeout(() => {
      if (window.gameEnded) return;

      // Don't overlap: if visible, try again later
      if (visibleRef.current) {
        schedule();
        return;
      }

      // Probability: brighter room -> lower chance
      const chance = lightsOn ? 0.2 : 0.6;
      if (Math.random() < chance) {
        // Random position within safe margins (10% .. 80%)
        const top = Math.floor(Math.random() * 70) + 10;
        const left = Math.floor(Math.random() * 70) + 10;
        setGhost({ visible: true, top, left });

        // Ensure only one hide timer at a time
        if (hideRef.current) clearTimeout(hideRef.current);

        // Hide after 2s
        hideRef.current = setTimeout(() => {
          setGhost((g) => ({ ...g, visible: false }));
        }, 2000);
      }

      // Queue next attempt regardless of the outcome
      schedule();
    }, delay);
  }, [lightsOn]);

  // Start scheduling on mount; clean up on unmount
  useEffect(() => {
    schedule();
    return () => {
      clearTimeout(scheduleRef.current);
      clearTimeout(hideRef.current);
    };
  }, [schedule]);

  if (!ghost.visible) return null;

  return (
    <div
      className="shadow-ghost"
      // The CSS should position this element (e.g., position: fixed/absolute)
      style={{ top: `${ghost.top}%`, left: `${ghost.left}%` }}
    />
  );
};

export default memo(GhostComponent);
