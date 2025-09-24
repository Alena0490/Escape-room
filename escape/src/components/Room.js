import { useState, useEffect, useRef, useCallback } from "react";
import "./Room.css";
import CodeLock from "./CodeLock";
import Shelf from "./Shelf";
/** Sounds */
import switchSound from "../sounds/light-switch-382712.mp3";
import Voices from "../sounds/015922-whispers-39schizophrenic3.mp3"
import Ghost from "../sounds/ghost-6979.mp3";
import Alien from "../sounds/alien-underworld-sound-287342.mp3";
import Mirror from "../sounds/creepy-moan-87456.mp3";
import CardboardBox from "../sounds/cardboard-box-open-182560.mp3";
import Door from "../sounds/door-handle-1-401153.mp3"
import Rug from "../sounds/object-dragged-on-carpet-140497.mp3"
import Paper from "../sounds/paper-rustle-81855.mp3"
import Click from "../sounds/mouse-click-290204.mp3"
import JumpScare from "../sounds/075283-quotbehind-youquot-whispe.mp3"
import RadioTune from "../sounds/am-tuning-104200.mp3"
/** Random sounds**/
import EmptyRoom from "../sounds/empty-room-horror-sound-sfx-3339.mp3"
import VoicesShort from "../sounds/schizophrenic-voices-62486.mp3"
import Steps from "../sounds/steps-approaching-in-the-darknes.mp3"

const audioCache = new Map();

