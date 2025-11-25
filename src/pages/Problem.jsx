import { useParams } from "react-router-dom";
import { problemData } from "../data/ProblemData.jsx";

export default function Problem() {
  const { id } = useParams();
  const problem = problemData[id];
  const VisualizerComponent = problem.visualizer;

  return (
    <div className="p-4">
      {VisualizerComponent ? (
        VisualizerComponent
      ) : (
        <div>Problem {id} not found.</div>
      )}
    </div>
  );
}
