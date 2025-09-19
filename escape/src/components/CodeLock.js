import "./CodeLock.css";
import WinScreen from "./WinScreen"; //
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import Error from "../sounds/error-126627.mp3";
import DoorOpen from "../sounds/opening-metal-door-98518.mp3";
import Whoosh from "../sounds/whoosh-blow-flutter-shortwav-14678.mp3";
import Win from "../sounds/success-fanfare-trumpets-6185.mp3";

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
}) => {
  const [code, setCode] = useState("");
  const [showWinScreen, setShowWinScreen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === "483920") {
      playSequence([
        { DoorOpen, options: { fadeIn: 0.2, duration: 2.5 } },
        { Win, options: { volume: 1, start: 0.1 } },
      ]);

      if (window.roomAmbientAudio) {
        fadeOutAudio(window.roomAmbientAudio, 1500);
      }

      showComment("The door is now open! You can leave the&nbsp;room.", "success");
      setShowLock(false);

      // Opening the door
      setTimeout(() => {
        const door = document.querySelector(".door.item");
        if (door) door.classList.add("open");
      }, 1500);

      // Stop the random sounds
      setTimeout(() => {
          setShowWinScreen(true);
          window.gameEnded = true;
        }, 2700);

      // Show the win screen
      setTimeout(() => {
        setShowWinScreen(true);
      }, 2700);
    } else {
      playSound(Error, { start: 0.4, volume: 1 });
      showComment("Incorrect code. Try again.", "error");
    }
    setCode("");
  };

  const handleRestart = () => {
    // Stop ambient sound 
      if (window.roomAmbientAudio) {
      window.roomAmbientAudio.pause();
      window.roomAmbientAudio.currentTime = 0;
      window.roomAmbientAudio = null;
    }
    // Reset LocalStorage
    localStorage.clear();
    window.location.reload();
  };

  return (
    <>
      {!showWinScreen && (
        <form
          className={`code-lock ${showLock ? "active" : ""}`}
          onSubmit={handleSubmit}
        >
          <h3>Enter the code</h3>
          <IoClose
            className="close"
            aria-label="close form"
            onClick={() => {
              setTimeout(() => setShowLock(false), 600);
              playSound(Whoosh, { start: 0.1 });
            }}
          />

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="6"
            className="code-input"
            placeholder="******"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />

          <button type="submit" className="code-submit">
            Confirm
          </button>
        </form>
      )}

      {showWinScreen && (
        <WinScreen
          time={calculateGameTime()}
          hints={getHintsUsed()}
          items={getItemsClicked()}
          eggCount={getEasterEggsCount()} 
          onRestart={handleRestart}
        />
      )}
    </>
  );
};

export default CodeLock;
