import { lazy, Suspense, memo } from "react";
import "./Ceiling.css"
/**
 * Ceiling
 * - Ghost (unclickable)
 */
const GhostComponent = lazy(() => import("./GhostComponent"));

const Ceiling = ({ lightsOn }) => (
  <div className="wall wall-top">
    <Suspense fallback={null}>
      <GhostComponent lightsOn={lightsOn} />
    </Suspense>
  </div>
);

export default memo(Ceiling);