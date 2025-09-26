import { useState } from "react";
import "./Floor.css"
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

  const handleRugClick = (e) => {
    e.stopPropagation();
    incrementItemClicks("rug");

    // calculate the next state and immediately save it to LS
    const wasUp = rugUp;
    const next = !rugUp;
    setRugUp(next);
    localStorage.setItem("rugUp", next ? "1" : "0");

    showComment(
      "Yuck, it's so dirty. Wait, there is a radio under. There are some scratched letters: 'BIG EAR'. Maybe I could try this frequency. WOW! I've got the signal, it's so weird."
    );

    if (!wasUp) {
      //Pick up the rug -> lonh sequention
      playSequence([
        { src: Rug,       options: { duration: 1,   fadeIn: 0.2 } },
        { src: RadioTune, options: { duration: 4.2, fadeIn: 0.2 } },
        { src: Alien,     options: { volume: 0.3,   start: 2   } }
      ]);
    } else {
      //put the rug back -> short sound
      playSound(Rug, { duration: 0.8, volume: 0.7 });
    }

    triggerVibration(30);
  };
  /** CONTRACT */
  const handleContractClick = (e) => {
    e.stopPropagation();
    playSound(Paper, { volume: 0.5, start: 0.2 });
    unlockEasterEgg("contract");
    showComment(
      "A contract with television… Ten thousand euros. Guess I really signed my life away.",
      "easter-egg"
    );
    incrementItemClicks("contract");
    triggerVibration(30);
  };

 return  (
    <div className="wall wall-bottom">
        <div              
            className={`rug flat item ${rugUp ? "rug-up" : ""}`}
            data-title="Some old rug"              
            data-comment="Yuck, it's so dirty. Wait, there is a radio under. There are some scratched letters: 'BIG EAR'. Maybe I could try this frequency. WOW! I've got the signal, it's so weird."
            role="button"
            tabIndex={0}
            onClick={handleRugClick}
        >
            <span className="visually-hidden">Dirty fur rug</span>
        </div>

        <div
            className="item contract egg"
            data-title="Some crumpled contract"
            data-comment="A contract with television… Ten thousand euros. Guess I really signed my life away."
            role="button"
            tabIndex={0}
            onClick={handleContractClick}
            onKeyDown={(e) => e.key === "Enter" && handleContractClick(e)}
        >
            <span className="visually-hidden">Crumpled contract lying on the floor</span>
        </div>
    </div>
    )
}

export default Floor