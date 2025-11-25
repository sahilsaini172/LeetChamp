import { useParams } from "react-router-dom";
import { problemData } from "../data/questions";
import TwoSumVisualizer from "../Solutions/TwoSumVisualizer";
import AddTwoNumbersVisualizer from "../Solutions/AddTwoNumberVisualizer";
import LongestSubstringVisualizer from "../Solutions/LongestSubstringVisualizer";
import MedianSortedArraysVisualizer from "../Solutions/MedianSortedArraysVisualizer";

export default function Problem() {
  const { id } = useParams();
  const problem = problemData[id];

  function renderProblem() {
    switch (id) {
      case "1":
        return <TwoSumVisualizer />;
      case "2":
        return <AddTwoNumbersVisualizer />;
      case "3":
        return <LongestSubstringVisualizer />;
      case "4":
        return <MedianSortedArraysVisualizer />;
      default:
        return <div>Problem {id} not found.</div>;
    }
  }
  if (!problem) {
    return <div>Problem not found.</div>;
  }
  return <div className="p-4">{renderProblem()}</div>;
}
