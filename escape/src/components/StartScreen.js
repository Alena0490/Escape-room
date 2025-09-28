// StartScreen.js
import { memo, useCallback, useEffect, useRef } from "react";
import "./StartScreen.css";

const StartScreen = ({ onStart }) => {
  const btnRef = useRef(null);

  useEffect(() => {
    btnRef.current?.focus();
  }, []);

  const handleStart = useCallback(() => {
    onStart?.();
  }, [onStart]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleStart();
    }
  }, [handleStart]);

  return (
    <section
      className="start-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="title"
      aria-describedby="intro"
      onKeyDown={handleKeyDown}
    >
      <h1 id="title" className="start-title">The Morning After</h1>

      <div id="intro" className="start-intro">
        <p className="basic-line">It was a shitty night. And judging by this décor, I might be dead.”</p>
        <p className="basic-line">My head’s pounding. Floor’s cold. This definitely isn’t my room. Feels like Ikea instructions, but for trauma — missing pieces and a lot of screaming.</p>
        <p className="basic-line">Great. My phone’s dead. No Google, no tutorials, just me and whatever’s whispering. Ugh.</p>
        <p className="basic-line">Ok, let’s find the door. Avoid becoming a permanent part of the spooky interior design.</p>
        <p className="basic-line last-line">Good luck, genius. You're gonna need it. Also, maybe therapy.</p>
      </div>

      <button
        ref={btnRef}
        className="start-btn"
        onClick={handleStart}
        aria-label="Start game"
      >
        Start game
      </button>
    </section>
  );
};

export default memo(StartScreen);
