import { useState, useEffect, useRef, useCallback } from "react";
import "./Room.css";
/** Items */
import CodeLock from "./CodeLock";
import RoomNavigation from "./RoomNavigation";
import AudioController from "./AudioController";
import Table from "./Table.js";
import Cardbox from "./Cardbox.js";
/** Walls */
import Floor from "../wall-components/Floor.js";
import Ceiling from "../wall-components/Ceiling.js";
import BackWall from "../wall-components/BackWall.js";
import RightWall from "../wall-components/RightWall.js";
import LeftWall from "../wall-components/LeftWall.js";
import FrontWall from "../wall-components/FrontWall.js";
/** Hooks */
import useTilt from "../hooks/useTilt.js";
import useSetAudio from "../hooks/useSetAudio.js";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

const VIEWS = ["back-view", "left-view", "front-view", "right-view"];

const Room = () => {
  const wrapRef = useRef(null);
  const roomRef = useRef(null);
  const { playSound, playSequence, fadeOutAudio, stopAllAudio, setMuted, isMuted } = useSetAudio();

  const [isFlickering, setIsFlickering] = useState(false);
  const [activeView, setActiveView] = useState(0); // 0 = back-view
  const [gameState, setGameState] = useState({ lightsOn: false, doorOpen: false });
  const [showLock, setShowLock] = useState(false);

  // Room tilting
  useEffect(() => {
    if (roomRef.current) {
      roomRef.current.style.setProperty("--rotateX", "0deg");
    }
  }, []);

  /** Dialog close on outside click */
  useEffect(() => {
    const dialog = document.getElementById("dialog");
    const onDocPointerDown = (e) => {
      if (!dialog.contains(e.target)) {
        const last = dialog.lastElementChild;
        if (last) {
          last.style.opacity = "0";
          setTimeout(() => last.remove(), 300);
        }
      }
    };
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () => document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, []);

  /** View & tilt */
  const prefersReduced = usePrefersReducedMotion();

  const rotationYRef = useRef(0);
  const viewIndexRef = useRef(0);

  const {
    applyTransform,       // pitch+yaw
    resetTilt,            // reset to 0/0
    bindMouseTilt,        // mousemove/mouseleave
    bindNavFreezeTilt,    // reset when clicking on .room-nav
  } = useTilt({
    roomRef,
    wrapRef,
    rotationYRef,
    maxPitch: 6,
    maxYaw: 3,
  });

  // If user prefers reduced motion, just clear tilt once (do not touch rotation)
  useEffect(() => {
    if (prefersReduced) {
      resetTilt?.();
      if (roomRef.current) roomRef.current.style.setProperty("--rotateX", "0deg");
    }
  }, [prefersReduced, resetTilt]);

  // Update view (rotation logic unchanged)
  const updateView = useCallback((direction) => {
    const roomWrap = wrapRef.current;
    if (!roomWrap || !roomRef.current) return;

    // Reset tilt on view change (safe even with reduced motion)
    resetTilt();

    if (direction === "left") {
      viewIndexRef.current = (viewIndexRef.current + 1) % VIEWS.length;
      rotationYRef.current -= 90;
    } else if (direction === "right") {
      viewIndexRef.current = (viewIndexRef.current - 1 + VIEWS.length) % VIEWS.length;
      rotationYRef.current += 90;
    }

    setActiveView(viewIndexRef.current);

    roomWrap.classList.remove(...VIEWS);
    roomWrap.classList.add(VIEWS[viewIndexRef.current]);
    // uvnitř updateView, hned po classList.add(VIEWS[...])
    if (!prefersReduced) {
      roomWrap.classList.add("rotating");
      setTimeout(() => roomWrap.classList.remove("rotating"), 500);
    }

    roomWrap.classList.add("rotating");
    setTimeout(() => roomWrap.classList.remove("rotating"), 500);

    applyTransform();
  }, [resetTilt, applyTransform, prefersReduced]);

  // Convenience
  const { lightsOn } = gameState;

  /** Vibration feedback */
  const triggerVibration = useCallback((duration = 50) => {
    if ("vibrate" in navigator) navigator.vibrate(duration);
  }, []);

  /** Start time */
  useEffect(() => {
    if (!localStorage.getItem("gameStartTime")) {
      localStorage.setItem("gameStartTime", Date.now());
    }
  }, []);

  /** Game statistics */
  const calculateGameTime = useCallback(() => {
    const startTime = localStorage.getItem("gameStartTime");
    if (!startTime) return "00:00";
    const elapsed = Date.now() - parseInt(startTime, 10);
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const getHintsUsed = useCallback(() => localStorage.getItem("hintsUsed") || "0", []);

  const getItemsClicked = useCallback(() => {
    let clicked = JSON.parse(localStorage.getItem("clickedItems") || "[]");
    return clicked.length;
  }, []);

  /** Count unique clicked items */
  const incrementItemClicks = useCallback((id) => {
    const key = "clickedItems";
    const clicked = JSON.parse(localStorage.getItem(key) || "[]");
    if (!clicked.includes(id)) {
      const updated = [...clicked, id];
      localStorage.setItem(key, JSON.stringify(updated));
      localStorage.setItem("itemsClicked", updated.length);
    }
  }, []);

  /** Easter eggs */
  const unlockEasterEgg = useCallback((id) => {
    let eggs = JSON.parse(localStorage.getItem("easterEggs") || "{}");
    if (!eggs[id]) {
      eggs[id] = true;
      localStorage.setItem("easterEggs", JSON.stringify(eggs));
    }
  }, []);

  const getEasterEggsCount = useCallback(() => {
    const eggs = JSON.parse(localStorage.getItem("easterEggs") || "{}");
    return Object.keys(eggs).length;
  }, []);

  /** Load/save game state */
  useEffect(() => {
    const saved = localStorage.getItem("escapeRoomState");
    if (saved) setGameState(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("escapeRoomState", JSON.stringify(gameState));
  }, [gameState]);

  /** Comment (dialog) */
  const showComment = useCallback((text, className = "") => {
    const dialog = document.querySelector("#dialog");
    const div = document.createElement("div");
    div.innerHTML = text;
    if (className) div.className = className;
    dialog.appendChild(div);

    // Heuristic to choose display duration
    const len = text.length;
    let displayTime = 8000;
    if (len > 300) displayTime = 20000;
    else if (len > 120) displayTime = 12000;
    else if (len < 50) displayTime = 5000;

    const closeMessage = () => {
      if (!div.isConnected) return;
      div.style.opacity = "0";
      setTimeout(() => div.remove(), 300);
    };
    setTimeout(closeMessage, displayTime);
  }, []);

  /** One-time init: input & helpers */
  useEffect(() => {
    let cleanupAll = () => {};

    const checkElementsReady = () => {
      const roomWrap = wrapRef.current;
      const room = roomRef.current;
      const roomCanvas = document.getElementById("room");

      if (!roomWrap || !room || !roomCanvas) {
        setTimeout(checkElementsReady, 50);
        return;
      }

      const initKeyboardSupport = () => {
        const onKeyDown = (e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            updateView("left");
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            updateView("right");
          }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
      };

      const initSwipeSupport = () => {
        let touchStartX = null;
        const onTouchStart = (e) => {
          touchStartX = e.changedTouches[0].screenX;
        };
        const onTouchEnd = (e) => {
          if (touchStartX === null) return;
          const touchEndX = e.changedTouches[0].screenX;
          const diffX = touchStartX - touchEndX;
          if (Math.abs(diffX) > 30) diffX > 0 ? updateView("left") : updateView("right");
          touchStartX = null;
        };

        roomWrap.addEventListener("touchstart", onTouchStart, { passive: true });
        roomWrap.addEventListener("touchend", onTouchEnd);

        return () => {
          roomWrap.removeEventListener("touchstart", onTouchStart);
          roomWrap.removeEventListener("touchend", onTouchEnd);
        };
      };

      const initCubes = () => {
        document.querySelectorAll(".cube").forEach((cube) => {
          const faces = ["top", "left", "front", "right", "back", "bottom"];
          faces.forEach((face) => {
            const faceElement = document.createElement("div");
            faceElement.classList.add(`cube-${face}`);
            cube.appendChild(faceElement);
          });
        });
      };

      const initTooltip = () => {
        const tooltip = document.querySelector("#tooltip");
        let rafId = null;

        const onMove = (e) => {
          if (rafId) return;
          rafId = requestAnimationFrame(() => {
            rafId = null;
            const pad = 10;
            let top = e.clientY + pad;
            let left = e.clientX + pad;
            const w = tooltip.offsetWidth;
            const h = tooltip.offsetHeight;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            if (left + w > vw) left = e.clientX - w - pad;
            if (top + h > vh) top = e.clientY - h - pad;
            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
          });
        };

        const onOver = (e) => {
          const el = e.target.closest("[data-comment]");
          if (!el) return;
          tooltip.innerHTML = "";
          const span = document.createElement("span");
          span.textContent = el.getAttribute("data-title") || "";
          span.classList.add("tooltip-content");
          tooltip.appendChild(span);
          tooltip.style.display = "block";
          document.addEventListener("mousemove", onMove, { passive: true });
        };

        const onOut = (e) => {
          if (!e.target.closest("[data-comment]")) return;
          tooltip.innerHTML = "";
          tooltip.style.display = "none";
          document.removeEventListener("mousemove", onMove);
        };

        document.addEventListener("mouseover", onOver);
        document.addEventListener("mouseout", onOut);

        return () => {
          document.removeEventListener("mouseover", onOver);
          document.removeEventListener("mouseout", onOut);
          document.removeEventListener("mousemove", onMove);
        };
      };

      const init = () => {
        requestAnimationFrame(() => updateView());

        const keyboardCleanup  = initKeyboardSupport();
        const swipeCleanup     = initSwipeSupport();
        const tooltipCleanup   = initTooltip();
        // Bind tilt only if NOT reduced motion
        const isTouch =
          "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia?.("(pointer: coarse)")?.matches;

        const unbindMouseTilt = (!isTouch && !prefersReduced) ? bindMouseTilt() : () => {};
        const unbindNavFreeze  = prefersReduced ? () => {} : bindNavFreezeTilt();
        

        initCubes();

        return () => {
          keyboardCleanup && keyboardCleanup();
          swipeCleanup && swipeCleanup();
          tooltipCleanup && tooltipCleanup();
          unbindMouseTilt && unbindMouseTilt();
          unbindNavFreeze && unbindNavFreeze();
        };
      };

      cleanupAll = init();
    };

    checkElementsReady();
    return () => cleanupAll();
  }, [bindMouseTilt, bindNavFreezeTilt, applyTransform, updateView, prefersReduced]);

  return (
    <div
      id="room"
      className={`
        ${lightsOn ? "" : "dark"}
        ${isFlickering ? "lights-glitch" : ""}
      `.trim()}
    >
      <AudioController
        lightsOn={lightsOn}
        playSound={playSound}
        fadeOutAudio={fadeOutAudio}
        isMuted={isMuted}
        stopAllAudio={stopAllAudio}
      />
      <div className="overlay darkness"></div>
      <div className="overlay zoom"></div>
      <div className="ouija-overlay">
        <span className="visually-hidden">Old Ouija board with pointer</span>
      </div>

      <div className="room-wrap" ref={wrapRef}>
        <div className="room" ref={roomRef}>
          <FrontWall
            playSound={playSound}
            showComment={showComment}
            unlockEasterEgg={unlockEasterEgg}
            incrementItemClicks={incrementItemClicks}
          />
          <LeftWall
            playSound={playSound}
            showComment={showComment}
            unlockEasterEgg={unlockEasterEgg}
            incrementItemClicks={incrementItemClicks}
            triggerVibration={triggerVibration}
          />
          <BackWall
            isActive={activeView === 0}
            setLightsOn={(v) => setGameState((p) => ({ ...p, lightsOn: v }))}
            setIsFlickering={setIsFlickering}
            playSound={playSound}
            showComment={showComment}
            incrementItemClicks={incrementItemClicks}
            triggerVibration={triggerVibration}
            setShowLock={setShowLock}
            unlockEasterEgg={unlockEasterEgg}
          />
          <RightWall
            lightsOn={gameState.lightsOn}
            playSound={playSound}
            showComment={showComment}
            incrementItemClicks={incrementItemClicks}
            triggerVibration={triggerVibration}
            unlockEasterEgg={unlockEasterEgg}
          />
          <Ceiling lightsOn={lightsOn} />
          <Floor
            playSound={playSound}
            playSequence={playSequence}
            showComment={showComment}
            incrementItemClicks={incrementItemClicks}
            unlockEasterEgg={unlockEasterEgg}
            triggerVibration={triggerVibration}
          />
          <Cardbox
            playSequence={playSequence}
            showComment={showComment}
            incrementItemClicks={incrementItemClicks}
            triggerVibration={triggerVibration}
          />
          <Table
            playSound={playSound}
            showComment={showComment}
            incrementItemClicks={incrementItemClicks}
            triggerVibration={triggerVibration}
          />
        </div>
      </div>

      <CodeLock
        showLock={showLock}
        setShowLock={setShowLock}
        showComment={showComment}
        playSound={playSound}
        playSequence={playSequence}
        fadeOutAudio={fadeOutAudio}
        getHintsUsed={getHintsUsed}
        getItemsClicked={getItemsClicked}
        getEasterEggsCount={getEasterEggsCount}
        calculateGameTime={calculateGameTime}
        stopAllAudio={stopAllAudio}
      />

      <RoomNavigation
        updateView={updateView}
        showComment={showComment}
        setMuted={setMuted}
        isMuted={isMuted}
        stopAllAudio={stopAllAudio}
      />

      <div id="tooltip"></div>
      <div id="itemCur"></div>
      <div id="dialog" role="status" aria-live="polite"></div>
    </div>
  );
};

export default Room;
