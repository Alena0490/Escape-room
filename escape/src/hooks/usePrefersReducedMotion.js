import { useEffect, useState } from "react";

export default function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      // No media query support (SSR or very old browser)
      setReduce(false);
      return;
    }

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => setReduce(!!e.matches);

    // Initial state
    setReduce(mql.matches);

    // Modern API
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }

    // Fallback for Safari / old engines
    if (typeof mql.addListener === "function") {
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }

    // Last resort: no-op cleanup
    return () => {};
  }, []);

  return reduce;
}
