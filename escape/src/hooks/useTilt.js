import { useCallback, useRef } from 'react';

const useTilt = ({ roomRef, wrapRef, rotationYRef, maxPitch = 6, maxYaw = 3 }) => {
  const pitchRef = useRef(0);
  const yawRef   = useRef(0);
  const rafRef   = useRef(null);

  // Write to CSS custom properties (Room.css expects --rotateX/--rotateY)
  const applyTransform = useCallback(() => {
    const el = roomRef.current;
    if (!el) return;

    const baseY = rotationYRef.current || 0;   // 0, 90, 180, 270 ...
    const pitch = pitchRef.current;            // small rotateX
    const yaw   = yawRef.current;              // small add-on to rotateY

    // Order matches your CSS: rotateX(var(--rotateX)) rotateY(var(--rotateY))
    el.style.setProperty('--rotateX', `${pitch}deg`);
    el.style.setProperty('--rotateY', `${baseY + yaw}deg`);
  }, [roomRef, rotationYRef]);

  const resetTilt = useCallback(() => {
    pitchRef.current = 0;
    yawRef.current   = 0;
    applyTransform();
  }, [applyTransform]);

  const bindMouseTilt = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return () => {};

    // Disable on touch/coarse pointers (mobile)
    try {
      if (window?.matchMedia?.('(pointer: coarse)').matches) {
        return () => {};
      }
    } catch {}

    const handleMouseMove = (e) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;

        // Normalize to [-1, 1]
        const nx = (e.clientX - cx) / (rect.width  / 2);
        const ny = (e.clientY - cy) / (rect.height / 2);

        // Clamp
        const clampedX = Math.max(-1, Math.min(1, nx));
        const clampedY = Math.max(-1, Math.min(1, ny));

        // Pitch = rotateX (invert Y so up = negative pitch), Yaw = small add to rotateY
        pitchRef.current = -clampedY * maxPitch;
        yawRef.current   =  clampedX * maxYaw;

        applyTransform();
      });
    };

    const handleMouseLeave = () => {
      resetTilt();
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [wrapRef, maxPitch, maxYaw, applyTransform, resetTilt]);

  const bindNavFreezeTilt = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return () => {};

    const handleNavClick = (e) => {
      if (e.target.closest('.room-nav')) resetTilt();
    };

    // Use capture=true so this runs before other click handlers
    el.addEventListener('click', handleNavClick, true);

    return () => {
      el.removeEventListener('click', handleNavClick, true);
    };
  }, [wrapRef, resetTilt]);

  return {
    applyTransform,
    resetTilt,
    bindMouseTilt,
    bindNavFreezeTilt,
  };
};

export default useTilt;
