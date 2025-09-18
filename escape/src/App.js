import { useState } from "react";
import Room from './components/Room';
import StartScreen from './components/StartScreen';

const App = () => {
  // set started to false
  const [started, setStarted] = useState(false);

  return (
    <>
      {!started ? (
        // if started === false, show StartScreen
        <StartScreen 
        onStart={() => setStarted(true)} />
      ) : (
        // after clicning on Start show the room
        <Room />
      )}
    </>
  );
};

export default App;
