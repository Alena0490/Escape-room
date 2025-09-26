import { useState, useEffect, useRef, useCallback } from "react";
import "./Room.css";
import CodeLock from "./CodeLock";
import Shelf from "./Shelf";
import Floor from "./Floor.js";
import Ceiling from "./Ceiling.js";
import BackWall from "./BackWall.js";
import RightWall from "./RightWall.js"
import RoomNavigation from "./RoomNavigation";
import AudioController from "./AudioController";
import useTilt from "../hooks/useTilt.js";
import useSetAudio from "../hooks/useSetAudio.js"
/** Sounds */
import Ghost from "../sounds/ghost-6979.mp3";
import CardboardBox from "../sounds/cardboard-box-open-182560.mp3";
import Paper from "../sounds/paper-rustle-81855.mp3"
import JumpScare from "../sounds/075283-quotbehind-youquot-whispe.mp3"

const Room = () => {
  const wrapRef = useRef(null);
  const roomRef = useRef(null);
  const { playSound, playSequence, fadeOutAudio } = useSetAudio();
  const [isFlickering, setIsFlickering] = useState(false);
  const [activeView, setActiveView] = useState(0); // 0 = back-view
  const [gameState, setGameState] = useState({
    lightsOn: false,
    doorOpen: false,
  });
  const [showLock, setShowLock] = useState(false);

  /** DIALOGS */
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

  /** === VIEW NAVIGATION === */
  const views = ["back-view", "left-view", "front-view", "right-view"];
  const walls = ["wall-back", "wall-left", "wall-front", "wall-right"];
  const rotationYRef = useRef(0);
  const viewIndexRef = useRef(0);
  const {
    applyTransform,       // pitch+yaw
      resetTilt,          // tilt back to 0/0
      bindMouseTilt,      // mousemove/mouseleave
      bindNavFreezeTilt,  // reset when clicking on .room-nav
    } = useTilt({
      roomRef,
      wrapRef,
      rotationYRef,
      maxPitch: 6,
      maxYaw: 3,
    });

  const updateView = (direction) => {
    const roomWrap = wrapRef.current;
    if (!roomWrap || !roomRef.current) return;

    // reset tilt on view change
    resetTilt();

    if (direction === "left") {
      viewIndexRef.current = (viewIndexRef.current + 1) % views.length;
      rotationYRef.current -= 90;
    } else if (direction === "right") {
      viewIndexRef.current = (viewIndexRef.current - 1 + views.length) % views.length;
      rotationYRef.current += 90;
    }

    setActiveView(viewIndexRef.current);

    roomWrap.classList.remove(...views);
    roomWrap.classList.add(views[viewIndexRef.current]);
    roomWrap.classList.add("rotating");
    setTimeout(() => roomWrap.classList.remove("rotating"), 500);

    document.querySelectorAll(".room .wall").forEach((el) => el.classList.remove("active"));
    document.querySelector(`.wall.${walls[viewIndexRef.current]}`)?.classList.add("active");

    applyTransform();
  };
 
 
  // Destructure state for convenience
  const {lightsOn} = gameState;

  /** Vibration feedback for mobile devices */
  const triggerVibration = (duration = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  };

  /** Start time -Save to LocalStorage */
  useEffect(() => {
      if (!localStorage.getItem("gameStartTime")) {
        localStorage.setItem("gameStartTime", Date.now());
      }
  }, []);

  /*** ENDING SCREEN  */
  // Statistics functions
  const calculateGameTime = () => {
    const startTime = localStorage.getItem('gameStartTime');
    if (!startTime) return '00:00';
    
    const elapsed = Date.now() - parseInt(startTime);
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getHintsUsed = () => {
    return localStorage.getItem('hintsUsed') || '0';
  };

  const getItemsClicked = () => {
    let clicked = JSON.parse(localStorage.getItem("clickedItems") || "[]");
    return clicked.length;
  };

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
  const unlockEasterEgg = (id) => {
    let eggs = JSON.parse(localStorage.getItem("easterEggs") || "{}");
    if (!eggs[id]) {
      eggs[id] = true;
      localStorage.setItem("easterEggs", JSON.stringify(eggs));
    }
  };

  const getEasterEggsCount = () => {
    const eggs = JSON.parse(localStorage.getItem("easterEggs") || "{}");
    return Object.keys(eggs).length;
  };

  /** Load game state from localStorage on component mount */
  useEffect(() => {
    const savedState = localStorage.getItem('escapeRoomState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setGameState(parsedState);
      
      // Apply visual states based on saved data
      const roomCanvas = document.getElementById("room");
      const switchEl = document.querySelector(".switch");
      const mirrorEl = document.querySelector(".mirror");
      const doorEl = document.querySelector(".door.item");
      
      if (roomCanvas && switchEl && mirrorEl) {
        if (parsedState.lightsOn) {
          roomCanvas.classList.remove("dark");
          switchEl.classList.add("on");
          mirrorEl.classList.add("lit");
        } else {
          roomCanvas.classList.add("dark");
          switchEl.classList.remove("on");
          mirrorEl.classList.remove("lit");
        }
      }   
      if (doorEl && parsedState.doorOpen) {
        doorEl.classList.add("open");
      }
    }
  }, []);

  /** Save game state to localStorage whenever it changes */
  useEffect(() => {
    localStorage.setItem('escapeRoomState', JSON.stringify(gameState));
  }, [gameState]);
  
  /** Display comment dialog */
  const showComment = (text, className = "") => {
    const dialog = document.querySelector("#dialog");
    const div = document.createElement("div");
    div.innerHTML = text;
    if (className) div.className = className;
    dialog.appendChild(div);

    // 🔹 Display length based on number of characters
    const len = text.length;
    let displayTime = 8000; // default 8s

    if (len > 300) {
      displayTime = 20000;   // extra long
    } else if (len > 120) {
      displayTime = 12000;   // long
    } else if (len < 50) {
      displayTime = 5000;    // short
    }

    // 🔹 Closing message (lokální fade-out + remove)
    const closeMessage = () => {
      if (!div.isConnected) return;
      div.style.opacity = "0";
      setTimeout(() => div.remove(), 300);
    };

    // ⏳ Close after the message
    setTimeout(closeMessage, displayTime);
  };

  useEffect(() => {
    let cleanupAll = () => {};

    // wait then elements are ready
    const checkElementsReady = () => {
      const roomWrap = wrapRef.current;
      const room = roomRef.current;
      const roomCanvas = document.getElementById("room");
      
      if (!roomWrap || !room || !roomCanvas) {
        // try again after 50s
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
          if (Math.abs(diffX) > 30) {
            diffX > 0 ? updateView("left") : updateView("right");
          }
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
            const w = tooltip.offsetWidth, h = tooltip.offsetHeight;
            if (left + w > innerWidth) left = e.clientX - w - pad;
            if (top + h > innerHeight) top = e.clientY - h - pad;
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

        // cleanup – přesně jako dřív vracej funkci
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
        const unbindMouseTilt  = bindMouseTilt();
        const unbindNavFreeze  = bindNavFreezeTilt();
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
        
    // Start the check
    checkElementsReady();
    return () => cleanupAll();   
  }, [bindMouseTilt, bindNavFreezeTilt, applyTransform]);

  return (
    <div id="room" 
  className={`
    ${lightsOn ? "" : "dark"}
    ${isFlickering ? "lights-glitch" : ""}
  `.trim()}
  >
     <AudioController 
        lightsOn={lightsOn}
        playSound={playSound}
        fadeOutAudio={fadeOutAudio}
      />
      <div className="overlay darkness"></div>
      <div className="overlay zoom"></div>
      <div className="ouija-overlay">
          <span className="visually-hidden">Old Ouija boardwith pointer</span>
      </div>
      <div className="room-wrap" ref={wrapRef}>
        <div className="room" ref={roomRef}>
          <div className="wall wall-front">
            <div
              className="item painting egg"
              data-title="What a nice painting!"
              data-comment="Strange… That voice—was it you? Did you just say something about the producers? Go on then. Tell me. I’m all ears."
              onClick={(e) => {
                unlockEasterEgg("painting"); // save to LocalStorage
                incrementItemClicks("painting");
                const msg = e.currentTarget.getAttribute("data-comment");
                if (msg) showComment(msg, "easter-egg");
              }}
              onMouseEnter={() => playSound(JumpScare, { duration: 2.5, volume: 0.7 })} 
            >
                <span className="visually-hidden">A Van Gogh self portrait</span>
            </div>
          </div>
          
          <div className="wall wall-left">
            <div
            className="item lightboard egg"
            id="lightboard"
            data-title="Lightbox sign"
            data-comment="`Behind the Glass`? …Seriously? That crazy reality show? What the hell would a sign like that be doing here?"
             onClick={(e) => {
                  unlockEasterEgg("light-sign"); // save to LocalStorage
                  const msg = e.currentTarget.getAttribute("data-comment");
                  if (msg) showComment(msg, "easter-egg");
                  incrementItemClicks("lightbox-sign");
                  triggerVibration(30);
                }}>
              <span className="visually-hidden">A Lightbox sign laying in the corner</span>
            </div>
            <Shelf
              incrementItemClicks={incrementItemClicks}
              playSound={playSound}
              triggerVibration={triggerVibration}
              showComment={showComment}
              unlockEasterEgg={unlockEasterEgg}
            />
          </div>
          
          <BackWall
            isActive={activeView === 0}
            setLightsOn={(v) => setGameState(p => ({ ...p, lightsOn: v }))}
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
                 
          <Ceiling 
            lightsOn={lightsOn} 
          />
          
          <Floor
            playSound={playSound}
            playSequence={playSequence}
            showComment={showComment}
            incrementItemClicks={incrementItemClicks}
            unlockEasterEgg={unlockEasterEgg}
            triggerVibration={triggerVibration}
          />
          
          <div className="cube cardbox" 
            data-title="A random box"
            data-comment="There is just a piece of paper. It says: 'KEY: book, ball, mirror, cassette, skull, rug'"
            onClick={(e) => {
              e.stopPropagation(); 
              playSequence([
                { src: CardboardBox, options: { duration: 2.5, fadeIn: 0.2 } },
                { src: Paper, options: { volume: 0.5,  start: 0.2 } }
              ]);
              const msg = e.currentTarget.getAttribute("data-comment");
              if (msg) showComment(msg);
              incrementItemClicks("cardbox");
              triggerVibration(30);
            }}
          >
            <span className="visually-hidden">Cardboard box</span>
          </div>
          
          <div 
            className="cube table" 
            data-title="A weird table" 
            data-comment="Nice, I really need this for my living room. Wait, what is there?"
            onClick={(e) => {
              e.stopPropagation(); 
              const msg = e.currentTarget.getAttribute("data-comment");
              if (msg) showComment(msg);
              incrementItemClicks("table");
              triggerVibration(30);
            }}
          >
            <span className="visually-hidden">A wooden table with skull decoration</span>

            <div
              className="item ouija"
              data-title="OUIJA"
              data-comment="Oh, what, the pointer is moving! Creepy... 'T - O - G - E - T out of the room, you need to solve the riddles. You need to use just one last or the only number from each one. But first you need to find the key.' Because why make it easy, right?"
              onClick={(e) => {
                e.stopPropagation(); 
                playSound(Ghost);
                incrementItemClicks("ouija");
                const msg = e.currentTarget.getAttribute("data-comment");
                if (msg) showComment(msg);
                triggerVibration(30);
                // show detail
              const overlay = document.querySelector(".ouija-overlay");
                overlay.classList.add("active");
                setTimeout(() => {
                  overlay.classList.remove("active");
                }, 5500); // ⏳ remove detail
              }}
              >
              <span className="visually-hidden">OUIJA board</span>
            </div>          
          </div>
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
      />
      <RoomNavigation
        updateView={updateView}
        showComment={showComment}
      />
      <div id="tooltip"></div>
      <div id="itemCur"></div>
      <div id="dialog" role="status" aria-live="polite"></div>
    </div>
  );
};

export default Room;