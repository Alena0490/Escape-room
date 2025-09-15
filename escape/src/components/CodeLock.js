import "./CodeLock.css";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import Error from "../sounds/error-126627.mp3";
import DoorOpen from "../sounds/opening-metal-door-98518.mp3";
import Whoosh from "../sounds/whoosh-blow-flutter-shortwav-14678.mp3";

const CodeLock = ({ showLock, setShowLock, showComment, playSound }) => {
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === "483920") {
        playSound(DoorOpen);
        showComment("The door is now open! You can leave the&nbsp;room.", "success");
        setShowLock(false); // zavřít formulář po zadání správného kódu

         setTimeout(() => {
            const door = document.querySelector(".door.item");
            if (door) door.classList.add("open");
        }, 1500); // 1.5 sekundy zpoždění   

    } else {
        playSound(Error);
        showComment("Incorrect code. Try again.", "error");   
    }
        setCode("");
  };

  return (
    <form
      className={`code-lock ${showLock ? "active" : ""}`}
      onSubmit={handleSubmit}
    >
      <h3>Enter the code</h3>
      <IoClose 
        className="close"
        onClick={() => {
            setTimeout(() => { 
                setShowLock(false);
            },500)   
            playSound(Whoosh); 
        }} 
        />

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength="6"
        className="code-input"
        placeholder="******"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
      />

      <button type="submit" className="code-submit">
        Confirm
      </button>
    </form>
  );
};

export default CodeLock;
