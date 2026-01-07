import { useParams } from "react-router-dom";
import { problemData } from "../data/ProblemData.jsx";

export default function Problem() {
  const { id } = useParams();
  const problem = problemData[id];
  const VisualizerComponent = problem.visualizer;

  return (
    <div className="p-4 flex flex-col gap-2">
      <h1 className="text-display-small">{problem.title}</h1>
      <p className="text-body-large">{problem.description}</p>
      {VisualizerComponent ? (
        VisualizerComponent
      ) : (
        <div>Problem {id} not found.</div>
      )}
    </div>
  );
}
