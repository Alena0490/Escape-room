import { useCallback, useRef, useEffect } from "react";

// Import critical sound for preloading
import switchSound from "../sounds/light-switch-382712.mp3";

const audioCache = new Map();
const activeAudioInstances = new Set();

// Global audio manager
const globalAudioManager = {
  isMuted: false,
  setMuted(muted) {
    this.isMuted = muted;
    if (muted) {
      this.stopAll();
    }
  },
  
  stopAll() {
    // Stop all active tasks
    activeAudioInstances.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = true;
      } catch {}
    });
    activeAudioInstances.clear();

    // Stop all <audio> elements on page
    document.querySelectorAll("audio").forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = true;
      } catch {}
    });

    // Stop ambient audio
    if (window.roomAmbientAudio) {
      try {
        window.roomAmbientAudio.pause();
        window.roomAmbientAudio.currentTime = 0;
        window.roomAmbientAudio.muted = true;
      } catch {}
      window.roomAmbientAudio = null;
    }

    // Stop spooky interval
    if (window.spookyIntervalId) {
      clearInterval(window.spookyIntervalId);
      window.spookyIntervalId = null;
    }

    // Stop Web Audio API context
    if (window.__audioCtx?.suspend) {
      try { 
        window.__audioCtx.suspend(); 
      } catch {}
    }

    // Stop extra SFX
    if (typeof window.__stopAllSFX === "function") {
      try { 
        window.__stopAllSFX(); 
      } catch {}
    }

    console.log("🔇 All audio stopped");
  }
};

// Set global audio manageru on window
window.globalAudioManager = globalAudioManager;

export default function useSetAudio() {
  const intervalRefs = useRef(new Set());

  // Preload only switch sound for immediate interaction
  useEffect(() => {
    try {
      const audio = new Audio(switchSound);
      audio.preload = "auto";
      audio.load();
      audioCache.set(String(switchSound), audio);
    } catch (error) {
      console.warn("Failed to preload switch sound:", error);
    }
  }, []);

  const playSound = useCallback((src, options = {}) => {
    // If muted, do no play anything
    if (globalAudioManager.isMuted) {
      return null;
    }

    const settings = typeof options === "number" ? { duration: options } : options;
    const { start = 0, duration = null, volume = 1, fadeIn = 0, fadeOut = 0 } = settings;

    const key = String(src);
    let base = audioCache.get(key);
    
    if (!base) {
      base = new Audio(src);
      // For random/background sounds, use lazy loading
      const isRandomSound = src.includes('empty-room') || src.includes('voices') || 
                          src.includes('steps') || src.includes('laugh') || 
                          src.includes('woman') || src.includes('lullaby');
      
      base.preload = isRandomSound ? "none" : "auto";
      audioCache.set(key, base);
    }
    
    const audio = base.cloneNode();
    audio.muted = false; // Make sure it is not muted
    // Add to watched
    activeAudioInstances.add(audio);

    // Cleanup after end
    let cleanup = () => {
      activeAudioInstances.delete(audio);
    };

    audio.addEventListener('ended', cleanup);
    audio.addEventListener('pause', cleanup);

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
        if (globalAudioManager.isMuted) {
          clearInterval(id);
          return;
        }
        i += 1;
        audio.volume = Math.min(volume, inc * i);
        if (i >= steps) clearInterval(id);
      }, tick);
      intervalRefs.current.add(id);
    }

    // auto stop / fade-out
    if (duration) {
      const timeoutId = setTimeout(() => {
        if (fadeOut > 0) {
          const steps = Math.ceil(fadeOut * 20);
          const dec = audio.volume / steps;
          const tick = (fadeOut * 1000) / steps;
          let v = audio.volume;
          const id = setInterval(() => {
            if (globalAudioManager.isMuted) {
              clearInterval(id);
              audio.pause();
              audio.currentTime = 0;
              cleanup();
              return;
            }
            v -= dec;
            audio.volume = Math.max(0, v);
            if (v <= 0) {
              clearInterval(id);
              audio.pause();
              audio.currentTime = 0;
              cleanup();
            }
          }, tick);
          intervalRefs.current.add(id);
        } else {
          audio.pause();
          audio.currentTime = 0;
          cleanup();
        }
      }, duration * 1000);
      
      // Cleanup timeout during unmount
      const originalCleanup = cleanup;
      cleanup = () => {
        clearTimeout(timeoutId);
        originalCleanup();
      };
    }

    return audio;
  }, []);

  const playSequence = useCallback(async (list) => {
    for (const { src, options } of list) {
      if (globalAudioManager.isMuted) break;
      
      const a = playSound(src, options);
      if (!a) continue; // If muted, playSound returns null
      
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
      if (globalAudioManager.isMuted || audio.volume <= step) {
        audio.volume = 0;
        audio.pause();
        audio.currentTime = 0;
        activeAudioInstances.delete(audio);
        clearInterval(id);
      } else {
        audio.volume -= step;
      }
    }, 50);
    intervalRefs.current.add(id);
  }, []);

  // Clean all intervallls when unmounted
  const cleanup = useCallback(() => {
    intervalRefs.current.forEach(id => clearInterval(id));
    intervalRefs.current.clear();
  }, []);

  return { 
    playSound, 
    playSequence, 
    fadeOutAudio, 
    cleanup,
    // Access to global manager
    stopAllAudio: () => globalAudioManager.stopAll(),
    setMuted: (muted) => globalAudioManager.setMuted(muted),
    isMuted: () => globalAudioManager.isMuted
  };
}