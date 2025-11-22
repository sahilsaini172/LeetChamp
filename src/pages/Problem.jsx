import { useParams } from "react-router-dom";
import { problemData } from "../data/questions";
import TwoSumVisualizer from "../TwoSumVisualizer";

export default function Problem() {
  const { id } = useParams();
  const problem = problemData[id];

  function renderProblem() {
    switch (id) {
      case "1":
        return <TwoSumVisualizer />;
      default:
        return <div>Problem {id} not found.</div>;
    }
  }
  if (!problem) {
    return <div>Problem not found.</div>;
  }
  return <div className="p-4">{renderProblem()}</div>;
}
