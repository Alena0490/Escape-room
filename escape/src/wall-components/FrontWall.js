import { useCallback, memo } from "react";
import "./FrontWall.css"
import JumpScare from "../sounds/075283-quotbehind-youquot-whispe.mp3"

/**
 * FrontWall
 * - Painting (easter egg + play sound + comment)
 */

const FrontWall = ({
    unlockEasterEgg,
    incrementItemClicks,
    showComment,
    playSound
}) =>{

    const handlePaintingClick = useCallback(
        (e) => {
        e.stopPropagation();
        unlockEasterEgg("painting");        // save to LocalStorage
        incrementItemClicks("painting");
        const msg = e.currentTarget.getAttribute("data-comment");
        if (msg) showComment(msg, "easter-egg");
        },
        [unlockEasterEgg, incrementItemClicks, showComment]
    );

    // hover sound
    const handlePaintingEnter = useCallback(() => {
        playSound(JumpScare, { duration: 2.5, volume: 0.7 });
    }, [playSound]);
    
    return (
        <div className="wall wall-front">
            <div
                className="item painting egg"
                data-title="What a nice painting!"
                data-comment="Strange… That voice—was it you? Did you just say something about the producers? Go on then. Tell me. I’m all ears."
                onClick={handlePaintingClick}
                onMouseEnter={handlePaintingEnter}
            >
                <span className="visually-hidden">A Van Gogh self portrait</span>
            </div>
        </div>
    )
}

export default memo(FrontWall)
