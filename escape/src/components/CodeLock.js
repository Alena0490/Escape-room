import "./CodeLock.css";
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

      // otevření dveří po animaci
      setTimeout(() => {
        const door = document.querySelector(".door.item");
        if (door) door.classList.add("open");
      }, 1500);

      // zobrazit win screen
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
        <div id="win" className="win">
          <p className="win-content">Congratulations</p>
          <div className="win-stats">
            <h3>Statistics:</h3>
            <p>Time: {calculateGameTime()}</p>
            <p>Hints Used: {getHintsUsed()}</p>
            <p>Items Searched: {getItemsClicked()}</p>
          </div>
          <button className="win-button" onClick={handleRestart}>
            Play again
          </button>
        </div>
      )}
    </>
  );
};

export default CodeLock;
