import { useState, useEffect } from "react";
import IconButton from "./components/buttons/Iconbutton";
import { Moon, Sun } from "lucide-react";

const DarkModeToggle = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = () => {
    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDark(!dark);
  };

  return (
    <button
      onClick={toggleDark}
      className="transition-all ease-in duration-150"
    >
      {dark ? (
        <IconButton>
          <Sun />
        </IconButton>
      ) : (
        <IconButton>
          <Moon />
        </IconButton>
      )}
    </button>
  );
};

export default DarkModeToggle;
