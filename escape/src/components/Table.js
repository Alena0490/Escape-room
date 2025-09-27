import "./Table.css"
import Ghost from "../sounds/ghost-6979.mp3"

const Table = ({
    showComment,
    incrementItemClicks,
    triggerVibration,
    playSound
}) => {

     const handleTableClick = (e) => {
    e.stopPropagation();
    const msg = e.currentTarget.getAttribute("data-comment");
    if (msg) showComment?.(msg);
    incrementItemClicks?.("table");
    triggerVibration?.(30);
  };

  const handleOuijaClick = (e) => {
    e.stopPropagation();
    playSound?.(Ghost);
    incrementItemClicks?.("ouija");
    const msg = e.currentTarget.getAttribute("data-comment");
    if (msg) showComment?.(msg);
    triggerVibration?.(30);

    // detail overlay
    const overlay = document.querySelector(".ouija-overlay");
    if (overlay) {
      overlay.classList.add("active");
      setTimeout(() => {
        overlay.classList.remove("active");
      }, 5500); // remove detail
    }
  };

    return (
        <div 
            className="cube table" 
            data-title="A weird table" 
            data-comment="Nice, I really need this for my living room. Wait, what is there?"
             onClick={handleTableClick}
            >
            <span className="visually-hidden">A wooden table with skull decoration</span>

            <div
                className="item ouija"
                data-title="OUIJA"
                data-comment="Oh, what, the pointer is moving! Creepy... 'T - O - G - E - T out of the room, you need to solve the riddles. You need to use just one last or the only number from each one. But first you need to find the key.' Because why make it easy, right?"
                 onClick={handleOuijaClick}
            >
                <span className="visually-hidden">OUIJA board</span>
            </div>          
            </div>
    )
}

export default Table