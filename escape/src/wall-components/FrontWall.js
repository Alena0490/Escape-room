import { useCallback, useRef, memo } from "react";
import "./FrontWall.css";
import JumpScare from "../sounds/075283-quotbehind-youquot-whispe.mp3";

/**
 * FrontWall
 * - Painting (easter egg + play sound + comment)
 */
const FrontWall = ({
  unlockEasterEgg,
  incrementItemClicks,
  showComment,
  playSound,
}) => {
  // play-once lock per continuous hover
  const hoverLockRef = useRef(false);
  // small cooldown to avoid re-triggers caused by layout/hover flicker
  const cooldownRef = useRef(false);

  const handlePaintingClick = useCallback((e) => {
    e.stopPropagation();
    unlockEasterEgg("painting");     // save to LocalStorage
    incrementItemClicks("painting");
    const msg = e.currentTarget.getAttribute("data-comment");
    if (msg) showComment(msg, "easter-egg");
  }, [unlockEasterEgg, incrementItemClicks, showComment]);

  // one-shot hover sound (no repeats until pointer leaves)
  const handlePaintingEnter = useCallback((e) => {
    // ignore touch (no hover on mobile)
    if (e.pointerType === "touch") return;
    if (hoverLockRef.current || cooldownRef.current) return;
    hoverLockRef.current = true;
    cooldownRef.current = true;

    try { playSound(JumpScare, { duration: 2.5, volume: 0.7 }); } catch {}

    // cooldown shorter than full sfx to tolerate minor layout flicker
    setTimeout(() => { cooldownRef.current = false; }, 1200);
  }, [playSound]);

  const handlePaintingLeave = useCallback(() => {
    hoverLockRef.current = false;
  }, []);

  return (
    <div className="wall wall-front">
      <div
        className="item painting egg"
        role="button"
        tabIndex={0}
        aria-label="Painting"
        data-title="What a nice painting!"
        data-comment="Strange… That voice—was it you? Did you just say something about the producers? Go on then. Tell me. I’m all ears."
        onClick={handlePaintingClick}
        onPointerEnter={handlePaintingEnter}
        onPointerLeave={handlePaintingLeave}
        onFocus={handlePaintingEnter}
        onBlur={handlePaintingLeave}
        onKeyDown={(e) => {
          const k = e.key;
          if (k === "Enter" || k === " " || k === "Spacebar") {
            e.preventDefault();
            handlePaintingClick(e);
          }
        }}
      >
        <span className="visually-hidden">A Van Gogh self-portrait</span>
      </div>
    </div>
  );
};

export default memo(FrontWall);
