import { useState, useEffect, useRef } from "react";
import "./Room.css";
import CodeLock from "./CodeLock";
/** Sounds */
import switchSound from "../sounds/light-switch-382712.mp3";
import Voices from "../sounds/015922_whispers-39schizophrenic39-or-ghost-like-voices-56253.mp3"
import Ghost from "../sounds/ghost-6979.mp3";
import Phone from "../sounds/old-rotary-phone-1-296475.mp3";
import Alien from "../sounds/alien-underworld-sound-287342.mp3";
import Mirror from "../sounds/creepy-moan-87456.mp3";
import Book from "../sounds/flipping-book-101929.mp3";
import FirstAid from "../sounds/old-metal-lunch-box-71223.mp3";
import MetalBox from "../sounds/box-crash-106687.mp3";
import CardboardBox from "../sounds/cardboard-box-open-182560.mp3";
import Cassette from "../sounds/cassette-34173.mp3"
import Ball from "../sounds/small-ball-393217.mp3"
import Pickup from "../sounds/item-removed-from-box-140495.mp3"
import Door from "../sounds/door-handle-1-401153.mp3"
import Rug from "../sounds/object-dragged-on-carpet-140497.mp3"
import Paper from "../sounds/paper-rustle-81855.mp3"
import Click from "../sounds/mouse-click-290204.mp3"

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
  
  

  // Destructure state for convenience
  const { rugUp, lightsOn} = gameState;

  /** Vibration feedback for mobile devices */
  const triggerVibration = (duration = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
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
  const playSound = (src, options = {}) => {
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

    const audio = new Audio(src);
    audio.currentTime = start;
    audio.volume = fadeIn > 0 ? 0 : volume;
    
    // Play audio with error handling
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

    return audio;
  };

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

  /** Display comment dialog */
  const showComment = (text, className = "") => {
    const dialog = document.querySelector("#dialog");
    dialog.innerHTML = "";

    const div = document.createElement("div");
    div.innerHTML = text;
    if (className) div.className = className;

    dialog.appendChild(div);

    setTimeout(() => {
      div.style.opacity = "0";
      setTimeout(() => div.remove(), 500);
    }, 8000);
  };

  useEffect(() => {
    const roomWrap = wrapRef.current;
    const room = roomRef.current;
    const roomCanvas = document.getElementById("room");

    const views = ["back-view", "left-view", "front-view", "right-view"];
    const walls = ["wall-back", "wall-left", "wall-front", "wall-right"];
    let currentViewIndex = 1;
    let currentRotationY = -90;

    const updateRoomTransform = (offsetX, offsetY) => {
      if (!room) return;
      room.style.transform = `rotateX(${offsetY}deg) rotateY(${currentRotationY + offsetX}deg)`;
    };

    const updateView = (direction) => {
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
      setTimeout(() => roomWrap.classList.remove("rotating"), 500);

      document.querySelectorAll(".room div").forEach((wall) =>
        wall.classList.remove("active")
      );
      document
        .querySelector(`.${walls[currentViewIndex]}`)
        ?.classList.add("active");

      updateRoomTransform(0, 0);
    };

    const initButtons = () => {
      document
        .getElementById("turnLeft")
        .addEventListener("click", () => updateView("left"));
      document
        .getElementById("turnRight")
        .addEventListener("click", () => updateView("right"));
      document
        .getElementById("zoom")
        .addEventListener("click", () =>
          roomCanvas.classList.toggle("zoomed")
        );
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

    const initUtilities = () => {
      const switchEl = document.querySelector(".switch");
      const mirrorEl = document.querySelector(".mirror");
      const roomCanvas = document.getElementById("room");

      const onMessages = [
        "Much better.",
        "Finally some light!",
        "Ah, I can see everything clearly now.",
        "Feels safer with the lights on…"
      ];

      const offMessages = [
        "Ugh... it's too dark, I can't see a thing.",
        "Creepy... I should turn the lights back on.",
        "Wait, what was that?! Better keep it bright.",
        "Nope, not staying in the dark!"
      ];

      let onIndex = 0;
      let offIndex = 0;

      if (switchEl) {
        switchEl.addEventListener("click", () => {
          const isDark = roomCanvas.classList.contains("dark");
          
          playSound(switchSound);
          
          if (isDark) {
          setTimeout(() => {
            roomCanvas.classList.remove("dark");
            switchEl.classList.add("on");

            // ✨ Přidáme flicker efekt
                setIsFlickering(true);
                setTimeout(() => {
                  setIsFlickering(false);
                }, 800)

            if (mirrorEl) mirrorEl.classList.add("lit");
            setGameState(prev => ({ ...prev, lightsOn: true }));

            if (window.roomAmbientAudio) fadeOutAudio(window.roomAmbientAudio, 800);
            
            const msg = onMessages[onIndex];
            switchEl.setAttribute("data-comment", msg);
            showComment(msg);
            onIndex = (onIndex + 1) % onMessages.length;
          }, 300);
         
          } else {
            setTimeout(() => {
              roomCanvas.classList.add("dark");
              switchEl.classList.remove("on");
              if (mirrorEl) mirrorEl.classList.remove("lit");
              
              setGameState(prev => ({ ...prev, lightsOn: false }));
              
              if (!window.roomAmbientAudio) {
                window.roomAmbientAudio = new Audio(Voices);
                window.roomAmbientAudio.loop = true;
                window.roomAmbientAudio.volume = 0.3;
                window.roomAmbientAudio.play().catch(() => {});
              }
              
              const msg = offMessages[offIndex];
              switchEl.setAttribute("data-comment", msg);
              showComment(msg);
              offIndex = (offIndex + 1) % offMessages.length;
            }, 300);
          }
        });
      }
    };

    const initItems = () => {
      const roomItems = document.querySelectorAll("#room [data-comment]");

      roomItems.forEach((item) => {
        item.onclick = () => {
          const comment = item.getAttribute("data-comment");
          if (comment) {
            showComment(comment);
          }
        };
      });

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
        };
      }
    };

    const init = () => {
      updateView();
      initButtons();
      initKeyboardSupport();
      initSwipeSupport();
      initMouseMovement();
      initCubes();
      initTooltip();
      initItems();
      initUtilities();
    };

    init();
  }, []);

  return (
    <div id="room" 
  className={`
    ${lightsOn ? "" : "dark"}
    ${isFlickering ? "lights-glitch" : ""}
  `.trim()}
>
      <div className="overlay darkness"></div>
      <div className="overlay zoom"></div>
      <div className="room-wrap" ref={wrapRef}>
        <div className="room" ref={roomRef}>
          <div className="wall wall-front">
            <div
              className="item painting"
              data-title="What a nice painting!"
              data-comment="Who is this guy? I have a funny feeling that there's something missing about him."
            ></div>
          </div>
          
          <div className="wall wall-left">
            <div className="cube shelf">
              <div className="cube shelf-level level-1">
                <div 
                  className="item skull" 
                  data-title="A Shiny Skull" 
                  data-comment="Wow, it has full set of teeth!"
                  onClick={(e) => {
                    playSound(Pickup);
                    triggerVibration(30);
                    const msg = e.currentTarget.getAttribute("data-comment");
                    if (msg) showComment(msg);
                  }}
                >
                  <div className="item-inner"></div>
                </div>

                <div
                  className="item cassette"
                  data-title="Some old cassette"
                  data-comment="What do we have there? Bryan Adams - Summer of ... Oh no. Stuck forever in my head."
                  onClick={(e) => {
                    playSound(Cassette, {duration: 2});
                    const msg = e.currentTarget.getAttribute("data-comment");
                    if (msg) showComment(msg);
                    triggerVibration(30);
                  }}
                >
                  <div className="item item-inner"></div>
                </div>
                
                <div
                  className="item ball"
                  data-title="A random billiard ball"  
                  data-comment="What number is this? Does it matter? It's just a ball."
                  onClick={(e) => {
                    playSound(Ball);
                    const msg = e.currentTarget.getAttribute("data-comment");
                    if (msg) showComment(msg);
                    triggerVibration(30);
                  }}
                >
                  <div className="item item-inner"></div>
                </div>
              </div>
              
              <div className="cube shelf-level level-2">
                <div 
                  className="item globe" 
                  data-title="An old globe" 
                  data-comment="Where is Czechia? Europe, right? Damn, I hate geography."
                  onClick={(e) => {
                    playSound(Pickup);
                    const msg = e.currentTarget.getAttribute("data-comment");
                    if (msg) showComment(msg);
                    triggerVibration(30);
                  }}
                >
                  <div className="item-inner item"></div>
                </div>
                
                <div
                  className="item phone"
                  data-title="Ancient Technology"
                  data-comment="Maybe it still works? I'll call my mom. 6-0-2 Oh no! My finger got stuck!"
                  onClick={(e) => {
                    playSound(Phone, {duration: 4.2});
                    const msg = e.currentTarget.getAttribute("data-comment");
                    if (msg) showComment(msg);
                    triggerVibration(30);
                  }}
                >
                  <div className="item-inner item"></div>
                </div>
                
                <div
                  className="item book"
                  data-title="An old book"
                  data-comment="He gazed up at the enormous face. Forty years it had taken him to learn what kind of smile was hidden beneath the dark moustache. O cruel, needless misunderstanding! O stubborn, self-willed exile from the loving breast! Two gin-scented tears trickled down the sides of his nose. But it was all right, everything was all right, the struggle was finished. He had won the victory over himself. He loved Big Brother. I know this book!"
                  onClick={(e) => {
                    playSound(Book);
                    const msg = e.currentTarget.getAttribute("data-comment");
                    if (msg) showComment(msg);
                    triggerVibration(30);
                  }}
                >
                  <div className="item-inner item"></div>
                </div>
              </div>
              
              <div className="cube shelf-level level-3">
                <div
                  className="item item-cube left-cube"
                  id="hover-not"
                  data-title="An army Medical Kit"
                  data-comment="I hope there is something useful inside. Ouch, my finger! Thank goodness I have this first aid kit."
                  onClick={(e) => {
                    playSound(FirstAid, {duration: 6});
                    const msg = e.currentTarget.getAttribute("data-comment");
                    if (msg) showComment(msg);
                    triggerVibration(30);
                  }}
                >
                  <div className="cube medical-chest item" id="hover-not"></div>
                </div>
                
                <div
                  className="item item-cube right-cube"
                  id="hover-not"
                  data-title="An army metal box"
                  onClick={(e) => {
                    playSound(MetalBox);
                    const msg = e.currentTarget.getAttribute("data-comment");
                    if (msg) showComment(msg);
                    triggerVibration(30);
                  }}
                >
                  <div className="cube metal-box item" id="hover-not"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="wall wall-back">            
            <div className="flat lock item" 
              data-title="Door lock" 
              data-comment="It says: 'Please, enter the code'"
              onClick={(e) => {
                playSound(Click, {fadeIn: 0.2});
                setTimeout(() => {
                  setShowLock(true);
                }, 200);  
                triggerVibration(30);
              }}
            ></div>

            <div className="flat door inner"></div>
            
            <div 
              className="flat door item" 
              data-title="Locked Door" 
              data-comment="It's locked."
              onClick={(e) => {
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
            ></div>

            <div className="flat switch item" data-title="Light Switch" data-comment="Much better."></div>
          </div>
          
          <div className="wall wall-right">
            <div className="poster item" 
              data-title="Some old poster"
              data-comment="What is the chainsaw commercial doing there?"
            ></div>

            <div className="mirror item" 
              data-title="An old mirror"
              data-comment="How do I look? Eh, hello, Mr. Ghost, please don't kill me."
              onClick={(e) => {
                playSound(Mirror);
                const msg = e.currentTarget.getAttribute("data-comment");
                if (msg) showComment(msg);
                triggerVibration(30);
              }}
            ></div>
          </div>
          
          <div className="wall wall-top"></div>
          
          <div className="wall wall-bottom">
            <div              
              className={`rug flat item ${rugUp ? "rug-up" : ""}`}
              data-title="Some old rug"              
              data-comment="Yuck, it's so dirty. Wait, there is a radio under. There are some scratched letters: 'BIG EAR'. Maybe I could try this frequency. WOW! I've got the signal, it's so weird."
              onClick={(e) => { 
                setGameState(prev => ({ ...prev, rugUp: !prev.rugUp }));
                const comment = e.currentTarget.getAttribute("data-comment"); 
                if (comment) showComment(comment);
                
                if (!rugUp) {
                  playSequence([
                    { Rug, options: { duration: 1, fadeIn: 0.2 } },
                    { Alien, options: { volume: 0.5, start: 1.2} }
                  ]);
                } else {
                  playSound(Rug, { duration: 0.8, volume: 0.7 });
                }
                triggerVibration(30);
              }}
            ></div>
          </div>
          
          <div className="cube cardbox" 
            data-title="A random box"
            data-comment="There is just a piece of paper. It says: 'KEY: book, ball, mirror, cassette, skull, rug'"
            onClick={(e) => {
              playSequence([
                { CardboardBox, options: {duration: 2.5, fadeIn: 0.2 } },
                { Paper, options: { volume: 0.5, start: 0.2} }
              ]);
              const msg = e.currentTarget.getAttribute("data-comment");
              if (msg) showComment(msg);
              triggerVibration(30);
            }}
          ></div>
          
          <div
            className="item cube ouija"
            data-title="OUIJA"
            data-comment="Oh, what, the pointer is moving! Creepy... 'T - O - G - E - T out of the room, you need to solve the riddles. You need to use just one last or the only number from each one. But first you need to find the key.' Because why make it easy, right?"
            onClick={(e) => {
              playSound(Ghost);
              const msg = e.currentTarget.getAttribute("data-comment");
              if (msg) showComment(msg);
              triggerVibration(30);
            }}
          ></div>
          
          <div className="cube table" data-title="A weird table" data-comment="Nice, I really need this for my living room. Wait, what is there?"></div>
        </div>
      </div>

      <CodeLock
        showLock={showLock}
        setShowLock={setShowLock}
        showComment={showComment}
        playSound={playSound}
        playSequence={playSequence}
      />

      <nav className="room-nav">
        <button id="turnLeft" data-title="Turn Left">
          <i>👈</i>
          <span className="hidden">Turn Left</span>
        </button>
        <button id="turnRight" data-title="Turn Right">
          <i>👉</i>
          <span className="hidden">Turn Right</span>
        </button>
        <button id="zoom" data-title="Look">
          <i>🔎</i>
          <span className="hidden">Look</span>
        </button>
        <button id="hint" data-title="Hint!">
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