import { useEffect } from 'react';
/** Random sounds **/
import EmptyRoom from "../sounds/empty-room-horror-sound-sfx-3339.mp3";
import VoicesShort from "../sounds/schizophrenic-voices-62486.mp3";
import Steps from "../sounds/steps-approaching-in-the-darknes.mp3";
import Voices from "../sounds/015922-whispers-39schizophrenic3.mp3";

const AudioController = ({ lightsOn, playSound, fadeOutAudio }) => {
  
  // Random spooky sounds
  useEffect(() => {
    const spookySounds = [EmptyRoom, VoicesShort, Steps];

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

      if (shouldPlay) {
        playRandomSpooky();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [lightsOn, playSound]);

  // Ambient audio management
  useEffect(() => {
    if (!lightsOn && !window.roomAmbientAudio) {
      setTimeout(() => {
        window.roomAmbientAudio = new Audio(Voices);
        window.roomAmbientAudio.loop = true;
        window.roomAmbientAudio.volume = 0.3;
        window.roomAmbientAudio.play().catch(() => {});
      }, 400);
    }
    
    if (lightsOn && window.roomAmbientAudio) {
      fadeOutAudio(window.roomAmbientAudio, 800);
    }
  }, [lightsOn, fadeOutAudio]);

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