// WinScreen.js
import { useEffect, useRef, useCallback, memo } from "react";
import "./WinScreen.css";

const GRACE_MS = 4500; // How long to wait before hard-stopping audio if we can't detect 'ended'

const WinScreen = ({
  time,
  hints,
  items,
  eggCount,
  score,
  onRestart,
  stopAllAudio,
}) => {
  const btnRef = useRef(null);
  const timerRef = useRef(null);
  const cleanupRef = useRef(() => {});

  // Focus primary action on mount
  useEffect(() => {
    btnRef.current?.focus();
  }, []);

  // Make sure the game is considered ended while this screen is visible
  useEffect(() => {
    window.gameEnded = true;
  }, []);

  // Stop all audio after win cue finishes (or after GRACE_MS as a fallback)
  useEffect(() => {
    if (!stopAllAudio) return;

    // If you expose the win fanfare instance as window.winFanfare elsewhere,
    // we prefer waiting for its 'ended' event to avoid cutting it.
    const fanfare = window.winFanfare;
    const stop = () => {
      try { stopAllAudio(); } catch {}
    };

    if (fanfare && typeof fanfare.addEventListener === "function") {
      const onEnded = () => {
        stop();
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      };
      fanfare.addEventListener("ended", onEnded, { once: true });

      // Fallback in case 'ended' never fires
      timerRef.current = setTimeout(stop, GRACE_MS);

      cleanupRef.current = () => {
        fanfare.removeEventListener("ended", onEnded);
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      };
    } else {
      // No explicit fanfare instance known → use a simple grace period
      timerRef.current = setTimeout(stop, GRACE_MS);
      cleanupRef.current = () => {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      };
    }

    return () => cleanupRef.current();
  }, [stopAllAudio]);

  const handleRestart = useCallback(() => {
    onRestart?.();
  }, [onRestart]);

  return (
    <section className="win-screen" role="dialog" aria-modal="true" aria-live="polite">
      <div id="win" className="win">
        <p className="win-content">Congratulations</p>

        <p className="win-message">
          It was a long day... Let's get out of here. Finally, fresh air!
        </p>

        <div className="win-stats">
          <h3>Statistics:</h3>
          <p>Time: {time ?? "00:00"}</p>
          <p>Hints Used: {hints ?? 0}</p>
          <p>Items Searched: {items ?? 0}</p>
          <p className="bonus">Bonus points: {eggCount ?? 0} of 7</p>
          <p className="final-score">
            <strong>Score:</strong>
            <span className="num">{score}</span> 
            <span className="max">/ 350</span>
          </p>
        </div>

        <button ref={btnRef} className="win-button" onClick={handleRestart}>
          Play again
        </button>
      </div>
    </section>
  );
};

export default memo(WinScreen);
