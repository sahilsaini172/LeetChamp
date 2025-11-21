import Navbar from "./components/navigation/Navbar";
import { useRoutes } from "react-router-dom";
import routes from "./routes";

function App() {
  const routing = useRoutes(routes);
  return (
    <div className="h-screen overflow-y-scroll bg-surface text-onSurface">
      <Navbar />
      {routing}
    </div>
  );
}

export default App;
