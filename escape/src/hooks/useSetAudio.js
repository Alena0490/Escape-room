import { useCallback, useRef, useEffect } from "react";
import switchSound from "../sounds/light-switch-382712.mp3";

// Shared caches (module singletons)
const audioCache = new Map();
const activeAudioInstances = new Set();

// Global audio manager
const globalAudioManager = {
  isMuted: false,
  setMuted(muted) {
    this.isMuted = muted;
    if (muted) this.stopAll();
  },
  stopAll() {
    // Stop tracked clones
    activeAudioInstances.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = true;
      } catch {}
    });
    activeAudioInstances.clear();

    // Stop any <audio> elements in DOM (if present)
    document.querySelectorAll("audio").forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = true;
      } catch {}
    });

    // Ambient (game-specific)
    if (window.roomAmbientAudio) {
      try {
        window.roomAmbientAudio.pause();
        window.roomAmbientAudio.currentTime = 0;
        window.roomAmbientAudio.muted = true;
      } catch {}
      window.roomAmbientAudio = null;
    }

    // Spooky interval (game-specific)
    if (window.spookyIntervalId) {
      clearInterval(window.spookyIntervalId);
      window.spookyIntervalId = null;
    }

    // Web Audio API context
    if (window.__audioCtx?.suspend) {
      try { window.__audioCtx.suspend(); } catch {}
    }

    if (typeof window.__stopAllSFX === "function") {
      try { window.__stopAllSFX(); } catch {}
    }

    console.log("🔇 All audio stopped");
  },
};

// Expose global audio manager (SSR-safe)
if (typeof window !== "undefined") {
  window.globalAudioManager = globalAudioManager;
}

