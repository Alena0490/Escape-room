import { memo, useCallback, useEffect } from "react";
import "./Cardbox.css";
import CardboardBox from "../sounds/cardboard-box-open-182560.mp3";
import Paper from "../sounds/paper-rustle-81855.mp3";

const Cardbox = ({
  playSequence,
  showComment,
  incrementItemClicks,
  triggerVibration,
}) => {
  // Prewarm sounds after the first user's inateraction
  useEffect(() => {
    const warm = () => {
      window.removeEventListener("pointerdown", warm, true);
      try {
        [CardboardBox, Paper].forEach((src) => {
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

  const handleClick = useCallback((e) => {
    e.stopPropagation();

    playSequence?.([
      { src: CardboardBox, options: { duration: 2.5, fadeIn: 0.2 } },
      { src: Paper,        options: { volume: 0.5, start: 0.2 } },
    ]);

    const msg = e.currentTarget.getAttribute("data-comment");
    if (msg) showComment?.(msg);

    incrementItemClicks?.("cardbox");
    triggerVibration?.(30);
  }, [playSequence, showComment, incrementItemClicks, triggerVibration]);

  const onKeyActivate = useCallback((e) => {
    const k = e.key;
    if (k === "Enter" || k === " ") {
      e.preventDefault();
      handleClick(e);
    }
  }, [handleClick]);

  return (
    <div
      className="cube cardbox"
      data-title="A random box"
      data-comment="There is just a piece of paper. It says: 'KEY: book, ball, mirror, cassette, skull, rug'"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={onKeyActivate}
    >
      <span className="visually-hidden">Cardboard box</span>
    </div>
  );
};

export default memo(Cardbox);
