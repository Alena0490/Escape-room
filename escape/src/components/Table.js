import { memo, useCallback, useEffect } from "react";
import "./Table.css";
import Ghost from "../sounds/ghost-6979.mp3";

const Table = ({
  showComment,
  incrementItemClicks,
  triggerVibration,
  playSound,
}) => {
  // Prewarm Ouija sound after the first user's interaction
  useEffect(() => {
    const warm = () => {
      window.removeEventListener("pointerdown", warm, true);
      try {
        const a = new Audio();
        a.preload = "auto";
        a.src = Ghost;
        a.load();
      } catch {}
    };
    window.addEventListener("pointerdown", warm, true);
    return () => window.removeEventListener("pointerdown", warm, true);
  }, []);

  const handleTableClick = useCallback((e) => {
    e.stopPropagation();
    const msg = e.currentTarget.getAttribute("data-comment");
    if (msg) showComment?.(msg);
    incrementItemClicks?.("table");
    triggerVibration?.(30);
  }, [showComment, incrementItemClicks, triggerVibration]);

  const handleOuijaClick = useCallback((e) => {
    e.stopPropagation();
    playSound?.(Ghost);
    incrementItemClicks?.("ouija");
    const msg = e.currentTarget.getAttribute("data-comment");
    if (msg) showComment?.(msg);
    triggerVibration?.(30);

    const overlay = document.querySelector(".ouija-overlay");
    if (overlay) {
      overlay.classList.add("active");
      setTimeout(() => overlay.classList.remove("active"), 5500);
    }
  }, [playSound, incrementItemClicks, showComment, triggerVibration]);

  const onKeyActivate = useCallback((fn) => (e) => {
    const k = e.key;
    if (k === "Enter" || k === " ") {
      e.preventDefault();
      fn(e);
    }
  }, []);

  return (
    <div
      className="cube table"
      data-title="A weird table"
      data-comment="Nice, I really need this for my living room. Wait, what is there?"
      role="button"
      tabIndex={0}
      onClick={handleTableClick}
      onKeyDown={onKeyActivate(handleTableClick)}
    >
      <span className="visually-hidden">A wooden table with skull decoration</span>

      <div
        className="item ouija"
        data-title="OUIJA"
        data-comment="Oh, what, the pointer is moving! Creepy... 'T - O - G - E - T out of the room, you need to solve the riddles. You need to use just one last or the only number from each one. But first you need to find the key.' Because why make it easy, right?"
        role="button"
        tabIndex={0}
        onClick={handleOuijaClick}
        onKeyDown={onKeyActivate(handleOuijaClick)}
      >
        <span className="visually-hidden">OUIJA board</span>
      </div>
    </div>
  );
};

export default memo(Table);
