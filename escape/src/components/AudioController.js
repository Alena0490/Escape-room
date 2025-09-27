import { useEffect, useState, useMemo, useRef, useCallback } from "react";
/** Random sounds - loaded on demand **/
import EmptyRoom from "../sounds/empty-room-horror-sound-sfx-3339.mp3";
import VoicesShort from "../sounds/schizophrenic-voices-62486.mp3";
import Steps from "../sounds/steps-approaching-in-the-darknes.mp3";
import Voices from "../sounds/015922-whispers-39schizophrenic3.mp3";
import Laugh from "../sounds/evil-laughing-256454.mp3";
import EvilLaugh from "../sounds/evil-laughter-353177.mp3";
import CrazyWoman from "../sounds/female-horror-voice-they-know-no.mp3";
import WomanInsomnia from "../sounds/halloween-horror-voice-insomnia.mp3";
import Lullaby from "../sounds/music-box-lullaby-23919.mp3";

/**
 * AudioController
 * - ambient: hraje ve tmě po tom, co se aspoň jednou rozsvítilo
 * - náhodné spooky zvuky: respektují mute i světlo
 * - isMuted může být boolean nebo funkce vracející boolean
 */
const AudioController = ({ lightsOn, playSound, fadeOutAudio, isMuted, stopAllAudio }) => {
  const [hasBeenLitBefore, setHasBeenLitBefore] = useState(false);

  // === Refs pro stabilní čtení aktuálních stavů (kvůli timeoutům/intervalům) ===
  const ambientRef = useRef(null);
  const lightsRef = useRef(lightsOn);
  const litBeforeRef = useRef(false);
  const mutedRef = useRef(getMuted(isMuted));

  useEffect(() => { lightsRef.current = lightsOn; }, [lightsOn]);
  useEffect(() => { litBeforeRef.current = hasBeenLitBefore; }, [hasBeenLitBefore]);
  useEffect(() => { mutedRef.current = getMuted(isMuted); }, [isMuted]);

  // Pomocná funkce – sjednotí boolean/funkci
  function getMuted(mutedProp) {
    return typeof mutedProp === "function" ? !!mutedProp() : !!mutedProp;
  }

  // Po prvním rozsvícení si zapamatuj
  useEffect(() => {
    if (lightsOn && !hasBeenLitBefore) setHasBeenLitBefore(true);
  }, [lightsOn, hasBeenLitBefore]);

  // === Náhodné spooky zvuky (respektují mute i světlo) ===
  const spookySounds = useMemo(() => [
    EmptyRoom, VoicesShort, Steps, Laugh, EvilLaugh, CrazyWoman, WomanInsomnia, Lullaby
  ], []);

  const playRandomSpooky = useCallback(() => {
    if (mutedRef.current) return;
    const s = spookySounds[Math.floor(Math.random() * spookySounds.length)];
    const volume = s === Steps ? 0.6 : 0.3;
    try { playSound(s, { volume }); } catch (e) { console.error("❌ playRandomSpooky:", e); }
  }, [spookySounds, playSound]);

  useEffect(() => {
    // zruš případný starý interval
    if (window.spookyIntervalId) {
      clearInterval(window.spookyIntervalId);
      window.spookyIntervalId = null;
    }

    window.spookyIntervalId = setInterval(() => {
      if (window.gameEnded) return;
      if (mutedRef.current) return;

      // světlo: když je rozsvíceno, hraj častěji; ve tmě méně
      const randomCheck = Math.random();
      const shouldPlay = lightsRef.current ? randomCheck < 0.75 : randomCheck < 0.2;
      if (shouldPlay) playRandomSpooky();
    }, 30000);

    return () => {
      clearInterval(window.spookyIntervalId);
      window.spookyIntervalId = null;
    };
  }, [playRandomSpooky]);

  // === Ambient logika – jedna efektová „pravda“ ===
  useEffect(() => {
    // 1) Pokud je MUTE → ambient vypnout (když běží) a nic nespouštět
    if (mutedRef.current) {
      if (ambientRef.current) {
        try {
          fadeOutAudio(ambientRef.current, 400);
        } catch {}
        ambientRef.current = null;
        window.roomAmbientAudio = null;
      }
      return;
    }

    // 2) Pokud je SVĚTLO ZAPNUTO → ambient vypnout
    if (lightsRef.current) {
      if (ambientRef.current) {
        const a = ambientRef.current;
        ambientRef.current = null;
        window.roomAmbientAudio = null;
        fadeOutAudio(a, 800);
      }
      return;
    }

    // 3) TMA + už se někdy rozsvítilo → pokud nic nehraje, po krátké prodlevě spusť ambient
    if (!lightsRef.current && litBeforeRef.current && !ambientRef.current) {
      const tid = setTimeout(() => {
        // ochrana proti závodu – zkontroluj aktuální stavy z refů
        if (!mutedRef.current && !lightsRef.current && litBeforeRef.current && !ambientRef.current) {
          const a = playSound(Voices, { volume: 0.3 });
          if (a) {
            a.loop = true;
            ambientRef.current = a;
            window.roomAmbientAudio = a; // volitelně zrcadlit do globálu
          }
        }
      }, 400);
      return () => clearTimeout(tid);
    }
  }, [lightsOn, hasBeenLitBefore, isMuted, playSound, fadeOutAudio]);
  // ↑ Záměrně závislosti na prop hodnotách – refy eliminují „stale closures“ uvnitř timeoutu

  // === Cleanup při unmount ===
  useEffect(() => {
    return () => {
      if (ambientRef.current) {
        try { ambientRef.current.pause(); ambientRef.current.currentTime = 0; } catch {}
        ambientRef.current = null;
      }
      window.roomAmbientAudio = null;

      if (window.spookyIntervalId) {
        clearInterval(window.spookyIntervalId);
        window.spookyIntervalId = null;
      }
    };
  }, []);

  return null;
};

export default AudioController;
