import { useEffect, useState } from 'react';
/** Random sounds **/
import EmptyRoom from "../sounds/empty-room-horror-sound-sfx-3339.mp3";
import VoicesShort from "../sounds/schizophrenic-voices-62486.mp3";
import Steps from "../sounds/steps-approaching-in-the-darknes.mp3";
import Voices from "../sounds/015922-whispers-39schizophrenic3.mp3";
import Laugh from "../sounds/evil-laughing-256454.mp3"

const AudioController = ({ lightsOn, playSound, fadeOutAudio }) => {
  const [hasBeenLitBefore, setHasBeenLitBefore] = useState(false);
  
  // Random spooky sounds
  useEffect(() => {
    const spookySounds = [EmptyRoom, VoicesShort, Steps, Laugh];

    const playRandomSpooky = () => {
      const randomIndex = Math.floor(Math.random() * spookySounds.length);
      const soundToPlay = spookySounds[randomIndex];
      
      let volume = 0.3;
      if (soundToPlay === Steps) {
        volume = 0.6;
      }
      
      try {
        playSound(soundToPlay, { volume: volume });
      } catch (error) {
        console.error("❌ Error playing sound:", error);
      }
    };

    const interval = setInterval(() => {
      if (window.gameEnded) return;
      const randomCheck = Math.random();
      const shouldPlay = lightsOn ? randomCheck < 0.75 : randomCheck < 0.2;
      console.log(`Lights: ${lightsOn}, Random: ${randomCheck}, Should play: ${shouldPlay}`);

      if (shouldPlay) {
        playRandomSpooky();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [lightsOn, playSound]);

  // Ambient audio management
// Track when lights have been turned on for the first time
useEffect(() => {
  if (lightsOn && !hasBeenLitBefore) {
    setHasBeenLitBefore(true);
  }
}, [lightsOn, hasBeenLitBefore]);

// Ambient audio management
useEffect(() => {
    if (!lightsOn && hasBeenLitBefore) {
      if (!window.roomAmbientAudio) {
        setTimeout(() => {
          // Použijte playSound místo new Audio()
          window.roomAmbientAudio = playSound(Voices, { 
            volume: 0.3,
            // duration: null pro nekonečné přehrávání
          });
          window.roomAmbientAudio.loop = true;
        }, 400);
      }
    } else if (lightsOn && window.roomAmbientAudio) {
      fadeOutAudio(window.roomAmbientAudio, 800);
      window.roomAmbientAudio = null; // Přidejte reset
    }
  }, [lightsOn, hasBeenLitBefore, fadeOutAudio, playSound]);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.roomAmbientAudio) {
        window.roomAmbientAudio.pause();
        window.roomAmbientAudio.currentTime = 0;
        window.roomAmbientAudio = null;
      }
    };
  }, []);

  return null; // The component is used only for game logic
};

export default AudioController;