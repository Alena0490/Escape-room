import { useEffect, useRef, useCallback, memo  } from "react";
import "./BackWall.css"
import switchSound from "../sounds/light-switch-382712.mp3";
import Door from "../sounds/door-handle-1-401153.mp3"
import Click from "../sounds/mouse-click-290204.mp3"

const BackWall = ({
  // states from Room
  isActive,
  setLightsOn,
  setIsFlickering,
  playSound,
  showComment,
  incrementItemClicks,
  triggerVibration,
  setShowLock,
  unlockEasterEgg,
}) => {

    const onIndex = useRef(0);
    const offIndex = useRef(0);

  // Switch Sound preload
  useEffect(() => {
    const a = new Audio(switchSound);
    a.preload = "auto";
    a.load();
  }, []);

   // --- handlers --------------------------------------------------------------
  const handleSwitchClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation?.();

      const roomCanvas = document.getElementById("room");
      const switchEl = e.currentTarget;

      playSound(switchSound);

      const turningOn = roomCanvas.classList.contains("dark");

      if (turningOn) {
        // LIGHTS ON
        setTimeout(() => {
          roomCanvas.classList.remove("dark");
          switchEl.classList.add("on");

          setIsFlickering(true);
          setTimeout(() => setIsFlickering(false), 1200);

          setLightsOn(true);

          const onMessages = [
            "Much better.",
            "Finally some light!",
            "Ah, I can see everything clearly now.",
            "Feels safer with the lights on…",
          ];
          const msg = onMessages[onIndex.current];
          switchEl.setAttribute("data-comment", msg);
          showComment(msg);
          onIndex.current = (onIndex.current + 1) % onMessages.length;
        }, 300);
      } else {
        // LIGHTS OFF
        setTimeout(() => {
          roomCanvas.classList.add("dark");
          switchEl.classList.remove("on");

          setLightsOn(false);

          const offMessages = [
            "Ugh... it's too dark, I can't see a thing.",
            "Creepy... I should turn the lights back on.",
            "Wait, what was that?! Better keep it bright.",
            "Nope, not staying in the dark!",
          ];
          const msg = offMessages[offIndex.current];
          switchEl.setAttribute("data-comment", msg);
          showComment(msg);
          offIndex.current = (offIndex.current + 1) % offMessages.length;
        }, 300);
      }

      incrementItemClicks("light-switch");
      triggerVibration(30);
    },
    [
      playSound,
      setIsFlickering,
      setLightsOn,
      showComment,
      incrementItemClicks,
      triggerVibration,
    ]
  );

  const handleLockClick = useCallback(
    (e) => {
      e.stopPropagation();
      playSound(Click, { fadeIn: 0.2 });
      const msg = e.currentTarget.getAttribute("data-comment");
      if (msg) showComment(msg);
      incrementItemClicks("code-lock");
      setTimeout(() => setShowLock(true), 200);
      triggerVibration(30);
    },
    [playSound, showComment, incrementItemClicks, setShowLock, triggerVibration]
  );

  const handleDoorClick = useCallback(
    (e) => {
      e.stopPropagation();
      incrementItemClicks("door");
      triggerVibration(30);

      if (e.currentTarget.classList.contains("open")) {
        const msg =
          "It was a long day... Let's get out of here. Finally, fresh air!";
        e.currentTarget.setAttribute("data-comment", msg);
        showComment(msg);
      } else {
        const msg = "It's locked.";
        e.currentTarget.setAttribute("data-comment", msg);
        showComment(msg);
        playSound(Door, { start: 0.2 });
      }
    },
    [incrementItemClicks, triggerVibration, showComment, playSound]
  );

  const handleChalkClick = useCallback(
    (e) => {
      e.stopPropagation();
      incrementItemClicks("graffiti");
      triggerVibration(30);
      unlockEasterEgg("chalk1");
      const msg = e.currentTarget.getAttribute("data-comment");
      if (msg) showComment(msg, "easter-egg");
    },
    [incrementItemClicks, triggerVibration, unlockEasterEgg, showComment]
  );
  // ---------------------------------------------------------------------------

    return (
        <div   
            className={`wall wall-back ${isActive ? "active" : ""}`}
            aria-hidden={!isActive}
            style={!isActive ? { pointerEvents: "none" } : undefined}
        >            
            <div className="flat lock item" 
                data-title="Door lock" 
                data-comment="It says: 'Please, enter the code'"
                onClick={isActive ? handleLockClick : undefined}
                tabIndex={isActive ? 0 : -1}
            ></div>

            <div className="flat door inner">
                <span className="visually-hidden">Numeric lock</span>
            </div>
            
            <div 
                className="flat door item" 
                data-title="Locked Door" 
                data-comment="It's locked."
                onClick={isActive ? handleDoorClick : undefined}
                tabIndex={isActive ? 0 : -1}
            >
                <span className="visually-hidden">Heavy metal door</span>
            </div>

            <div 
                className="flat switch item" 
                data-title="Light Switch" 
                data-comment="Much better."
                onClick={isActive ? handleSwitchClick : undefined}
                tabIndex={isActive ? 0 : -1}
            >
                <span className="visually-hidden">Light switch</span>
            </div>

            <div
                className="item chalk-message"
                data-title="Strange graffiti writing"
                data-comment="Wait, what: `Smile, you're not the first one here`? Is someone watching me?"
                onClick={isActive ? handleChalkClick : undefined}
                tabIndex={isActive ? 0 : -1}
            >
                <span className="visually-hidden">Graffiti text on the wall</span>
            </div>
        </div>                  
    )
}

export default memo(BackWall);