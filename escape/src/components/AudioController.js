import { useEffect, useState, useMemo, useRef, useCallback, memo } from "react";

/**
 * AudioController
 * - Ambient: plays in the dark *after* the lights have been on at least once.
 * - Random spooky: respects mute and light state; random SFX may overlap.
 * - Lazy imports: audio files are loaded only when needed.
 */
const AudioController = ({ lightsOn, playSound, fadeOutAudio, isMuted, stopAllAudio }) => {
  const [hasBeenLitBefore, setHasBeenLitBefore] = useState(false);

  // Stable refs for current states
  const ambientRef   = useRef(null);
  const lightsRef    = useRef(lightsOn);
  const litBeforeRef = useRef(false);
  const mutedRef     = useRef(getMuted(isMuted));

  useEffect(() => { lightsRef.current = lightsOn; }, [lightsOn]);
  useEffect(() => { litBeforeRef.current = hasBeenLitBefore; }, [hasBeenLitBefore]);
  useEffect(() => { mutedRef.current = getMuted(isMuted); }, [isMuted]);

  function getMuted(mutedProp) {
    return typeof mutedProp === "function" ? !!mutedProp() : !!mutedProp;
  }

  // Remember that the room has been lit at least once
  useEffect(() => {
    if (lightsOn && !hasBeenLitBefore) setHasBeenLitBefore(true);
  }, [lightsOn, hasBeenLitBefore]);

  // Lazy loaders for random SFX (with default volumes)
  const spookyLoaders = useMemo(
    () => [
      { load: () => import("../sounds/empty-room-horror-sound-sfx-3339.mp3"),         volume: 0.3 },
      { load: () => import("../sounds/schizophrenic-voices-62486.mp3"),               volume: 0.3 },
      { load: () => import("../sounds/steps-approaching-in-the-darknes.mp3"),         volume: 0.6 },
      { load: () => import("../sounds/evil-laughing-256454.mp3"),                     volume: 0.3 },
      { load: () => import("../sounds/evil-laughter-353177.mp3"),                     volume: 0.3 },
      { load: () => import("../sounds/female-horror-voice-they-know-no.mp3"),         volume: 0.3 },
      { load: () => import("../sounds/halloween-horror-voice-insomnia.mp3"),          volume: 0.3 },
      { load: () => import("../sounds/music-box-lullaby-23919.mp3"),                  volume: 0.3 },
    ],
    []
  );

  // Play one random SFX (lazy-imported). Overlap is allowed by design.
  const playRandomSpooky = useCallback(async () => {
    if (mutedRef.current) return;
    const pick = spookyLoaders[Math.floor(Math.random() * spookyLoaders.length)];
    try {
      const mod = await pick.load();
      const url = mod?.default || mod;
      playSound(url, { volume: pick.volume }); // returns an <audio>, we don't store it → can overlap
    } catch (e) {
      console.error("playRandomSpooky failed:", e);
    }
  }, [spookyLoaders, playSound]);

  // Interval that occasionally triggers a random SFX (still respects mute)
  useEffect(() => {
    if (window.spookyIntervalId) {
      clearInterval(window.spookyIntervalId);
      window.spookyIntervalId = null;
    }

    window.spookyIntervalId = setInterval(() => {
      if (mutedRef.current) return;

      // Probability can be tuned; overlap is fine
      const r = Math.random();
      const shouldPlay = lightsRef.current ? r < 0.75 : r < 0.2;
      if (shouldPlay) void playRandomSpooky();
    }, 30000);

    return () => {
      clearInterval(window.spookyIntervalId);
      window.spookyIntervalId = null;
    };
  }, [playRandomSpooky]);

  // Ambient logic (lazy import)
  useEffect(() => {
    // 1) If muted → stop ambient and do nothing else
    if (mutedRef.current) {
      if (ambientRef.current) {
        try { fadeOutAudio(ambientRef.current, 400); } catch {}
        ambientRef.current = null;
        window.roomAmbientAudio = null;
      }
      return;
    }

    // 2) Lights ON → fade out ambient
    if (lightsRef.current) {
      if (ambientRef.current) {
        const a = ambientRef.current;
        ambientRef.current = null;
        window.roomAmbientAudio = null;
        fadeOutAudio(a, 800);
      }
      return;
    }

    // 3) Dark + has been lit before + nothing playing → start ambient after 400ms (lazy import)
    if (!lightsRef.current && litBeforeRef.current && !ambientRef.current) {
      const tid = setTimeout(() => {
        (async () => {
          if (mutedRef.current || lightsRef.current || !litBeforeRef.current || ambientRef.current) return;
          try {
            const mod = await import("../sounds/015922-whispers-39schizophrenic3.mp3");
            const url = mod?.default || mod;
            const a = playSound(url, { volume: 0.3 });
            if (a) {
              a.loop = true;
              ambientRef.current = a;
              window.roomAmbientAudio = a;
            }
          } catch (e) {
            console.error("ambient import/play failed:", e);
          }
        })();
      }, 400);
      return () => clearTimeout(tid);
    }
  }, [lightsOn, hasBeenLitBefore, isMuted, playSound, fadeOutAudio]);

  // Cleanup on unmount
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

export default memo(AudioController);
