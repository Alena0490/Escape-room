import { useCallback } from "react";

const audioCache = new Map();

export default function useSetAudio() {
  const playSound = useCallback((src, options = {}) => {
    const settings = typeof options === "number" ? { duration: options } : options;
    const { start = 0, duration = null, volume = 1, fadeIn = 0, fadeOut = 0 } = settings;

    const key = String(src);
    const base = audioCache.get(key) || new Audio(src);
    if (!audioCache.has(key)) audioCache.set(key, base);
    const audio = base.cloneNode();

    audio.currentTime = start;
    audio.volume = fadeIn > 0 ? 0 : volume;
    audio.play().catch(console.warn);

    // fade-in
    if (fadeIn > 0) {
      const steps = Math.ceil(fadeIn * 20);
      const inc = volume / steps;
      const tick = (fadeIn * 1000) / steps;
      let i = 0;
      const id = setInterval(() => {
        i += 1;
        audio.volume = Math.min(volume, inc * i);
        if (i >= steps) clearInterval(id);
      }, tick);
    }

    // auto stop / fade-out
    if (duration) {
      setTimeout(() => {
        if (fadeOut > 0) {
          const steps = Math.ceil(fadeOut * 20);
          const dec = audio.volume / steps;
          const tick = (fadeOut * 1000) / steps;
          let v = audio.volume;
          const id = setInterval(() => {
            v -= dec;
            audio.volume = Math.max(0, v);
            if (v <= 0) {
              clearInterval(id);
              audio.pause();
              audio.currentTime = 0;
            }
          }, tick);
        } else {
          audio.pause();
          audio.currentTime = 0;
        }
      }, duration * 1000);
    }

    return audio;
  }, []);

  const playSequence = useCallback(async (list) => {
    for (const { src, options } of list) {
      const a = playSound(src, options);
      await new Promise((resolve) => {
        const d = options?.duration;
        if (d) return setTimeout(resolve, d * 1000);
        a.onended = resolve;
        setTimeout(resolve, 30000);
      });
    }
  }, [playSound]);

  const fadeOutAudio = useCallback((audio, ms = 1000) => {
    if (!audio) return;
    const start = audio.volume || 0;
    const step = start / (ms / 50);
    const id = setInterval(() => {
      if (audio.volume > step) audio.volume -= step;
      else {
        audio.volume = 0;
        audio.pause();
        audio.currentTime = 0;
        clearInterval(id);
      }
    }, 50);
  }, []);

  return { playSound, playSequence, fadeOutAudio };
}