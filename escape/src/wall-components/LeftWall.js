import { useCallback, memo } from "react"
import "./LeftWall.css"
import Shelf from "../components/Shelf"

/**
 * LeftWall
 * - Lightbox sign (easter egg + comment)
 * - Shelf (sounds + eggs + comments)
 */

const LeftWall = ({
    unlockEasterEgg,
    showComment,
    incrementItemClicks,
    triggerVibration,
    playSound
}) => {
    const onLightboardClick = useCallback((e) => {
        e.stopPropagation();
        unlockEasterEgg("light-sign");               // save to LocalStorage
        const msg = e.currentTarget.getAttribute("data-comment");
        if (msg) showComment(msg, "easter-egg");
        incrementItemClicks("lightbox-sign");
        triggerVibration(30);
    }, [unlockEasterEgg, showComment, incrementItemClicks, triggerVibration]);
    
    return (
        <div className="wall wall-left">
            <div
                className="item lightboard egg"
                id="lightboard"
                data-title="Lightbox sign"
                data-comment="`Behind the Glass`? …Seriously? That crazy reality show? What the hell would a sign like that be doing here?"
                onClick={onLightboardClick}>
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
    )
}

export default memo(LeftWall);