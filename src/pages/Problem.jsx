import { useParams } from "react-router-dom";
import { problemData } from "../data/questions";

export default function Problem() {
  const { id } = useParams();
  const problem = problemData[id];

  if (!problem) {
    return <div>
        
    </div>;
  }
  return <div>{id}</div>;
}
