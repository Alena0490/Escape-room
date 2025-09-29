import { memo, useCallback, useEffect } from "react";
import "./Shelf.css";

// EAGER  – only URL
import Phone from "../sounds/old-rotary-phone-1-296475.mp3";
import Book from "../sounds/flipping-book-101929.mp3";
import FirstAid from "../sounds/old-metal-lunch-box-71223.mp3";
import MetalBox from "../sounds/box-crash-106687.mp3";
import Cassette from "../sounds/cassette-34173.mp3";
import Ball from "../sounds/small-ball-393217.mp3";
import Pickup from "../sounds/item-removed-from-box-140495.mp3";

const Shelf = ({ incrementItemClicks, playSound, triggerVibration, showComment, unlockEasterEgg }) => {
   // PRELOAD: after first user interaction
  useEffect(() => {
    const urls = [Pickup, Cassette, Ball, Phone, Book, FirstAid, MetalBox];

    const warm = () => {
      window.removeEventListener("pointerdown", warm, true);
      try {
        urls.forEach((src) => {
          const a = new Audio();
          a.preload = "auto";
          a.src = src;
          a.load();
        });
      } catch {}
    };

    window.addEventListener("pointerdown", warm, true);
    return () => window.removeEventListener("pointerdown", warm, true);
  }, []);

  const handleItemClick = useCallback(
    (id, sound, comment, options = {}, eggId = null) => {
      if (sound) playSound?.(sound, options);
      incrementItemClicks?.(id);
      if (eggId) unlockEasterEgg?.(eggId);
      if (comment) showComment?.(comment, eggId ? "easter-egg" : "");
      triggerVibration?.(30);
    },
    [playSound, incrementItemClicks, unlockEasterEgg, showComment, triggerVibration]
  );

  const onKeyActivate = useCallback(
    (fn, comment) => (e) => {
      const k = e.key;
      if (k === "Enter" || k === " ") {
        e.preventDefault();
        fn(comment);
      }
    },
    []
  );

  return (
    <div className="cube shelf">
      <div className="cube shelf-level level-1">
        <div
          className="item skull"
          data-title="A Shiny Skull"
          data-comment="Wow, it has full set of teeth!"
          aria-label="Skull"
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation();handleItemClick("skull", Pickup, e.currentTarget.dataset.comment)}}
          onKeyDown={onKeyActivate((c) => handleItemClick("skull", Pickup, c), "Wow, it has full set of teeth!")}
        >
          <div className="item-inner">
            <span className="visually-hidden">A metallic skull</span>
          </div>
        </div>

        <div
          className="item cassette"
          data-title="Some old cassette"
          data-comment="What do we have there? Bryan Adams - Summer of ... Oh no. Stuck forever in my head."
          aria-label="Cassette"
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation();handleItemClick("cassette", Cassette, e.currentTarget.dataset.comment, { duration: 2 })}}
          onKeyDown={onKeyActivate(
            (c) => handleItemClick("cassette", Cassette, c, { duration: 2 }),
            "What do we have there? Bryan Adams - Summer of ... Oh no. Stuck forever in my head."
          )}
        >
          <div className="item item-inner">
            <span className="visually-hidden">Old cassette</span>
          </div>
        </div>

        <div
          className="item ball"
          data-title="A random billiard ball"
          data-comment="What number is this? Does it matter? It's just a ball."
          aria-label="Billiard ball, number 8"
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation();handleItemClick("ball", Ball, e.currentTarget.dataset.comment)}}
          onKeyDown={onKeyActivate((c) => handleItemClick("ball", Ball, c), "What number is this? Does it matter? It's just a ball.")}
        >
          <div className="item item-inner">
            <span className="visually-hidden">Black billiard ball with number 8</span>
          </div>
        </div>
      </div>

      <div className="cube shelf-level level-2">
        <div
          className="item globe egg"
          data-title="An old globe"
          data-comment="Where is Czechia? Europe, right? Damn, I hate geography. Wait, what… is there a mic in the stand?"
          aria-label="Globe"
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation();handleItemClick("globe", Pickup, e.currentTarget.dataset.comment, {}, "globe")}}
          onKeyDown={onKeyActivate((c) => handleItemClick("globe", Pickup, c, {}, "globe"),
            "Where is Czechia? Europe, right? Damn, I hate geography. Wait, what… is there a mic in the stand?")}
        >
          <div className="item-inner item">
            <span className="visually-hidden">An old Globe</span>
          </div>
        </div>

        <div
          className="item phone"
          data-title="Ancient technology"
          data-comment="Maybe it still works? I'll call my mom. 6-0-2 Oh no! My finger got stuck!"
          aria-label="Rotary phone"
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation();handleItemClick("phone", Phone, e.currentTarget.dataset.comment, { duration: 4.2 })}}
          onKeyDown={onKeyActivate((c) => handleItemClick("phone", Phone, c, { duration: 4.2 }),
            "Maybe it still works? I'll call my mom. 6-0-2 Oh no! My finger got stuck!")}
        >
          <div className="item-inner item">
            <span className="visually-hidden">Old rotary phone</span>
          </div>
        </div>

        <div
          className="item book"
          data-title="An old book"
          data-comment="He gazed up at the enormous face. Forty years it had taken him to learn what kind of smile was hidden beneath the dark moustache. O cruel, needless misunderstanding! O stubborn, self-willed exile from the loving breast! Two gin-scented tears trickled down the sides of his nose. But it was all right, everything was all right, the struggle was finished. He had won the victory over himself. He loved Big Brother. I know this book!"
          aria-label="Book"
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation();handleItemClick("book", Book, e.currentTarget.dataset.comment)}}
          onKeyDown={onKeyActivate((c) => handleItemClick("book", Book, c),
            "He gazed up at the enormous face. Forty years it had taken him to learn what kind of smile was hidden beneath the dark moustache. O cruel, needless misunderstanding! O stubborn, self-willed exile from the loving breast! Two gin-scented tears trickled down the sides of his nose. But it was all right, everything was all right, the struggle was finished. He had won the victory over himself. He loved Big Brother. I know this book!")}
        >
          <div className="item-inner item">
            <span className="visually-hidden">Old book</span>
          </div>
        </div>
      </div>

      <div className="cube shelf-level level-3">
        <div
          className="item item-cube left-cube"
          id="hover-not"
          data-title="Army Medical Kit"
          data-comment="I hope there is something useful inside. Ouch, my finger! Thank goodness I have this first aid kit."
          aria-label="Medical kit"
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation();handleItemClick("first-aid", FirstAid, e.currentTarget.dataset.comment, { duration: 6 })}}
          onKeyDown={onKeyActivate((c) => handleItemClick("first-aid", FirstAid, c, { duration: 6 }),
            "I hope there is something useful inside. Ouch, my finger! Thank goodness I have this first aid kit.")}
        >
          <div className="cube medical-chest item" id="hover-not">
            <span className="visually-hidden">Old army medical kit</span>
          </div>
        </div>

        <div
          className="item item-cube right-cube"
          id="hover-not"
          data-title="Heavy metal box"
          data-comment="No way I could open this! The lock looks rusted solid and the whole thing feels like a ton of bricks."
          aria-label="Metal box"
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation();handleItemClick("metal-box", MetalBox, e.currentTarget.dataset.comment)}}
          onKeyDown={onKeyActivate((c) => handleItemClick("metal-box", MetalBox, c),
            "No way I could open this! The lock looks rusted solid and the whole thing feels like a ton of bricks.")}
        >
          <div className="cube metal-box item" id="hover-not">
            <span className="visually-hidden">Dark metal box with black and yellow striped edges</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Shelf);
