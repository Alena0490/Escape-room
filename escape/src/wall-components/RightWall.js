import { useCallback, memo } from "react";
import "./RightWall.css";
import Mirror from "../sounds/creepy-moan-87456.mp3";

/**
 * RightWall
 * - Poster (easter egg + comment)
 * - Mirror (play sound + comment)
 * - Mirror Crack (easter egg + comment)
 */

const RightWall = ({
  lightsOn,
  unlockEasterEgg,
  showComment,
  incrementItemClicks,
  triggerVibration,
  playSound,
}) => {

  // Common keyboard activator (Enter/Space)
  const onKeyActivate = useCallback((fn) => (e) => {
    const k = e.key;
    if (k === "Enter" || k === " " || k === "Spacebar") {
      e.preventDefault();
      fn(e);
    }
  }, []);

  /** Poster (egg) */
  const handlePosterClick = useCallback((e) => {
    e.stopPropagation();
    unlockEasterEgg("poster");                     // save to LocalStorage
    const msg = e.currentTarget.getAttribute("data-comment");
    if (msg) showComment(msg, "easter-egg");
    incrementItemClicks("poster");
    triggerVibration(30);
  }, [unlockEasterEgg, showComment, incrementItemClicks, triggerVibration]);

  /** Mirror */
  const handleMirrorClick = useCallback((e) => {
    e.stopPropagation();
    playSound(Mirror);
    incrementItemClicks("mirror");
    const msg = e.currentTarget.getAttribute("data-comment");
    if (msg) showComment(msg);
    triggerVibration(30);
  }, [playSound, incrementItemClicks, showComment, triggerVibration]);

  // Mirror aria handlers
  const handleMirrorEnter = useCallback((e) => {
    if (lightsOn) e.currentTarget.setAttribute("aria-label", "Mirror: Friday the 13th appears");
  }, [lightsOn]);

  const handleMirrorLeave = useCallback((e) => {
    e.currentTarget.setAttribute("aria-label", "Mirror");
  }, []);

  /** Mirror crack (egg) */
  const handleMirrorCrackClick = useCallback((e) => {
    e.stopPropagation();
    unlockEasterEgg("mirror-crack"); // save to LocalStorage
    const msg = e.currentTarget.getAttribute("data-comment");
    if (msg) showComment(msg, "easter-egg");
    incrementItemClicks("mirror-crack");
    triggerVibration(30);
  }, [unlockEasterEgg, showComment, incrementItemClicks, triggerVibration]);

  return (
    <div className="wall wall-right">
      <div
        className="poster item egg"
        data-title="Some old poster"
        data-comment="What the hell is the chainsaw commercial doing there? Are they sponsoring this freak show or what?"
        role="button"
        tabIndex={0}
        onClick={handlePosterClick}
        onKeyDown={onKeyActivate(handlePosterClick)}
      >
        <span className="visually-hidden">Old faded poster</span>
      </div>

      <div
        className={`mirror item ${lightsOn ? "lit" : ""}`}
        role="button"
        tabIndex={0}
        data-title="An old mirror"
        data-comment="How do I look? Eh, hello, Mr. Ghost, please don't kill me."
        aria-label={lightsOn ? "Mirror: Friday the 13th appears" : "Mirror"}
        onFocus={handleMirrorEnter}
        onBlur={handleMirrorLeave}
        onClick={handleMirrorClick}
        onKeyDown={onKeyActivate(handleMirrorClick)}
      >
        <span className="visually-hidden">Old mirror flashing letters Friday 13th</span>
      </div>

      <div
        className="item mirror-crack egg"
        data-title="Crack in the mirror"
        data-comment="What is it? Is there a fu**ing camera inside…?"
        role="button"
        tabIndex={0}
        onClick={handleMirrorCrackClick}
        onKeyDown={onKeyActivate(handleMirrorCrackClick)}
      >
        <span className="visually-hidden">Crack in the mirror</span>
      </div>
    </div>
  );
};

export default memo(RightWall);
