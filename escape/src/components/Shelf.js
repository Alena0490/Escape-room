import React, { useEffect, useRef } from "react";
import "./Shelf.css"

const Shelf = ({ onItemClick, onTooltip, onTooltipHide }) => {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Find all cube elements that need faces
    const cubes = root.querySelectorAll(".cube");
    cubes.forEach((cube) => {
      if (cube.dataset.facesReady === "1") return;
      
      ["top", "left", "front", "right", "back", "bottom"].forEach((face) => {
        const hasDirectFace = Array.from(cube.children)
          .some(ch => ch.classList.contains(`cube-${face}`));
        if (!hasDirectFace) {
          const el = document.createElement("div");
          el.className = `cube-${face}`;
          cube.appendChild(el);
        }
      });

      cube.dataset.facesReady = "1";
    });
  }, []);

  return (
    <article className="bookshelf" ref={rootRef}>
      <div className="cube shelf">
        <div className="cube shelf-level level-1">
          <div className="item gift" data-title="A Little Gift" data-item="gift" data-comment="What's inside?">
            <div className="item-inner" />
          </div>
          <div className="item vhs" data-title="Strange Black Tape" data-item="tape" data-comment="It's not very sticky.">
            <div className="item-inner" />
          </div>
          <div className="item mod" data-title="Valuable Mod Chip" data-item="chip" data-comment="Upgraded!">
            <div className="item-inner" />
          </div>
        </div>

        <div className="cube shelf-level level-2">
          <div className="item milk" data-title="Spoiled Milk" data-item="milk" data-comment="Lunch.">
            <div className="item-inner" />
          </div>
          <div className="item scraps" data-title="Ancient Technology" data-item="scraps" data-comment="Game Saved!">
            <div className="item-inner" />
          </div>
          <div className="item book" data-title="Some old book" data-item="book" data-comment="Maybe it's edible?">
            <div className="item-inner" />
          </div>
        </div>

        <div className="cube shelf-level level-3">
          <div className="item item-cube left-cube" data-title="Minecraft!" data-comment="<q class='green'>Creeper? Aw man!</q>">
            <div className="cube minecraft" />
          </div>
          <div className="item item-cube right-cube" data-title="Cobblestone (64x)" data-comment="No way I could fit that much stone in my inventory!">
            <div className="cube cobblestone" />
          </div>
        </div>
      </div>
    </article>
  );
};

export default Shelf;