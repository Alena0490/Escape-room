import { useEffect } from "react";
import "./WinScreen.css"

const WinScreen = ({ 
  time, 
  hints, 
  items,
  eggCount, 
  onRestart,
  stopAllAudio
}) => {
  // Stop all background sounds when win screen appears
  useEffect(() => {
    if (stopAllAudio) {
      // Small delay to let win sounds finish first
      const timeoutId = setTimeout(() => {
        stopAllAudio();
      }, 3200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [stopAllAudio]);

  return (
    <section className="win-screen">
      <div id="win" className="win">
        <p className="win-content">Congratulations</p>

        <p className="win-message">
          It was a long day... Let's get out of here. Finally, fresh air!
        </p>

        <div className="win-stats">
          <h3>Statistics:</h3>
          <p>Time: {time}</p>
          <p>Hints Used: {hints}</p>
          <p>Items Searched: {items}</p>
          <p className="bonus">Bonus points: {eggCount} of 7</p>
        </div>

        <button className="win-button" onClick={onRestart}>
          Play again
        </button>
      </div>
    </section>
  );
};

export default WinScreen;