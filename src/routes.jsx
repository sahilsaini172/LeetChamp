import Home from "./pages/Home";
import Problem from "./pages/Problem";

const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/problem/:id",
    element: <Problem />,
  },
];

export default routes;