import { useNavigate } from "react-router-dom";
import { problemData } from "./data/ProblemData";

export default function ProblemItem() {
  const navigate = useNavigate();
  function getDifficultyColor(str) {
    switch (str) {
      case "Hard":
        return "text-red-400";
      case "Medium":
        return "text-orange-400";
      case "Easy":
        return "text-green-400";
      default:
        return "text-invert";
    }
  }
  // Convert object to array of entries [id, data]
  const problemEntries = Object.entries(problemData);

  return (
    <div className="flex flex-col *:odd:bg-surfaceContainer-low mt-4 w-full">
      {problemEntries.map(([id, problem], index) => {
        return (
          <div
            key={id}
            onClick={() => navigate(`/problem/${id}`)}
            className="flex items-center w-full p-4 rounded-lg"
          >
            <div className=""></div>
            <div className="px-4 w-fit">{id}.</div>
            <div className=" flex-1 line-clamp-1">{problem.title}</div>
            <div className={getDifficultyColor(problem.difficulty)}>
              {problem.difficulty}
            </div>
          </div>
        );
      })}
    </div>
  );
}
