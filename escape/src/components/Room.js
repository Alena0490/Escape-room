import  { useState, useEffect, useRef } from "react";
import "./Room.css";
import { IoClose } from "react-icons/io5";

const Room = () => {
  const wrapRef = useRef(null);
  const roomRef = useRef(null);
  const [rugUp, setRugUp] = useState(false);

  
const showComment = (text, className = "") => {
  const dialog = document.querySelector("#dialog");
  dialog.innerHTML = ""; // vždy smaže starý komentář

  const div = document.createElement("div");
  div.innerHTML = text;
  if (className) div.className = className;

  dialog.appendChild(div);

  setTimeout(() => {
    div.style.opacity = "0";
    setTimeout(() => div.remove(), 500);
  }, 8000); // zmizí po 8s
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

  const initCommentDialogs = () => {
    const commentElements = document.querySelectorAll("[data-comment]");
    const dialog = document.querySelector("#dialog");

    const addComment = (htmlContent, commentClass) => {
        const commentDiv = document.createElement("div");
        commentDiv.innerHTML = htmlContent;
        if (commentClass) commentDiv.className = commentClass;
        commentDiv.style.cursor = "pointer";
        commentDiv.style.transition = "opacity 0.5s ease";

        const fadeOut = (element) => {
        element.style.opacity = "0";
        setTimeout(() => {
            if (element.parentElement) {
            element.parentElement.removeChild(element);
            }
        }, 500);
        };

        commentDiv.addEventListener("click", () => fadeOut(commentDiv));
        dialog.appendChild(commentDiv);
        setTimeout(() => fadeOut(commentDiv), 7000);
    };

    // Každý objekt s data-comment zobrazí text
    commentElements.forEach((el) => {
        el.addEventListener("click", (e) => {
        e.stopPropagation(); // zabrání propagaci
        const text = el.getAttribute("data-comment");
        if (text) addComment(text);
        });
      });
    };


    const initUtilities = () => {
        const switchEl = document.querySelector(".switch");
        const mirrorEl = document.querySelector(".mirror");

        if (switchEl) {
            switchEl.addEventListener("click", () => {
            const isDark = roomCanvas.classList.toggle("dark");
            switchEl.classList.toggle("on"); // vlastní stav vypínače
            
              if (mirrorEl) {
                if (!isDark) {
                  // světla zapnutá
                  mirrorEl.classList.add("lit");
                } else {
                  // světla zhasnutá
                  mirrorEl.classList.remove("lit");
                }
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

       // hint tlačítko
    const hints = [
        "Talk to the old spirits.",
        "Admire the art.",
        "Get the code first.",
        "Don't forget to look into boxes.",
        "You need to search all the stuff.",
        "Play sports.",
        "Read the book.",
        "It's allways better with lights on.",
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
        initItems();      // místo initCommentDialogs
        initUtilities();
    };


    init();
  }, []);

  return (
    <div id="room" className="dark">
      <div className="overlay darkness"></div>
      <div className="overlay zoom"></div>
      <div className="room-wrap" ref={wrapRef}>
        <div className="room" ref={roomRef}>
          <div className="wall wall-front">
            <div
                  className="item painting"
                  data-title="What a nice painting!"
                  data-comment="Who is the guy? I have a feeling like he was missing something."
                ></div>
          </div>
            <div className="wall wall-left">
                <div className="cube shelf">
                  <div className="cube shelf-level level-1">
                    <div class="item skull" data-title="A Shiny Skull" data-comment="Wow,it has full set of teeth!">
                  <div class="item-inner"></div>
                </div>

                <div
                  className="item cassette"
                  data-title="Some olc cassette"
                  data-comment="What we have there? Bryan Addams - Summer of ..."
                >
                  <div className="item item-inner"></div>
                </div>
                <div
                  className="item ball"
                  data-title="A random billiard ball"  
                  data-comment="What number is it?"
                >
                  <div className=" item item-inner"></div>
                </div>
              </div>
              <div className="cube shelf-level level-2">
                <div class="item globe" data-title="An old globe" data-comment="Where is the Czechia?">
                  <div class="item-inner item"></div>
                </div>
                <div
                  className="item phone"
                  data-title="Ancient Technology"
                  data-comment="Maybe it still works? I'll call my mom. 6-0-2 Oh no! My finger got stuck!"
                >
                  <div className="item-inner item"></div>
                </div>
                <div
                  className="item book"
                  data-title="An old book"
                  data-comment="`He gazed up at the enormous face. Forty years it had taken him to learn what kind of smile was hidden beneath the dark moustache. O cruel, needless misunderstanding! O stubborn, self-willed exile from the loving breast! Two gin-scented tears trickled down the sides of his nose. But it was all right, everything was all right, the struggle was finished. He had won the victory over himself. He loved Big Brother.` I know this book!"
                >
                  <div className="item-inner item"></div>
                </div>
              </div>
              <div className="cube shelf-level level-3">
                <div
                  className="item item-cube left-cube"
                  id="hover-not"
                  data-title="An army Medical Kit"
                  data-comment="I hope there is something useful inside. Ouch, My finger! Luckily there is the medical kit in the shelf."
                >
                  <div 
                    className="cube medical-chest item"
                    id="hover-not"></div>
                </div>
                <div
                  className="item item-cube right-cube"
                  id="hover-not"
                  data-title="An army metal box"
                  data-comment="No way I could open this!"
                >
                  <div 
                    className="cube metal-box item"
                    id="hover-not"></div>
                </div>
              </div>
            </div>
          </div>
            <div className="wall wall-back">            
              <div className="flat lock item" data-title="Door lock" data-comment="It says: 'Please, enter the code'">              
              </div>

                <div className="flat door inner"></div>
                <div className="flat door item" data-title="Locked Door" data-comment="Is's locked."></div>
                <div className="flat switch item" data-title="Light Switch" data-comment="Much better."></div>
            </div>
          <div className="wall wall-right">
            <div className="poster item" 
                data-title="Some old poster"
                data-comment="What is the chainsaw commercial doing there?"></div>

                <div className="mirror item" 
                data-title="An old mirror"
                data-comment="How do I look? Eh, hello Mr.Ghost, please don't kill me."></div>
          </div>
          <div className="wall wall-top"></div>
          <div className="wall wall-bottom">
            <div 
            className={`rug flat item ${rugUp ? "rug-up" : ""}`}
            data-title="Some old rug." 
            data-comment="Yuck, It's so dirty. Wait, there is a radio under. There are some scratched letters: 'BIG EAR' Maybe I could try this frequency.WOW! I've got the signal, it's so weird."
            onClick={(e) => { setRugUp(!rugUp); const comment = e.currentTarget.getAttribute("data-comment"); if (comment) showComment(comment);}}></div>
          </div>
          <div className="cube cardbox" 
            data-title="A random box"
            data-comment='There is just a piece of paper. It says: "KEY: book, ball, mirror, cassette, skull, rug"'>
          </div>
          <div
            className="item cube ouija"
            data-title="OUIJA"
            data-comment="To get out of the room you need to solve the riddles. You need to use just one(last) number or letter from each one. But first you need to find the key."
          ></div>
          <div className="cube table" data-title="A weird table"      data-comment="Nice, I really need this to my living room. Wait, what is there?"></div>
        </div>
      </div>

      <form className="code-lock">
        <IoClose className="close" />
        <input 
          type="text"
          inputMode="numeric" 
          pattern="\d*"  
          maxLength="6" 
          className="code-input"
          placeholder="******" />
        <button type="submit" className="code-submit">Confirm</button>
        </form>

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
      <div id="dialog"></div>
    </div>
  );
};

export default Room;
