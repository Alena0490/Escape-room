import { useEffect, useState, useMemo, useRef, useCallback, memo } from "react";

/**
 * AudioController
 * - ambient: hraje ve tmě po tom, co se aspoň jednou rozsvítilo
 * - random spooky: respektuje mute i světlo
 * - lazy import: zvuky se stahují až při přehrání
 */
const AudioController = ({ lightsOn, playSound, fadeOutAudio, isMuted, stopAllAudio }) => {
  const [hasBeenLitBefore, setHasBeenLitBefore] = useState(false);

  // === Refs pro stabilní čtení aktuálních stavů ===
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

  // Po prvním rozsvícení si zapamatuj
  useEffect(() => {
    if (lightsOn && !hasBeenLitBefore) setHasBeenLitBefore(true);
  }, [lightsOn, hasBeenLitBefore]);

  // === LAZY loaders pro random sounds (se základní hlasitostí) ===
  const spookyLoaders = useMemo(
    () => [
      { load: () => import("../sounds/empty-room-horror-sound-sfx-3339.mp3"),                 volume: 0.3 },
      { load: () => import("../sounds/schizophrenic-voices-62486.mp3"),                       volume: 0.3 },
      { load: () => import("../sounds/steps-approaching-in-the-darknes.mp3"),                 volume: 0.6 }, // hlasitější kroky
      { load: () => import("../sounds/evil-laughing-256454.mp3"),                             volume: 0.3 },
      { load: () => import("../sounds/evil-laughter-353177.mp3"),                             volume: 0.3 },
      { load: () => import("../sounds/female-horror-voice-they-know-no.mp3"),                 volume: 0.3 },
      { load: () => import("../sounds/halloween-horror-voice-insomnia.mp3"),                  volume: 0.3 },
      { load: () => import("../sounds/music-box-lullaby-23919.mp3"),                          volume: 0.3 },
    ],
    []
  );

  // === Random zvuk – LAZY import + přehrání ===
  const playRandomSpooky = useCallback(async () => {
    if (mutedRef.current) return;
    const pick = spookyLoaders[Math.floor(Math.random() * spookyLoaders.length)];
    try {
      const mod = await pick.load();
      const url = mod?.default || mod; // bundlery vrací URL v default
      playSound(url, { volume: pick.volume });
    } catch (e) {
      console.error("❌ playRandomSpooky:", e);
    }
  }, [spookyLoaders, playSound]);

  // === Interval pro náhodné zvuky (respektuje mute) ===
  useEffect(() => {
    if (window.spookyIntervalId) {
      clearInterval(window.spookyIntervalId);
      window.spookyIntervalId = null;
    }

    window.spookyIntervalId = setInterval(() => {
      if (window.gameEnded) return;
      if (mutedRef.current) return;

      const r = Math.random();
      const shouldPlay = lightsRef.current ? r < 0.75 : r < 0.2;
      if (shouldPlay) void playRandomSpooky();
    }, 30000);

    return () => {
      clearInterval(window.spookyIntervalId);
      window.spookyIntervalId = null;
    };
  }, [playRandomSpooky]);

  // === Ambient logika (LAZY import) ===
  useEffect(() => {
    // 1) MUTE → vypnout a nic nespouštět
    if (mutedRef.current) {
      if (ambientRef.current) {
        try { fadeOutAudio(ambientRef.current, 400); } catch {}
        ambientRef.current = null;
        window.roomAmbientAudio = null;
      }
      return;
    }

    // 2) Světlo ON → vypnout ambient
    if (lightsRef.current) {
      if (ambientRef.current) {
        const a = ambientRef.current;
        ambientRef.current = null;
        window.roomAmbientAudio = null;
        fadeOutAudio(a, 800);
      }
      return;
    }

    // 3) TMA + už se někdy rozsvítilo + nic nehraje → po 400ms spusť ambient (lazy import)
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
              window.roomAmbientAudio = a; // pokud používáš jinde
            }
          } catch (e) {
            console.error("❌ ambient import/play:", e);
          }
        })();
      }, 400);
      return () => clearTimeout(tid);
    }
  }, [lightsOn, hasBeenLitBefore, isMuted, playSound, fadeOutAudio]);

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

export default memo(AudioController);