export default function useSetAudio() {
  const intervalRefs = useRef(new Set()); // setInterval ids
  const timeoutRefs = useRef(new Set());  // setTimeout ids

  // Preload immediate SFX (switch)
  useEffect(() => {
    try {
      const audio = new Audio(switchSound);
      audio.preload = "auto";
      audio.load?.();
      audioCache.set(String(switchSound), audio);
    } catch (error) {
      console.warn("Failed to preload switch sound:", error);
    }
  }, []);

  // Autoplay unlock on first user gesture (HTMLMedia + WebAudio)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const unlock = (e) => {
      if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
      if (window.__audioUnlocked) return;
      window.__audioUnlocked = true;
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) {
          window.__audioCtx = window.__audioCtx || new Ctx();
          window.__audioCtx.resume?.();
        }
      } catch {}
      try {
        const el = new Audio(switchSound);
        el.volume = 0;
        el.muted = true;
        el.play()?.then(() => { try { el.pause(); el.currentTime = 0; } catch {} }).catch(() => {});
      } catch {}
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("touchstart", unlock, true);
      document.removeEventListener("keydown", unlock, true);
    };
    document.addEventListener("pointerdown", unlock, true);
    document.addEventListener("touchstart", unlock, true);
    document.addEventListener("keydown", unlock, true);
    return () => {
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("touchstart", unlock, true);
      document.removeEventListener("keydown", unlock, true);
    };
  }, []);

  const playSound = useCallback((src, options = {}) => {
    if (globalAudioManager.isMuted) {
      // Do not play anything when muted
      return null;
    }

    const settings =
      typeof options === "number" ? { duration: options } : options;
    const {
      start = 0,
      duration = null, // seconds
      volume = 1,
      fadeIn = 0,      // seconds
      fadeOut = 0,     // seconds
    } = settings;

    const key = String(src);
    let base = audioCache.get(key);
    if (!base) {
      base = new Audio(src);
      const isRandomSound =
        src.includes("empty-room") ||
        src.includes("voices") ||
        src.includes("steps") ||
        src.includes("laugh") ||
        src.includes("woman") ||
        src.includes("lullaby");
      base.preload = isRandomSound ? "none" : "auto";
      audioCache.set(key, base);
    }

    const audio = base.cloneNode(true);
    audio.muted = false;

    // Seek to start safely (after metadata)
    const seekToStart = () => {
      try { audio.currentTime = start; } catch {}
    };
    if (audio.readyState >= 1) {
      seekToStart();
    } else {
      audio.addEventListener("loadedmetadata", seekToStart, { once: true });
    }

    // Track instance
    activeAudioInstances.add(audio);

    // Timers attached to this audio
    let fadeInId = null;
    let fadeOutId = null;
    let durationId = null;
    let finalized = false;

    const clearTimers = () => {
      if (fadeInId) { clearInterval(fadeInId); intervalRefs.current.delete(fadeInId); fadeInId = null; }
      if (fadeOutId) { clearInterval(fadeOutId); intervalRefs.current.delete(fadeOutId); fadeOutId = null; }
      if (durationId) { clearTimeout(durationId); timeoutRefs.current.delete(durationId); durationId = null; }
    };

    const finalize = () => {
      if (finalized) return;
      finalized = true;
      clearTimers();
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
      activeAudioInstances.delete(audio);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("pause", onEnd);
      audio.removeEventListener("loadedmetadata", seekToStart);
    };

    const onEnd = () => finalize();

    audio.addEventListener("ended", onEnd, { once: true });
    audio.addEventListener("pause", onEnd, { once: true });

    // Initial volume (handle fade-in)
    audio.volume = Math.max(0, Math.min(1, fadeIn > 0 ? 0 : volume));

    audio.play().catch((err) => {
      console.warn("Audio play failed:", err);
      finalize();
    });

    // Fade-in
    if (fadeIn > 0) {
      const steps = Math.max(1, Math.ceil(fadeIn * 20));
      const inc = volume / steps;
      const tick = (fadeIn * 1000) / steps;
      let i = 0;
      fadeInId = setInterval(() => {
        if (globalAudioManager.isMuted) {
          clearInterval(fadeInId); intervalRefs.current.delete(fadeInId); fadeInId = null;
          return finalize();
        }
        i += 1;
        audio.volume = Math.min(volume, audio.volume + inc);
        if (i >= steps) {
          clearInterval(fadeInId); intervalRefs.current.delete(fadeInId); fadeInId = null;
          audio.volume = volume;
        }
      }, tick);
      intervalRefs.current.add(fadeInId);
    }

    // Auto stop / fade-out after duration
    if (duration) {
      durationId = setTimeout(() => {
        if (fadeOut > 0) {
          const steps = Math.max(1, Math.ceil(fadeOut * 20));
          const tick = (fadeOut * 1000) / steps;
          let v = audio.volume;
          const dec = v / steps;
          fadeOutId = setInterval(() => {
            if (globalAudioManager.isMuted) {
              clearInterval(fadeOutId); intervalRefs.current.delete(fadeOutId); fadeOutId = null;
              return finalize();
            }
            v = Math.max(0, v - dec);
            audio.volume = v;
            if (v <= 0) {
              clearInterval(fadeOutId); intervalRefs.current.delete(fadeOutId); fadeOutId = null;
              finalize();
            }
          }, tick);
          intervalRefs.current.add(fadeOutId);
        } else {
          finalize();
        }
      }, duration * 1000);
      timeoutRefs.current.add(durationId);
    }

    return audio;
  }, []);

  const playSequence = useCallback(async (list) => {
    for (const { src, options } of list) {
      if (globalAudioManager.isMuted) break;
      const a = playSound(src, options);
      if (!a) continue;

      await new Promise((resolve) => {
        let guard = setTimeout(() => { guard = null; resolve(); }, 30000); // safety cap
        const done = () => {
          if (guard) { clearTimeout(guard); guard = null; }
          resolve();
        };
        a.addEventListener("ended", done, { once: true });
        a.addEventListener("pause", done, { once: true });
        a.addEventListener("error", done, { once: true });
      });
    }
  }, [playSound]);

  const fadeOutAudio = useCallback((audio, ms = 1000) => {
    if (!audio) return;
    const start = Math.max(0, Math.min(1, audio.volume || 0));
    const steps = Math.max(1, Math.ceil(ms / 50));
    const dec = start / steps;
    let v = start;
    const id = setInterval(() => {
      if (globalAudioManager.isMuted) {
        audio.volume = 0;
        try { audio.pause(); audio.currentTime = 0; } catch {}
        activeAudioInstances.delete(audio);
        clearInterval(id);
        intervalRefs.current.delete(id);
        return;
      }
      v = Math.max(0, v - dec);
      audio.volume = v;
      if (v <= 0) {
        try { audio.pause(); audio.currentTime = 0; } catch {}
        activeAudioInstances.delete(audio);
        clearInterval(id);
        intervalRefs.current.delete(id);
      }
    }, 50);
    intervalRefs.current.add(id);
  }, []);

  // Clean all timers on unmount
  const cleanup = useCallback(() => {
    intervalRefs.current.forEach((id) => clearInterval(id));
    timeoutRefs.current.forEach((id) => clearTimeout(id));
    intervalRefs.current.clear();
    timeoutRefs.current.clear();
  }, []);

  return {
    playSound,
    playSequence,
    fadeOutAudio,
    cleanup,
    stopAllAudio: () => globalAudioManager.stopAll(),
    setMuted: (muted) => globalAudioManager.setMuted(muted),
    isMuted: () => globalAudioManager.isMuted,
  };
}
