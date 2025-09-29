import { useState, useCallback, useEffect, useRef, memo, lazy, Suspense } from "react";
import "./CodeLock.css";

const WinScreen = lazy(() => import("./WinScreen"));

/** CALCULATE THE SCORE */
const BASE_SCORE = 100;
const computeScore = ({ items, eggs, hints }) => {
  const itemPts = items * 5;
  const eggPts = eggs * 20;
  const hintPenalty = hints * 10;
  return Math.max(0, BASE_SCORE + itemPts + eggPts - hintPenalty);
};

const CodeLock = ({
  showLock,
  setShowLock,
  showComment,
  playSound,
  playSequence,
  fadeOutAudio,
  calculateGameTime,
  getHintsUsed,
  getItemsClicked,
  getEasterEggsCount,
  stopAllAudio,
}) => {
  const [code, setCode] = useState("");
  const [showWinScreen, setShowWinScreen] = useState(false);
  const formRef = useRef(null);
  const warmedRef = useRef(false);

// Sounds preload
  useEffect(() => {
    if (!showLock) return;
    const el = formRef.current;
    if (!el || warmedRef.current) return;

    const warm = async () => {
      warmedRef.current = true;
      try {
        const whoosh = (await import("../sounds/whoosh-blow-flutter-shortwav-146.mp3")).default;
        const err    = (await import("../sounds/error-126627.mp3")).default;
        const door   = (await import("../sounds/opening-metal-door-98518.mp3")).default;
        const win    = (await import("../sounds/success-fanfare-trumpets-6185.mp3")).default;
        [whoosh, err, door, win].forEach((src) => {
          const a = new Audio();
          a.preload = "auto";
          a.src = src;
          a.load();
        });
      } catch {}
    };

    el.addEventListener("pointerdown", warm, { once: true, capture: true });
    return () => el.removeEventListener("pointerdown", warm, { capture: true });
  }, [showLock]);

//Closing form
  const onClose = useCallback(async () => {
    try {
      const whoosh = (await import("../sounds/whoosh-blow-flutter-shortwav-146.mp3")).default;
      playSound?.(whoosh, { start: 0.1 });
    } catch {}
    setTimeout(() => setShowLock(false), 500);
  }, [playSound, setShowLock]);

  const handleChange = useCallback((e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(v);
  }, []);

// Submit form
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

// Check if the code is correct
    if (code === "483920") {
      try {
        const door = (await import("../sounds/opening-metal-door-98518.mp3")).default;
        const win  = (await import("../sounds/success-fanfare-trumpets-6185.mp3")).default;
        playSequence?.([
          { src: door, options: { fadeIn: 0.2, duration: 2.5 } },
          { src: win,  options: { volume: 1, start: 0.1 } },
        ]);
      } catch {}

      //The code is correct - Win
      if (window.roomAmbientAudio) {
        fadeOutAudio?.(window.roomAmbientAudio, 1500);
        window.roomAmbientAudio = null;
      }

      showComment?.("The door is now open! You can leave the&nbsp;room.", "success");
      setShowLock(false);

      requestAnimationFrame(() => {
        setTimeout(() => {
          const doorEl = document.querySelector(".door.item");
          if (doorEl) doorEl.classList.add("open");
        }, 600);
      });

      window.gameEnded = true;
      setTimeout(() => setShowWinScreen(true), 2700);
      
      // The code isn't correct - Error
    } else {
      try {
        const err = (await import("../sounds/error-126627.mp3")).default;
        playSound?.(err, { start: 0.4, volume: 1 });
      } catch {}
      showComment?.("Incorrect code. Try again.", "error");
    }

    setCode("");
  }, [code, playSequence, fadeOutAudio, showComment, setShowLock, playSound, setShowWinScreen]);

  //Restart the game
  const handleRestart = useCallback(() => {
    try { stopAllAudio?.(); } catch {}
    localStorage.clear();
    window.location.reload();
  }, [stopAllAudio]);

  return (
    <>
      {showLock && !showWinScreen && (
        <form
          ref={formRef}
          name="code-lock"
          className="code-lock active"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <h3 id="code-lock-title">Enter the code</h3>

          <span
            className="close"
            aria-label="Close form"
            onClick={onClose}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClose(); } }}
          >
            <span aria-hidden>×</span>
          </span>

          <label 
            htmlFor="code-input" 
            className="visually-hidden">6-digit code
          </label>
          <input
            id="code-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            className="code-input"
            placeholder="******"
            value={code}
            onChange={handleChange}
            autoFocus
            aria-labelledby="code-lock-title"
            autoComplete="off"
          />

          <button type="submit" className="code-submit" disabled={code.length !== 6}>
            Confirm
          </button>
        </form>
      )}

      {showWinScreen && (
        <Suspense fallback={null}>
          <WinScreen
            time={calculateGameTime()}
            hints={getHintsUsed()}
            items={getItemsClicked()}
            eggCount={getEasterEggsCount()}
            score={computeScore({
              items: getItemsClicked(),
              eggs: getEasterEggsCount(),
              hints: Number(getHintsUsed() || 0)
            })}
            onRestart={handleRestart}
            stopAllAudio={stopAllAudio}
          />
        </Suspense>
      )}
    </>
  );
};

export default memo(CodeLock);
