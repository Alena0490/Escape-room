import { useCallback, useRef } from 'react';

const useTilt = ({ roomRef, wrapRef, rotationYRef, maxPitch = 6, maxYaw = 3 }) => {
  const pitchRef = useRef(0);
  const yawRef = useRef(0);

  const applyTransform = useCallback(() => {
    if (!roomRef.current) return;
    
    const rotationY = rotationYRef.current || 0;
    const pitch = pitchRef.current;
    const yaw = yawRef.current;
    
    roomRef.current.style.transform = 
      `rotateY(${rotationY}deg) rotateX(${pitch}deg) rotateZ(${yaw}deg)`;
  }, [roomRef, rotationYRef]);

  const resetTilt = useCallback(() => {
    pitchRef.current = 0;
    yawRef.current = 0;
    applyTransform();
  }, [applyTransform]);

  const bindMouseTilt = useCallback(() => {
    if (!wrapRef.current) return () => {};

    const handleMouseMove = (e) => {
      const rect = wrapRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      pitchRef.current = -(mouseY / rect.height) * maxPitch;
      yawRef.current = (mouseX / rect.width) * maxYaw;
      
      applyTransform();
    };

    const handleMouseLeave = () => {
      resetTilt();
    };

    wrapRef.current.addEventListener('mousemove', handleMouseMove);
    wrapRef.current.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (wrapRef.current) {
        wrapRef.current.removeEventListener('mousemove', handleMouseMove);
        wrapRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [wrapRef, maxPitch, maxYaw, applyTransform, resetTilt]);

  const bindNavFreezeTilt = useCallback(() => {
    if (!wrapRef.current) return () => {};

    const handleNavClick = (e) => {
      if (e.target.closest('.room-nav')) {
        resetTilt();
      }
    };

    wrapRef.current.addEventListener('click', handleNavClick);

    return () => {
      if (wrapRef.current) {
        wrapRef.current.removeEventListener('click', handleNavClick);
      }
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