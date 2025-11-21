import React, { useState, useCallback, useEffect, useRef } from "react";

function TwoSumVisualizer() {
  const [nums, setNums] = useState([11, 15, 2, 7]);
  const [target, setTarget] = useState(9);
  const [running, setRunning] = useState(false);
  const [currentI, setCurrentI] = useState(-1);
  const [currentJ, setCurrentJ] = useState(-1);
  const [result, setResult] = useState([]);
  const [status, setStatus] = useState('Click "Start" to begin visualization');
  const [stepCount, setStepCount] = useState(0);

  const animationRef = useRef(null);

  const width = 800;
  const height = 500;
  const padding = 60;
  const barWidth = 80;
  const spacing = 40;
  const maxHeight = height - 200;

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
    if (result.includes(index)) return "#2ecc71"; // Green - found
    if (index === currentI) return "#e74c3c"; // Red - i pointer
    if (index === currentJ) return "#f39c12"; // Orange - j pointer
    return "#3498db"; // Blue - default
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
    <div className="p-4 flex flex-col">
      <h2 className="text-title-medium">Two Sum Algorithm Visualizer</h2>

      {/* Controls */}
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

      {/* Status */}
      <div
        style={{
          padding: "15px",
          backgroundColor: "#ecf0f1",
          borderRadius: "5px",
          marginBottom: "20px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "#2c3e50",
        }}
      >
        {status}
      </div>

      {/* SVG Visualization */}
      <svg
        width={width}
        height={height}
        style={{ border: "2px solid #bdc3c7", borderRadius: "8px" }}
      >
        <rect width={width} height={height} fill="#f8f9fa" />

        {/* Title */}
        <text
          x={width / 2}
          y={30}
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
          fill="#2c3e50"
        >
          Target: {target} | Steps: {stepCount}
        </text>

        {/* Array visualization */}
        {nums.map((value, index) => {
          const maxValue = Math.max(...nums);
          const barHeight = (value / maxValue) * maxHeight;
          const x = padding + index * (barWidth + spacing);
          const y = height - padding - barHeight;

          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={getBarColor(index)}
                stroke="#2c3e50"
                strokeWidth="3"
                rx="5"
              />

              {/* Value text */}
              <text
                x={x + barWidth / 2}
                y={y + barHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="24"
                fontWeight="bold"
                fill="white"
              >
                {value}
              </text>

              {/* Index label */}
              <text
                x={x + barWidth / 2}
                y={height - padding + 25}
                textAnchor="middle"
                fontSize="16"
                fill="#2c3e50"
                fontWeight="bold"
              >
                [{index}]
              </text>

              {/* Pointer label */}
              <text
                x={x + barWidth / 2}
                y={y - 15}
                textAnchor="middle"
                fontSize="20"
                fontWeight="bold"
                fill={getBarColor(index)}
              >
                {getBarLabel(index)}
              </text>
            </g>
          );
        })}

        {/* Connection line when comparing */}
        {currentI >= 0 && currentJ >= 0 && (
          <>
            <line
              x1={padding + currentI * (barWidth + spacing) + barWidth / 2}
              y1={height - padding - 50}
              x2={padding + currentJ * (barWidth + spacing) + barWidth / 2}
              y2={height - padding - 50}
              stroke="#e74c3c"
              strokeWidth="4"
              strokeDasharray="5,5"
            />
            <text
              x={
                (padding +
                  currentI * (barWidth + spacing) +
                  padding +
                  currentJ * (barWidth + spacing) +
                  barWidth) /
                2
              }
              y={height - padding - 60}
              textAnchor="middle"
              fontSize="18"
              fontWeight="bold"
              fill="#e74c3c"
            >
              {nums[currentI]} + {nums[currentJ]} ={" "}
              {nums[currentI] + nums[currentJ]}
            </text>
          </>
        )}
      </svg>

      {/* Legend */}
      <div style={{ marginTop: "20px", display: "flex", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: "#3498db",
              marginRight: "10px",
              borderRadius: "5px",
            }}
          ></div>
          <span>Unvisited</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: "#e74c3c",
              marginRight: "10px",
              borderRadius: "5px",
            }}
          ></div>
          <span>Pointer i</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: "#f39c12",
              marginRight: "10px",
              borderRadius: "5px",
            }}
          ></div>
          <span>Pointer j</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: "#2ecc71",
              marginRight: "10px",
              borderRadius: "5px",
            }}
          ></div>
          <span>Solution Found</span>
        </div>
      </div>
    </div>
  );
}

export default TwoSumVisualizer;
