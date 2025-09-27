import "./Cardbox.css"
import CardboardBox from "../sounds/cardboard-box-open-182560.mp3"
import Paper from "../sounds/paper-rustle-81855.mp3"

const Cardbox = ({
    playSequence,
    showComment,
    incrementItemClicks,
    triggerVibration
}) => {

     const handleClick = (e) => {
        e.stopPropagation();
        playSequence?.([
        { src: CardboardBox, options: { duration: 2.5, fadeIn: 0.2 } },
        { src: Paper,        options: { volume: 0.5, start: 0.2 } },
        ]);

        const msg = e.currentTarget.getAttribute("data-comment");
        if (msg) showComment?.(msg);

        incrementItemClicks?.("cardbox");
        triggerVibration?.(30);
    };

    return (
        <div className="cube cardbox" 
            data-title="A random box"
            data-comment="There is just a piece of paper. It says: 'KEY: book, ball, mirror, cassette, skull, rug'"
            onClick={handleClick}
            >
            <span className="visually-hidden">Cardboard box</span>
        </div>
    )
}

export default Cardbox