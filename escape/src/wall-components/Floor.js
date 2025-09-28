import { useState, useCallback, useEffect, memo } from "react";
import "./Floor.css";
import Rug from "../sounds/object-dragged-on-carpet-140497.mp3";
import RadioTune from "../sounds/am-tuning-104200.mp3";
import Alien from "../sounds/alien-underworld-sound-287342.mp3";
import Paper from "../sounds/paper-rustle-81855.mp3";

const Floor = ({
  playSound,
  playSequence,
  showComment,
  incrementItemClicks,
  unlockEasterEgg,
  triggerVibration,
}) => {
  // 🔹 1) PREWARM – after the first users interaction
  useEffect(() => {
    const srcs = [Rug, RadioTune];

    const warm = () => {
      window.removeEventListener("pointerdown", warm, true);
      try {
        srcs.forEach((src) => {
          const a = new Audio();
          a.preload = "auto";
          a.src = src;
          a.load();
        });
      } catch {}
    };

    window.addEventListener("pointerdown", warm, true);
    return () => window.removeEventListener("pointerdown", warm, true);
  }, []);

  /** RUG */
  const [rugUp, setRugUp] = useState(() => {
    try {
      const legacy = localStorage.getItem("escapeRoomState");
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (typeof parsed?.rugUp === "boolean") return parsed.rugUp;
      }
    } catch {}
    return localStorage.getItem("rugUp") === "1";
  });

  const handleRugClick = useCallback((e) => {
    e.stopPropagation();
    incrementItemClicks("rug");

    const wasUp = rugUp;
    const next = !rugUp;
    setRugUp(next);
    localStorage.setItem("rugUp", next ? "1" : "0");

    if (!wasUp) {
      // 🔹 2) Start the sequence IMMEDIATELY
      playSequence([
        { src: Rug,       options: { duration: 1,   fadeIn: 0.2 } },
        { src: RadioTune, options: { duration: 4.2, fadeIn: 0.2 } },
        { src: Alien,     options: { volume: 0.3,   start: 2   } },
      ]);
 
      showComment(
        "Yuck, it's so dirty. Wait, there is a radio under. There are some scratched letters: 'BIG EAR'. Maybe I could try this frequency. WOW! I've got the signal, it's so weird."
      );
    } else {
      playSound(Rug, { duration: 0.8, volume: 0.7 });
      showComment(
        "Yuck, it's so dirty. Wait, there is a radio under. There are some scratched letters: 'BIG EAR'. Maybe I could try this frequency. WOW! I've got the signal, it's so weird."
      );
    }

    triggerVibration(30);
  }, [rugUp, incrementItemClicks, playSequence, playSound, showComment, triggerVibration]);

  /** CONTRACT */
  const handleContractClick = useCallback((e) => {
    e.stopPropagation();
    playSound(Paper, { volume: 0.5, start: 0.2 });
    unlockEasterEgg("contract");
    showComment(
      "A contract with television… Ten thousand euros. Guess I really signed my life away.",
      "easter-egg"
    );
    incrementItemClicks("contract");
    triggerVibration(30);
  }, [playSound, unlockEasterEgg, showComment, incrementItemClicks, triggerVibration]);

  return (
    <div className="wall wall-bottom">
      <div
        className={`rug flat item ${rugUp ? "rug-up" : ""}`}
        data-title="Some old rug"
        data-comment="Yuck, it's so dirty. Wait, there is a radio under. There are some scratched letters: 'BIG EAR'. Maybe I could try this frequency. WOW! I've got the signal, it's so weird."
        role="button"
        tabIndex={0}
        onClick={handleRugClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleRugClick(e);
          }
        }}
      >
        <span className="visually-hidden">Dirty fur rug</span>
      </div>

      <div
        className="item contract egg"
        data-title="Some crumpled document"
        data-comment="A contract with television… Ten thousand euros. Guess I really signed my life away."
        role="button"
        tabIndex={0}
        onClick={handleContractClick}
        onKeyDown={(e) => e.key === "Enter" && handleContractClick(e)}
      >
        <span className="visually-hidden">Crumpled document lying on the floor</span>
      </div>
    </div>
  );
};

export default memo(Floor);
