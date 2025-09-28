// App.js (eager imports)
import { useState } from "react";
import Room from "./components/Room";
import StartScreen from "./components/StartScreen";

const App = () => {
  // Local UI state only; no persistence
  const [started, setStarted] = useState(false);

  return (
    <>
      {!started ? (
        // Show StartScreen until user clicks Start
        <StartScreen onStart={() => setStarted(true)} />
      ) : (
        // Show the game after Start
        <Room />
      )}
    </>
  );
};

export default App;
