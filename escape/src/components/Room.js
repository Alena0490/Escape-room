import { useState, useEffect, useRef } from "react";
import "./Room.css";
import CodeLock from "./CodeLock";
import Shelf from "./Shelf";
import Floor from "./Floor.js";
import Ceiling from "./Ceiling.js";
import RoomNavigation from "./RoomNavigation";
import AudioController from "./AudioController";
import useTilt from "../hooks/useTilt.js";
import useSetAudio from "../hooks/useSetAudio.js"
/** Sounds */
import switchSound from "../sounds/light-switch-382712.mp3";
import Ghost from "../sounds/ghost-6979.mp3";
import Mirror from "../sounds/creepy-moan-87456.mp3";
import CardboardBox from "../sounds/cardboard-box-open-182560.mp3";
import Door from "../sounds/door-handle-1-401153.mp3"
import Paper from "../sounds/paper-rustle-81855.mp3"
import Click from "../sounds/mouse-click-290204.mp3"
import JumpScare from "../sounds/075283-quotbehind-youquot-whispe.mp3"

const Room = () => {
  const wrapRef = useRef(null);
  const roomRef = useRef(null);
  const { playSound, playSequence, fadeOutAudio } = useSetAudio();
  const [isFlickering, setIsFlickering] = useState(false);
  const [gameState, setGameState] = useState({
    lightsOn: false,
    doorOpen: false,
  });
  const [showLock, setShowLock] = useState(false);

  const onIndex = useRef(0);
  const offIndex = useRef(0);

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

    roomWrap.classList.remove(...views);
    roomWrap.classList.add(views[viewIndexRef.current]);
    roomWrap.classList.add("rotating");
    setTimeout(() => roomWrap.classList.remove("rotating"), 500);

    document.querySelectorAll(".room .wall").forEach((el) => el.classList.remove("active"));
    document.querySelector(`.wall.${walls[viewIndexRef.current]}`)?.classList.add("active");

    applyTransform();
  };

  /** === SWITCH === */
  // Preload switch sound
  useEffect(() => {
    const a = new Audio(switchSound);
    a.preload = "auto";
    a.load();            //ask borwser for fetch+decode
  }, []);

  const handleSwitchClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation?.();
    const roomCanvas = document.getElementById("room");
    const switchEl = e.currentTarget;
    const mirrorEl = document.querySelector(".mirror");

    playSound(switchSound);

    if (roomCanvas.classList.contains("dark")) {
      // LIGHTS ON
      setTimeout(() => {
        roomCanvas.classList.remove("dark");
        switchEl.classList.add("on");

        setIsFlickering(true);
        setTimeout(() => setIsFlickering(false), 1200);

        if (mirrorEl) mirrorEl.classList.add("lit");
        setGameState(prev => ({ ...prev, lightsOn: true }));

        const onMessages = [
          "Much better.",
          "Finally some light!",
          "Ah, I can see everything clearly now.",
          "Feels safer with the lights on…"
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
        if (mirrorEl) mirrorEl.classList.remove("lit");

        setGameState(prev => ({ ...prev, lightsOn: false }));

        // rotating OFF message
        const offMessages = [
          "Ugh... it's too dark, I can't see a thing.",
          "Creepy... I should turn the lights back on.",
          "Wait, what was that?! Better keep it bright.",
          "Nope, not staying in the dark!"
        ];
        const msg = offMessages[offIndex.current];
        switchEl.setAttribute("data-comment", msg);
        showComment(msg);
        offIndex.current = (offIndex.current + 1) % offMessages.length;
      }, 300);
    }

    // ✅ Global feedback
    incrementItemClicks("light-switch");
    triggerVibration(30);
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
  const incrementItemClicks = (id) => {
    let clicked = JSON.parse(localStorage.getItem("clickedItems") || "[]");

    if (!clicked.includes(id)) {
      clicked.push(id);
      localStorage.setItem("clickedItems", JSON.stringify(clicked));
      localStorage.setItem("itemsClicked", clicked.length); // store number
    }
  };

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
    dialog.innerHTML = "";

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

    // 🔹 Closing message
    const closeMessage = () => {
      div.style.opacity = "0";
      setTimeout(() => div.remove(), 300);
      document.removeEventListener("click", handleOutsideClick);
    };

    // 🔹 Handler after clicing outside  
    const handleOutsideClick = (e) => {
      if (!dialog.contains(e.target)) {
        closeMessage();
      }
    };

    // Add listener on click outside (small delay so that it does not start immediately when clicking on the item)
    setTimeout(() => {
      document.addEventListener("click", handleOutsideClick);
    }, 50);

    // ⏳ Close after the message
    setTimeout(() => {
      closeMessage();
    }, displayTime);
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
        // Mirror crack hover
        const tooltip = document.querySelector("#tooltip");
        document.addEventListener("mousemove", (event) => {
          const tooltipPadding = 10;
          const pageWidth = window.innerWidth;
          const pageHeight = window.innerHeight;
          let top = event.clientY + tooltipPadding;
          let left = event.clientX + tooltipPadding;

          if (left + tooltip.offsetWidth > pageWidth) {
            left = event.clientX - tooltip.offsetWidth - tooltipPadding;
          }
          if (top + tooltip.offsetHeight > pageHeight) {
            top = event.clientY - tooltip.offsetHeight - tooltipPadding;
          }
          tooltip.style.top = `${top}px`;
          tooltip.style.left = `${left}px`;
        });

        document.querySelectorAll("[data-comment]").forEach((el) => {
          el.addEventListener("mouseenter", () => {
            const span = document.createElement("span");
            tooltip.innerHTML = "";
            span.textContent = el.getAttribute("data-title");
            span.classList.add("tooltip-content");
            tooltip.appendChild(span);
            tooltip.style.display = "block";
          });
          el.addEventListener("mouseleave", () => {
            tooltip.innerHTML = "";
            tooltip.style.display = "none";
          });
        });
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
          
          <div className="wall wall-back">            
            <div className="flat lock item" 
              data-title="Door lock" 
              data-comment="It says: 'Please, enter the code'"
              onClick={(e) => {
                e.stopPropagation(); 
                playSound(Click, {fadeIn: 0.2});
                const msg = e.currentTarget.getAttribute("data-comment");
                    if (msg) showComment(msg);
                incrementItemClicks("code-lock");
                setTimeout(() => {
                  setShowLock(true);
                }, 200);  
                triggerVibration(30);
              }}
            ></div>

            <div className="flat door inner">
              <span className="visually-hidden">Numeric lock</span>
            </div>
            
            <div 
              className="flat door item" 
              data-title="Locked Door" 
              data-comment="It's locked."
              onClick={(e) => {
                e.stopPropagation(); 
                incrementItemClicks("door");
                triggerVibration(30);
                if (e.currentTarget.classList.contains("open")) {
                  const msg = "It was a long day... Let's get out of here. Finally, fresh air!";
                  e.currentTarget.setAttribute("data-comment", msg);
                  showComment(msg);
                } else {
                  const msg = "It's locked.";
                  e.currentTarget.setAttribute("data-comment", msg);
                  showComment(msg);
                  playSound(Door, {start: 0.2});
                }
              }}
              >
                <span className="visually-hidden">Heavy metal door</span>
              </div>

              <div 
                className="flat switch item" 
                data-title="Light Switch" 
                data-comment="Much better."
                onClick={handleSwitchClick}
              >
                <span className="visually-hidden">Light switch</span>
              </div>

              <div
                className="item chalk-message"
                data-title="Strange graffiti writing"
                data-comment="Wait, what: `Smile, you're not the first one here`? Is someone watching me?"
                onClick={(e) => {
                  e.stopPropagation(); 
                  incrementItemClicks("graffiti");
                  triggerVibration(30);
                  unlockEasterEgg("chalk1"); // save to LocalStorage
                  const msg = e.currentTarget.getAttribute("data-comment");
                  if (msg) showComment(msg, "easter-egg");
                }}
              >
                <span className="visually-hidden">Graffiti text on the wall</span>
              </div>
          </div>
          
          <div className="wall wall-right">
            <div className="poster item egg"
              data-title="Some old poster" 
              data-comment="What the hell is the chainsaw commercial doing there? Are they sponsoring this freak show or what?"
              onClick={(e) => {
                e.stopPropagation(); 
                unlockEasterEgg("poster"); // save to LocalStorage
                const msg = e.currentTarget.getAttribute("data-comment");
                    if (msg) showComment(msg, "easter-egg");
                incrementItemClicks("poster");
                triggerVibration(30);
              }}
            >
              <span className="visually-hidden">Old faded poster</span>
            </div>

            <div className="mirror item" 
              data-title="An old mirror"
              data-comment="How do I look? Eh, hello, Mr. Ghost, please don't kill me."
              onClick={(e) => {
                e.stopPropagation(); 
                playSound(Mirror);
                incrementItemClicks("mirror");
                const msg = e.currentTarget.getAttribute("data-comment");
                if (msg) showComment(msg);
                triggerVibration(30);
              }}
            >
              <span className="visually-hidden">Old mirror flashing letters Friday 13th</span>
            </div>

             <div
                className="item mirror-crack egg"
                data-title="Crack in the mirror"
                data-comment="What is it? Is there a fu**ing camera inside…?"
                onClick={(e) => {
                  e.stopPropagation(); 
                  unlockEasterEgg("mirror-crack"); // save to LocalStorage
                  const msg = e.currentTarget.getAttribute("data-comment");
                  if (msg) showComment(msg, "easter-egg");
                  incrementItemClicks("mirror-crack");
                  triggerVibration(30);
                }}
              >
                <span className="visually-hidden">Crack in the mirror</span>
              </div>
          </div>
                 
          <Ceiling lightsOn={lightsOn} />
          
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