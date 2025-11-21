import { useState } from "react";
import TwoSumVisualizer from "./TwoSumVisualizer";
import Navbar from "./components/navigation/Navbar";
import Home from "./pages/Home";

function App() {
  const [data, setdata] = useState([3, 10, 15, 7, 20, 12]);
  return (
    <div className="flex flex-col h-screen bg-surface text-onSurface">
      <Navbar />
      <Home />
    </div>
  );
}

export default App;
