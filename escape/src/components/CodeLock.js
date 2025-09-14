import "./CodeLock.css";
import { useState } from "react";
import { IoClose } from "react-icons/io5";

const CodeLock = ({ showLock, setShowLock, showComment }) => {
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === "483920") {
        showComment("The door is now open! You can leave the&nbsp;room.", "success");
        setShowLock(false); // zavřít formulář po zadání správného kódu

        const door = document.querySelector(".door.item");
        if (door) door.classList.add("open");

    } else {
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
      <IoClose className="close" onClick={() => setShowLock(false)} />

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
