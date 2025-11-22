import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { problemData } from "./data/questions";

function TwoSumVisualizer({ width }) {
  const containerRef = useRef(null);
  const { id } = useParams();
  const problem = problemData[id];
  const [nums, setNums] = useState([11, 15, 2, 7, 6]);
  const [target, setTarget] = useState(9);
  const [running, setRunning] = useState(false);
  const [currentI, setCurrentI] = useState(-1);
  const [currentJ, setCurrentJ] = useState(-1);
  const [result, setResult] = useState([]);
  const [status, setStatus] = useState('Click "Start" to begin visualization');
  const [stepCount, setStepCount] = useState(0);

  const animationRef = useRef(null);

  const height = 300;
  const maxHeight = height - 100;

  // Two Sum algorithm generator
  function* twoSumGenerator(nums, target) {
    let result = [];
    let steps = 0;

    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        steps++;

        // Show current comparison
        yield {
          i,
          j,
          sum: nums[i] + nums[j],
          found: false,
          result: [],
          steps,
          status: `Step ${steps}: Checking nums[${i}] (${
            nums[i]
          }) + nums[${j}] (${nums[j]}) = ${nums[i] + nums[j]}${
            nums[i] + nums[j] === target ? " ✓ MATCH!" : ""
          }`,
        };

        if (nums[i] + nums[j] === target) {
          result.push(i);
          result.push(j);

          yield {
            i,
            j,
            sum: nums[i] + nums[j],
            found: true,
            result: [...result],
            steps,
            status: `✓ Solution found! Indices [${i}, ${j}] → nums[${i}] + nums[${j}] = ${nums[i]} + ${nums[j]} = ${target}`,
          };

          return { result, found: true };
        }
      }
    }

    return { result: [], found: false, status: "No solution found" };
  }

  // Get bar color based on state
  const getBarColor = (index) => {
    if (result.includes(index)) return "easy"; // Green - found
    if (index === currentI) return "hard"; // Red - i pointer
    if (index === currentJ) return "medium"; // Orange - j pointer
    return "blue-400"; // Blue - default
  };

  // Get bar label
  const getBarLabel = (index) => {
    if (result.includes(index)) return "✓";
    if (index === currentI) return "i";
    if (index === currentJ) return "j";
    return "";
  };

  // Run visualization
  const runVisualization = useCallback(() => {
    setRunning(true);
    setResult([]);
    setStepCount(0);

    const generator = twoSumGenerator(nums, target);

    const animate = () => {
      const { value, done } = generator.next();

      if (!done && value) {
        setCurrentI(value.i);
        setCurrentJ(value.j);
        setStatus(value.status);
        setStepCount(value.steps);

        if (value.found) {
          setResult(value.result);
          setTimeout(() => {
            setRunning(false);
            setCurrentI(-1);
            setCurrentJ(-1);
          }, 2000);
        } else {
          animationRef.current = setTimeout(animate, 1000);
        }
      } else {
        setRunning(false);
        setCurrentI(-1);
        setCurrentJ(-1);
        if (!value?.found) {
          setStatus("No solution exists for this target");
        }
      }
    };

    animate();
  }, [nums, target]);

  // Stop animation
  const stopVisualization = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setRunning(false);
    setCurrentI(-1);
    setCurrentJ(-1);
    setResult([]);
    setStatus("Visualization stopped");
  };

  // Generate random array
  const generateArray = () => {
    const newArray = Array.from(
      { length: 5 },
      () => Math.floor(Math.random() * 20) + 1
    );
    setNums(newArray);
    setResult([]);
    setCurrentI(-1);
    setCurrentJ(-1);
    setStatus('New array generated. Click "Start" to begin.');
    setStepCount(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 text-onSurface **:ease-in **:duration-150 ease-in duration-150">
      <h2 className="text-headline-medium">Two Sum</h2>

      {/* Status */}
      <div className="p-2 bg-surfaceContainer text-label-large rounded-md">
        {status}
      </div>

      {/* SVG Visualization */}
      <div
        className={`h-[300px] gap-2 pb-4 rounded-lg bg-surfaceContainer-highest flex items-end relative`}
        style={{ width: "380px" }}
      >
        {/* Title */}
        <p className="text-center top-4 left-[50%] -translate-x-[50%] absolute text-label-medium">
          Target: {target} | Steps: {stepCount}
        </p>

        {/* Array visualization */}
        {nums.map((value, index) => {
          const maxValue = Math.max(...nums);
          const barHeight = (value / maxValue) * maxHeight;

          return (
            <g key={index}>
              {/* Bar */}
              <div
                className={`p-2 text-label-small mx-4 w-full flex flex-col items-center rounded-sm justify-end text-invert relative bg-${getBarColor(
                  index
                )}`}
                style={{
                  height: barHeight,
                }}
              >
                {/* Value text */}
                <span className="font-black">{value}</span>

                {/* Index label */}
                <span className="font-medium">[{index}]</span>

                {/* Pointer label */}
                <span className={`absolute -top-8 text-${getBarColor(index)}`}>
                  {getBarLabel(index)}
                </span>
              </div>
            </g>
          );
        })}

        {/* Connection line when comparing */}
        {/* Connection line when comparing */}
        {currentI >= 0 && currentJ >= 0 && (
          <>
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ width: "380px", height: "300px" }}
            >
              <line
                x1={currentI * (60 + 16) + 60 / 2}
                y1={height - 100}
                x2={currentJ * (60 + 16) + 60 / 2}
                y2={height - 100}
                stroke="#e74c3c"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
            <span className="absolute top-12 left-[50%] -translate-x-[50%]">
              {nums[currentI]} + {nums[currentJ]} ={" "}
              {nums[currentI] + nums[currentJ]}
            </span>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 w-full">
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer gap-1 text-label-small">
          <div className="size-4 bg-blue-400 rounded-full"></div>
          <span>Unvisited</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer gap-1 text-label-small">
          <div className="size-4 bg-hard rounded-full"></div>
          <span>Pointer i</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer gap-1 text-label-small">
          <div className="size-4 bg-medium rounded-full"></div>
          <span>Pointer j</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer gap-1 text-label-small">
          <div className="size-4 bg-easy rounded-full"></div>
          <span>Solution Found</span>
        </div>
      </div>
      <div className="flex items-center"></div>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={runVisualization}
          disabled={running}
          style={{
            padding: "12px 24px",
            marginRight: "10px",
            fontSize: "16px",
            backgroundColor: running ? "#95a5a6" : "#3498db",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: running ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {running ? "Running..." : "Start Visualization"}
        </button>

        <button
          onClick={stopVisualization}
          disabled={!running}
          style={{
            padding: "12px 24px",
            marginRight: "10px",
            fontSize: "16px",
            backgroundColor: !running ? "#95a5a6" : "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: !running ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          Stop
        </button>

        <button
          onClick={generateArray}
          disabled={running}
          style={{
            padding: "12px 24px",
            marginRight: "10px",
            fontSize: "16px",
            backgroundColor: running ? "#95a5a6" : "#27ae60",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: running ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          Generate Array
        </button>

        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          disabled={running}
          style={{
            padding: "12px",
            fontSize: "16px",
            width: "100px",
            borderRadius: "5px",
            border: "2px solid #3498db",
          }}
          placeholder="Target"
        />
      </div>
    </div>
  );
}

export default TwoSumVisualizer;
