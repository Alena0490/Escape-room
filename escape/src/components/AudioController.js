import { useEffect, useState, useCallback, useMemo } from 'react';
/** Random sounds **/
import EmptyRoom from "../sounds/empty-room-horror-sound-sfx-3339.mp3";
import VoicesShort from "../sounds/schizophrenic-voices-62486.mp3";
import Steps from "../sounds/steps-approaching-in-the-darknes.mp3";
import Voices from "../sounds/015922-whispers-39schizophrenic3.mp3";
import Laugh from "../sounds/evil-laughing-256454.mp3";
import EvilLaugh from "../sounds/evil-laughter-353177.mp3";
import CrazyWoman from "../sounds/female-horror-voice-they-know-no.mp3";
import WomanInsomnia from "../sounds/halloween-horror-voice-insomnia.mp3";
import Lullaby from "../sounds/music-box-lullaby-23919.mp3";

const AudioController = ({ lightsOn, playSound, fadeOutAudio, isMuted, stopAllAudio }) => {
  const [hasBeenLitBefore, setHasBeenLitBefore] = useState(false);

  // Spooky sounds configuration - useMemo for stable reference
  const spookySounds = useMemo(() => [
    EmptyRoom, VoicesShort, Steps, Laugh, EvilLaugh, CrazyWoman, WomanInsomnia, Lullaby
  ], []);

  const playRandomSpooky = useCallback(() => {
    if (isMuted()) return; // Respektuj mute stav
    
    const randomIndex = Math.floor(Math.random() * spookySounds.length);
    const soundToPlay = spookySounds[randomIndex];

    let volume = 0.3;
    if (soundToPlay === Steps) {
      volume = 0.6;
    }

    try {
      playSound(soundToPlay, { volume });
    } catch (error) {
      console.error("❌ Error playing sound:", error);
    }
  }, [spookySounds, playSound, isMuted]);

  // Random spooky sounds interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (window.gameEnded || isMuted()) return;
      
      const randomCheck = Math.random();
      const shouldPlay = lightsOn ? randomCheck < 0.75 : randomCheck < 0.2;
      
      if (shouldPlay) {
        playRandomSpooky();
      }
    }, 30000);

    // Uložit ID do window pro možnost zastavení
    window.spookyIntervalId = intervalId;

    return () => {
      clearInterval(intervalId);
      if (window.spookyIntervalId === intervalId) {
        window.spookyIntervalId = null;
      }
    };
  }, [lightsOn, playRandomSpooky, isMuted]);

  // Track when lights have been turned on before
  useEffect(() => {
    if (lightsOn && !hasBeenLitBefore) {
      setHasBeenLitBefore(true);
    }
  }, [lightsOn, hasBeenLitBefore]);

  // Ambient audio management when lights are off
  useEffect(() => {
    if (!lightsOn && hasBeenLitBefore && !isMuted()) {
      // Start ambient sound po krátké pauze
      if (!window.roomAmbientAudio) {
        const timeoutId = setTimeout(() => {
          if (!isMuted()) { // Double check před spuštěním
            const ambient = playSound(Voices, { volume: 0.3 });
            if (ambient) {
              ambient.loop = true;
              window.roomAmbientAudio = ambient;
            }
          }
        }, 400);

        return () => clearTimeout(timeoutId);
      }
    } else if (lightsOn && window.roomAmbientAudio) {
      // Fade out ambient when lights turn on
      fadeOutAudio(window.roomAmbientAudio, 800);
      window.roomAmbientAudio = null;
    }
  }, [lightsOn, hasBeenLitBefore, fadeOutAudio, playSound, isMuted]);

  // Restart ambient sound when unmuting (if appropriate conditions)
  useEffect(() => {
    if (!isMuted() && !lightsOn && hasBeenLitBefore && !window.roomAmbientAudio) {
      const timeoutId = setTimeout(() => {
        if (!isMuted() && !lightsOn) { // Double check
          const ambient = playSound(Voices, { volume: 0.3 });
          if (ambient) {
            ambient.loop = true;
            window.roomAmbientAudio = ambient;
          }
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isMuted, lightsOn, hasBeenLitBefore, playSound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.roomAmbientAudio) {
        window.roomAmbientAudio.pause();
        window.roomAmbientAudio.currentTime = 0;
        window.roomAmbientAudio = null;
      }
      if (window.spookyIntervalId) {
        clearInterval(window.spookyIntervalId);
        window.spookyIntervalId = null;
      }
    };
  }, []);

  return null;
};

export default AudioController;