const Room = () => {
  const wrapRef = useRef(null);
  const roomRef = useRef(null);
  const [isFlickering, setIsFlickering] = useState(false);
  const [gameState, setGameState] = useState({
    rugUp: false,
    lightsOn: false,
    doorOpen: false,
    isFlickering: false,
  });
  const [showLock, setShowLock] = useState(false);
  const [ghost, setGhost] = useState({ visible: false, top: 0, left: 0 });

  const onIndex = useRef(0);
  const offIndex = useRef(0);

  /** Ghost */
  
useEffect(() => {
  let timeoutId;

  const spawnGhost = () => {
    if (window.gameEnded) return;

    // chance to appear
    const chance = gameState.lightsOn ? 0.2 : 0.6;
    if (Math.random() < chance) {
      const top = Math.floor(Math.random() * 70) + 10;   // 10–80 %
      const left = Math.floor(Math.random() * 70) + 10;  // 10–80 %
      setGhost({ visible: true, top, left });

      // disappears after  ~2 s
      setTimeout(() => setGhost(g => ({ ...g, visible: false })), 2000);
    }

    // new try in 10–30 s
    timeoutId = setTimeout(spawnGhost, Math.random() * 20000 + 10000);
  };

  // first spawn in 5–10 s
  timeoutId = setTimeout(spawnGhost, Math.random() * 5000 + 5000);

  return () => clearTimeout(timeoutId);
}, [gameState.lightsOn]);

  const handleSwitchClick = (e) => {
    console.log("🔍 handleSwitchClick called", e.type, e.target);
      e.preventDefault();
      e.stopPropagation(); // 🛑 stop bubbling to roomWrap
      e.nativeEvent.stopImmediatePropagation?.(); 
    const roomCanvas = document.getElementById("room");
    const switchEl = e.currentTarget;
    const mirrorEl = document.querySelector(".mirror");

    // Always play switch sound first
    playSound(switchSound);

    if (roomCanvas.classList.contains("dark")) {
      // LIGHTS ON
      setTimeout(() => {
        roomCanvas.classList.remove("dark");
        switchEl.classList.add("on");

        // ✨ Flicker effect
        setIsFlickering(true);
        setTimeout(() => setIsFlickering(false), 1200);

        if (mirrorEl) mirrorEl.classList.add("lit");
        setGameState(prev => ({ ...prev, lightsOn: true }));

        // Fade out ambient voices if active
        if (window.roomAmbientAudio) fadeOutAudio(window.roomAmbientAudio, 800);

           // Rotating ON message
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
          // Delay ambient start to avoid conflict with switch sound
          if (!window.roomAmbientAudio) {
            setTimeout(() => {
              window.roomAmbientAudio = new Audio(Voices);
              window.roomAmbientAudio.loop = true;
              window.roomAmbientAudio.volume = 0.3;
              window.roomAmbientAudio.play().catch(() => {});
            }, 400);
          }

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
  const { rugUp, lightsOn} = gameState;
  
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
  /** Stop audio */
  useEffect(() => {
  return () => {
    if (window.roomAmbientAudio) {
      window.roomAmbientAudio.pause();
      window.roomAmbientAudio.currentTime = 0;
      window.roomAmbientAudio = null;
    }
  };
}, []);

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

  /** Sound effects with fade in/out support */
  const playSound = useCallback((src, options = {}) => {
    // Parse options
    const settings = typeof options === "number" 
      ? { duration: options } 
      : options;

    const {
      start = 0,
      duration = null,
      volume = 1,
      fadeIn = 0,
      fadeOut = 0,
    } = settings;

    let audio;
      const cacheKey = src.toString();

      if (audioCache.has(cacheKey)) {
        audio = audioCache.get(cacheKey).cloneNode();
      } else {
        audio = new Audio(src);
        audioCache.set(cacheKey, audio);
      }

    audio.currentTime = start;
    audio.volume = fadeIn > 0 ? 0 : volume;
    
    // Play audio with error handling
    // eslint-disable-next-line no-unused-vars
    const playPromise = audio.play().catch(console.warn);

    let fadeInInterval, fadeOutTimeout;

    // Fade in effect
    if (fadeIn > 0) {
      const steps = Math.ceil(fadeIn * 20);
      const increment = volume / steps;
      const stepTime = fadeIn * 1000 / steps;
      let currentStep = 0;
      
      fadeInInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.min(volume, increment * currentStep);
        if (currentStep >= steps) {
          clearInterval(fadeInInterval);
          audio.volume = volume;
        }
      }, stepTime);
    }

    // Auto stop with fade out
    if (duration) {
      fadeOutTimeout = setTimeout(() => {
        if (fadeOut > 0) {
          const steps = Math.ceil(fadeOut * 20);
          const decrement = audio.volume / steps;
          const stepTime = fadeOut * 1000 / steps;
          let currentVol = audio.volume;
          
          const fadeOutInterval = setInterval(() => {
            currentVol -= decrement;
            audio.volume = Math.max(0, currentVol);
            if (currentVol <= 0) {
              clearInterval(fadeOutInterval);
              audio.pause();
              audio.currentTime = 0;
            }
          }, stepTime);
        } else {
          audio.pause();
          audio.currentTime = 0;
        }
      }, duration * 1000);
    }

    // Cleanup function
    audio.stop = () => {
      clearInterval(fadeInInterval);
      clearTimeout(fadeOutTimeout);
      audio.pause();
      audio.currentTime = 0;
    };
    audioCache.clear();
    return audio;
    
  }, []);

  /** Play sequence of sounds with Promise support */
  const playSequence = async (sounds) => {
    for (const sound of sounds) {
      let src, options;
      
      if (sound.src) {
        src = sound.src;
        options = sound.options;
      } else {
        const soundKey = Object.keys(sound).find(key => key !== 'options');
        src = sound[soundKey];
        options = sound.options;
      }
      
      const audio = playSound(src, options);
    
      // Wait for sound to finish
      await new Promise(resolve => {
        const duration = options?.duration;
        if (duration) {
          setTimeout(resolve, duration * 1000);
        } else {
          audio.onended = resolve;
          setTimeout(resolve, 30000);
        }
      });
    }
  };

  // Random sounds
useEffect(() => {
  const spookySounds = [EmptyRoom, VoicesShort, Steps];

  const playRandomSpooky = () => {
    // Always pick completely random sound, no queue needed
    const randomIndex = Math.floor(Math.random() * spookySounds.length);
    const soundToPlay = spookySounds[randomIndex];
    
    // Set louder volume only for Steps sound
    let volume = 0.3;
    if (soundToPlay === Steps) {
      volume = 0.6;
    }
    
    try {
      playSound(soundToPlay, { volume: volume });
    } catch (error) {
      console.error("❌ Error playing sound:", error);
    }
  };


  const interval = setInterval(() => {
    if (window.gameEnded) return; // check if the game has not been ended
    const randomCheck = Math.random();
    const shouldPlay = lightsOn ? randomCheck < 0.75 : randomCheck < 0.2;

    if (shouldPlay) {
      playRandomSpooky();
    }
  }, 30000);

  return () => {
    clearInterval(interval);
  };
}, [lightsOn, playSound]); // Only necessary dependencies

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


  /** Audio fadeout */
      const fadeOutAudio = (audio, duration = 1000) => {
      const startVolume = audio.volume;
      const fadeStep = startVolume / (duration / 50);
      
      const fadeInterval = setInterval(() => {
        if (audio.volume > fadeStep) {
          audio.volume -= fadeStep;
        } else {
          audio.volume = 0;
          audio.pause();
          audio.currentTime = 0;
          clearInterval(fadeInterval);
          window.roomAmbientAudio = null;
        }
      }, 50);
    };

  useEffect(() => {
    let cleanupAll = () => {};
    let cleanupButtons = null;

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
    // start initization
    const views = ["back-view", "left-view", "front-view", "right-view"];
    const walls = ["wall-back", "wall-left", "wall-front", "wall-right"];
    let currentViewIndex = 0;   // 0 = back-view
    let currentRotationY = 0;

    const updateRoomTransform = (offsetX, offsetY) => {
      // Always read the latest element from the ref (StrictMode can remount)
      const r = roomRef.current;
      if (!r) return;
      r.style.transform = `rotateX(${offsetY}deg) rotateY(${currentRotationY + offsetX}deg)`;
    };

const updateView = (direction) => {
  console.log("🔄 updateView called with direction:", direction);
  console.trace(); // ukáže stack trace
  
   // If direction is not specified, just initialize the view without changing it.
  if (!direction) {
    const roomWrap = wrapRef.current;
    if (roomWrap) {
      roomWrap.classList.remove(...views);
      roomWrap.classList.add(views[currentViewIndex]);
    }
    return; // ENDS FUNCTION
  }
  
  // Re-read current nodes every call to avoid null/stale references
  const roomWrap = wrapRef.current;
  const room = roomRef.current;
  if (!roomWrap || !room) return;
      
      if (direction === "left") {
        currentViewIndex = (currentViewIndex + 1) % views.length;
        currentRotationY -= 90;
      } else if (direction === "right") {
        currentViewIndex = (currentViewIndex - 1 + views.length) % views.length;
        currentRotationY += 90;
      }

      roomWrap.classList.remove(...views);
      roomWrap.classList.add(views[currentViewIndex]);

      roomWrap.classList.add("rotating");
      setTimeout(() => {
        // Get a fresh node in case of remount
        const w = wrapRef.current;
        if (w) w.classList.remove("rotating");
      }, 500);

      document.querySelectorAll(".room .wall").forEach((el) =>
        el.classList.remove("active")
      );
      const activeWall = document.querySelector(`.wall.${walls[currentViewIndex]}`);
      if (activeWall) activeWall.classList.add("active"); // check if the wall is existing

      updateRoomTransform(0, 0);
    };

    const initButtons = () => {
      const leftBtn = document.getElementById("turnLeft");
      const rightBtn = document.getElementById("turnRight");
      const zoomBtn = document.getElementById("zoom");

      leftBtn && leftBtn.addEventListener("click", onLeft);
      rightBtn && rightBtn.addEventListener("click", onRight);
      zoomBtn && zoomBtn.addEventListener("click", onZoom);

      // return cleanup after disconnection
      return () => {
        leftBtn && leftBtn.removeEventListener("click", onLeft);
        rightBtn && rightBtn.removeEventListener("click", onRight);
        zoomBtn && zoomBtn.removeEventListener("click", onZoom);
      };
    };

    const initKeyboardSupport = () => {
      document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") updateView("left");
        else if (e.key === "ArrowRight") updateView("right");
      });
    };

    const initSwipeSupport = () => {
      let touchStartX = null;
      roomWrap.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
      });
      roomWrap.addEventListener("touchend", (e) => {
        if (touchStartX === null) return;
        const touchEndX = e.changedTouches[0].screenX;
        const diffX = touchStartX - touchEndX;
        if (Math.abs(diffX) > 30) {
          diffX > 0 ? updateView("left") : updateView("right");
        }
        touchStartX = null;
      });
    };

    const initMouseMovement = () => {
      roomWrap.addEventListener("mousemove", (e) => {
        const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
        const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;
        const rotateXOffset = parseFloat((xPercent * 15).toFixed(2));
        const rotateYOffset = parseFloat((-yPercent * 15).toFixed(2));
        updateRoomTransform(rotateXOffset, rotateYOffset);
      });
    };

    const initCubes = () => {
      console.log("🔧 initCubes běží");
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
    
    const initItems = () => {
  // ✅ necháme jen hint button
  const hints = [
    "Talk to the old spirits.",
    "Admire the art.",
    "Get the code first.",
    "Don't forget to look into boxes.",
    "You need to search all the stuff.",
    "Play sports.",
    "Read the book.",
    "It's always better with lights on.",
    "Don't be afraid of ghosts.", 
    "Don't forget to check under the rug.",
  ];

  const hintBtn = document.getElementById("hint");
  if (hintBtn) {
    hintBtn.onclick = () => {
      const random = hints[Math.floor(Math.random() * hints.length)];
      showComment(random, "hint");

      // 📝 Save hints used
      const used = parseInt(localStorage.getItem("hintsUsed") || "0", 10);
      localStorage.setItem("hintsUsed", used + 1);
    };
  }
};

    const init = () => {
      requestAnimationFrame(() => updateView());
      cleanupButtons = initButtons();
      initKeyboardSupport();
      initSwipeSupport();
      initMouseMovement();
      initCubes();
      initTooltip();
      initItems();
    };

    // --- listeners with stable refs ---
      const onLeft = () => updateView("left");
      const onRight = () => updateView("right");
      const onZoom = () => {
        const rc = document.getElementById("room");
        if (rc) rc.classList.toggle("zoomed");
      };
      const onKey = (e) => {
        if (e.key === "ArrowLeft") updateView("left");
        else if (e.key === "ArrowRight") updateView("right");
      };
      const onMouseMove = (e) => {
        const w = wrapRef.current;
        const r = roomRef.current;
        if (!w || !r) return;
        const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
        const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;
        const rotateXOffset = parseFloat((xPercent * 15).toFixed(2));
        const rotateYOffset = parseFloat((-yPercent * 15).toFixed(2));
        // use updateRoomTransform
        updateRoomTransform(rotateXOffset, rotateYOffset);
      };
      let touchStartX = null;
      const onTouchStart = (e) => { touchStartX = e.changedTouches[0].screenX; };
      const onTouchEnd = (e) => {
        if (touchStartX === null) return;
        const diffX = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diffX) > 30) (diffX > 0 ? updateView("left") : updateView("right"));
        touchStartX = null;
      };

    document.addEventListener("keydown", onKey);
    roomWrap.addEventListener("mousemove", onMouseMove);
    roomWrap.addEventListener("touchstart", onTouchStart, { passive: true });
    roomWrap.addEventListener("touchend", onTouchEnd);

    cleanupAll = () => {
      document.removeEventListener("keydown", onKey);
      if (roomWrap) {
        roomWrap.removeEventListener("mousemove", onMouseMove);
        roomWrap.removeEventListener("touchstart", onTouchStart);
        roomWrap.removeEventListener("touchend", onTouchEnd);
      }
      cleanupButtons && cleanupButtons();
    };

    init();
      };    
      
      // Start the check
      checkElementsReady();
      return () => cleanupAll();   
  }, [playSound]);

  return (
    <div id="room" 
  className={`
    ${lightsOn ? "" : "dark"}
    ${isFlickering ? "lights-glitch" : ""}
  `.trim()}
>
      <div className="overlay darkness"></div>
      <div className="overlay zoom"></div>
      <div id="win"></div>
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
                 
          <div className="wall wall-top">
            {ghost.visible && (
            <div
              className="shadow-ghost"
              style={{ top: `${ghost.top}%`, left: `${ghost.left}%` }}
            />
          )}
          </div>
          
          <div className="wall wall-bottom">
            <div              
              className={`rug flat item ${rugUp ? "rug-up" : ""}`}
              data-title="Some old rug"              
              data-comment="Yuck, it's so dirty. Wait, there is a radio under. There are some scratched letters: 'BIG EAR'. Maybe I could try this frequency. WOW! I've got the signal, it's so weird."
              onClick={(e) => {
                e.stopPropagation();  
                incrementItemClicks("rug");
                setGameState(prev => ({ ...prev, rugUp: !prev.rugUp }));
                const comment = e.currentTarget.getAttribute("data-comment"); 
                if (comment) showComment(comment);
                
                if (!rugUp) {
                  playSequence([
                    { Rug, options: { duration: 1, fadeIn: 0.2 } },
                    {RadioTune, options: { duration: 4.2, fadeIn: 0.2 }},
                    { Alien, options: { volume: 0.3, start: 2} }
                  ]);
                } else {
                  playSound(Rug, { duration: 0.8, volume: 0.7 });
                }
                triggerVibration(30);
              }}
            >
              <span className="visually-hidden">Dirty fur rug</span>
            </div>

            <div
                className="item contract egg"
                data-title="Some crumpled contract"
                data-comment="A contract with television… Ten thousand euros. Guess I really signed my life away."
                onClick={(e) => {
                  e.stopPropagation(); 
                  playSound(Paper, { volume: 0.5, start: 0.2} )
                  unlockEasterEgg("contract"); // save to LocalStorage
                  const msg = e.currentTarget.getAttribute("data-comment");
                  if (msg) showComment(msg, "easter-egg");
                  incrementItemClicks("contract");
                  triggerVibration(30);
                }}
              >
              <span className="visually-hidden">Crumpled contract lying on the floor</span>
            </div>


          </div>
          
          <div className="cube cardbox" 
            data-title="A random box"
            data-comment="There is just a piece of paper. It says: 'KEY: book, ball, mirror, cassette, skull, rug'"
            onClick={(e) => {
              e.stopPropagation(); 
              playSequence([
                { CardboardBox, options: {duration: 2.5, fadeIn: 0.2 } },
                { Paper, options: { volume: 0.5, start: 0.2} }
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

      <nav className="room-nav">
        <button id="turnLeft" data-title="Turn Left" aria-label="Turn left">
          <i>👈</i>
          <span className="hidden">Turn Left</span>
        </button>
        <button id="turnRight" data-title="Turn Right" aria-label="Turn right">
          <i>👉</i>
          <span className="hidden">Turn Right</span>
        </button>
        <button id="zoom" data-title="Look" aria-label="Zoom">
          <i>🔎</i>
          <span className="hidden">Look</span>
        </button>
        <button id="hint" data-title="Hint!" aria-label="Show hint">
          <i>💡</i>
          <span className="hidden">Hint</span>
        </button>
      </nav>

      <div id="tooltip"></div>
      <div id="itemCur"></div>
      <div id="dialog" role="status" aria-live="polite"></div>
    </div>
  );
};

export default Room;