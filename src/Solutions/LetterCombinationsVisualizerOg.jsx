import React, { useState, useCallback, useRef, useEffect } from "react";

function LetterCombinationsVisualizerOg() {
  const [digits, setDigits] = useState("23");
  const [running, setRunning] = useState(false);

  // State for visualization
  const [currentPath, setCurrentPath] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [treeNodes, setTreeNodes] = useState([]);
  const [treeLinks, setTreeLinks] = useState([]);
  const [activeNodeId, setActiveNodeId] = useState("root");
  const [status, setStatus] = useState(
    'Click "Start" to generate combinations'
  );

  const animationRef = useRef(null);

  const digitToLetters = {
    2: "abc",
    3: "def",
    4: "ghi",
    5: "jkl",
    6: "mno",
    7: "pqrs",
    8: "tuv",
    9: "wxyz",
  };

  const WIDTH = 800;
  const HEIGHT = 600;

  // Backtracking generator
  function* backtrackGenerator(inputDigits) {
    if (!inputDigits) return;

    let step = 0;
    const res = [];

    // Initialize tree with root
    const nodes = [
      {
        id: "root",
        x: WIDTH / 2,
        y: 50,
        val: "Start",
        depth: 0,
        status: "active",
      },
    ];
    const links = [];

    yield {
      currentPath: "",
      currentIndex: 0,
      results: [],
      treeNodes: [...nodes],
      treeLinks: [...links],
      activeNodeId: "root",
      status: "Start backtracking from root",
      done: false,
    };

    // Helper to calculate X position for nodes
    // We assign a range [minX, maxX] to each node to distribute children
    function* recurse(idx, path, parentId, minX, maxX) {
      if (idx === inputDigits.length) {
        res.push(path);

        // Update the leaf node to "found" status
        const updatedNodes = nodes.map((n) =>
          n.id === parentId ? { ...n, status: "found" } : n
        );

        yield {
          currentPath: path,
          currentIndex: idx,
          results: [...res],
          treeNodes: updatedNodes,
          treeLinks: [...links],
          activeNodeId: parentId,
          status: `Found valid combination: "${path}"`,
          done: false,
        };
        return;
      }

      const digit = inputDigits[idx];
      const letters = digitToLetters[digit];
      const rangeWidth = maxX - minX;
      const slice = rangeWidth / letters.length;

      yield {
        currentPath: path,
        currentIndex: idx,
        results: [...res],
        treeNodes: [...nodes],
        treeLinks: [...links],
        activeNodeId: parentId,
        status: `Processing digit '${digit}' at index ${idx} -> letters [${letters}]`,
        done: false,
      };

      for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        const childId = `${parentId}-${letter}`;

        // Calculate child position
        const childX = minX + i * slice + slice / 2;
        const childY = 50 + (idx + 1) * 100;

        // Add child node and link
        nodes.push({
          id: childId,
          x: childX,
          y: childY,
          val: letter,
          depth: idx + 1,
          status: "visiting",
        });

        links.push({ source: parentId, target: childId });

        yield {
          currentPath: path + letter,
          currentIndex: idx + 1,
          results: [...res],
          treeNodes: [...nodes],
          treeLinks: [...links],
          activeNodeId: childId,
          status: `Choose '${letter}', move down to depth ${idx + 1}`,
          done: false,
        };

        // Recurse
        yield* recurse(
          idx + 1,
          path + letter,
          childId,
          minX + i * slice,
          minX + (i + 1) * slice
        );

        // Backtrack step
        // Mark child as visited/inactive
        const nodeIndex = nodes.findIndex((n) => n.id === childId);
        if (nodes[nodeIndex].status !== "found") {
          nodes[nodeIndex] = { ...nodes[nodeIndex], status: "visited" };
        }

        yield {
          currentPath: path,
          currentIndex: idx,
          results: [...res],
          treeNodes: [...nodes],
          treeLinks: [...links],
          activeNodeId: parentId,
          status: `Backtrack from '${letter}', return to parent`,
          done: false,
        };
      }
    }

    yield* recurse(0, "", "root", 20, WIDTH - 20);

    yield {
      currentPath: "",
      currentIndex: 0,
      results: res,
      treeNodes: nodes.map((n) => ({
        ...n,
        status: n.status === "found" ? "found" : "visited",
      })),
      treeLinks: [...links],
      activeNodeId: "root",
      status: `Complete! Found ${res.length} combinations.`,
      done: true,
    };
  }

  const runVisualization = useCallback(() => {
    // Basic validation: 2-9 digits only, max length 3 for clear visual
    const validDigits = digits.replace(/[^2-9]/g, "");
    if (validDigits.length === 0 || validDigits.length > 4) {
      setStatus("⚠️ Please enter 1-4 digits (2-9 only). '23' is recommended.");
      return;
    }

    // Warn if > 3 digits
    if (validDigits.length > 3) {
      setStatus("⚠️ 4 digits = 81+ nodes. Tree will be crowded!");
    } else {
      setStatus("Starting...");
    }

    setRunning(true);
    setResults([]);
    setCurrentPath("");
    setTreeNodes([]);
    setTreeLinks([]);

    const generator = backtrackGenerator(validDigits);

    const animate = () => {
      const { value, done } = generator.next();

      if (value) {
        setCurrentPath(value.currentPath);
        setCurrentIndex(value.currentIndex);
        setResults(value.results);
        setTreeNodes(value.treeNodes);
        setTreeLinks(value.treeLinks);
        setActiveNodeId(value.activeNodeId);
        setStatus(value.status);

        if (done) {
          setRunning(false);
        } else {
          // Speed up if many nodes
          const delay = validDigits.length > 3 ? 100 : 800;
          animationRef.current = setTimeout(animate, delay);
        }
      } else {
        setRunning(false);
      }
    };

    animate();
  }, [digits]);

  const stop = () => {
    if (animationRef.current) clearTimeout(animationRef.current);
    setRunning(false);
  };

  const reset = () => {
    stop();
    setResults([]);
    setCurrentPath("");
    setTreeNodes([]);
    setTreeLinks([]);
    setActiveNodeId("root");
    setStatus('Click "Start" to generate combinations');
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, []);

  // Helper for node styling
  const getNodeColor = (status, id) => {
    if (id === activeNodeId) return "#f39c12"; // Orange (Active)
    if (status === "found") return "#27ae60"; // Green (Result)
    if (status === "visited") return "#bdc3c7"; // Gray (Backtracked)
    if (status === "visiting") return "#3498db"; // Blue (Current path)
    if (id === "root") return "#2c3e50"; // Dark Blue (Root)
    return "#ecf0f1";
  };

  const getNodeRadius = (depth) => Math.max(12, 20 - depth * 2);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: 20,
        background: "#f5f5f5",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2 style={{ color: "#2c3e50", marginBottom: 10 }}>
        Letter Combinations Backtracking
      </h2>

      {/* Controls */}
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={digits}
          onChange={(e) => setDigits(e.target.value.replace(/[^0-9]/g, ""))}
          disabled={running}
          placeholder="e.g. 23"
          style={{
            padding: "8px",
            fontSize: "16px",
            borderRadius: 4,
            border: "1px solid #ccc",
            width: 100,
          }}
        />
        <button
          onClick={runVisualization}
          disabled={running}
          style={{
            padding: "8px 16px",
            background: running ? "#95a5a6" : "#3498db",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: running ? "default" : "pointer",
          }}
        >
          {running ? "Running..." : "Start"}
        </button>
        <button
          onClick={stop}
          disabled={!running}
          style={{
            padding: "8px 16px",
            background: !running ? "#95a5a6" : "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: !running ? "default" : "pointer",
          }}
        >
          Stop
        </button>
        <button
          onClick={reset}
          disabled={running}
          style={{
            padding: "8px 16px",
            background: running ? "#95a5a6" : "#27ae60",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: running ? "default" : "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {/* Info Panel */}
      <div
        style={{
          display: "flex",
          gap: 20,
          width: "100%",
          maxWidth: 1000,
          marginBottom: 20,
        }}
      >
        {/* Input Map */}
        <div
          style={{
            background: "white",
            padding: 15,
            borderRadius: 8,
            border: "1px solid #ddd",
            flex: 1,
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>
            Phone Mapping
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {Object.entries(digitToLetters).map(([d, l]) => (
              <div
                key={d}
                style={{
                  padding: "4px 8px",
                  background: digits.includes(d) ? "#d5f4e6" : "#f0f0f0",
                  border: digits.includes(d)
                    ? "1px solid #27ae60"
                    : "1px solid #ddd",
                  borderRadius: 4,
                  fontSize: 14,
                }}
              >
                <b>{d}:</b> {l}
              </div>
            ))}
          </div>
        </div>

        {/* Status & Path */}
        <div
          style={{
            background: "white",
            padding: 15,
            borderRadius: 8,
            border: "1px solid #ddd",
            flex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 14, color: "#7f8c8d", marginBottom: 5 }}>
            Status: {status}
          </div>
          <div style={{ fontSize: 18, fontWeight: "bold" }}>
            Current Path:{" "}
            <span style={{ color: "#e67e22" }}>"{currentPath}"</span>
            <span style={{ color: "#bdc3c7" }}>_</span>
          </div>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div style={{ display: "flex", gap: 20, width: "100%", maxWidth: 1000 }}>
        {/* Tree SVG */}
        <div
          style={{
            flex: 3,
            background: "white",
            borderRadius: 8,
            border: "1px solid #bdc3c7",
            overflow: "hidden",
            height: HEIGHT,
          }}
        >
          <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            <defs>
              <marker
                id="arrow"
                markerWidth="10"
                markerHeight="10"
                refX="15"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#bdc3c7" />
              </marker>
            </defs>

            {/* Links */}
            {treeLinks.map((link, i) => {
              const src = treeNodes.find((n) => n.id === link.source);
              const tgt = treeNodes.find((n) => n.id === link.target);
              if (!src || !tgt) return null;
              return (
                <line
                  key={i}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="#bdc3c7"
                  strokeWidth="2"
                />
              );
            })}

            {/* Nodes */}
            {treeNodes.map((node) => (
              <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                <circle
                  r={getNodeRadius(node.depth)}
                  fill={getNodeColor(node.status, node.id)}
                  stroke="#fff"
                  strokeWidth="2"
                  style={{ transition: "fill 0.3s" }}
                />
                <text
                  dy=".35em"
                  textAnchor="middle"
                  fill="white"
                  fontSize={Math.max(10, 16 - node.depth)}
                  fontWeight="bold"
                >
                  {node.val === "Start" ? "R" : node.val}
                </text>
                {/* Tooltip-like label for active node */}
                {node.id === activeNodeId && (
                  <text
                    y={-25}
                    textAnchor="middle"
                    fill="#e67e22"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {node.val === "Start" ? "Root" : node.val}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Results List */}
        <div
          style={{
            flex: 1,
            background: "white",
            borderRadius: 8,
            border: "1px solid #bdc3c7",
            padding: 10,
            height: HEIGHT,
            overflowY: "auto",
          }}
        >
          <h4
            style={{
              marginTop: 0,
              color: "#2c3e50",
              borderBottom: "1px solid #eee",
              paddingBottom: 10,
            }}
          >
            Results ({results.length})
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {results.map((res, i) => (
              <div
                key={i}
                style={{
                  padding: "5px 10px",
                  background: i === results.length - 1 ? "#d5f4e6" : "#f8f9fa",
                  borderRadius: 4,
                  border: "1px solid #eee",
                  fontSize: 14,
                  fontWeight: i === results.length - 1 ? "bold" : "normal",
                  color: "#2c3e50",
                  animation: i === results.length - 1 ? "fadeIn 0.5s" : "none",
                }}
              >
                {i + 1}. "{res}"
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          gap: 15,
          fontSize: 12,
          color: "#555",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#f39c12",
            }}
          />{" "}
          Active
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#3498db",
            }}
          />{" "}
          Visiting
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#27ae60",
            }}
          />{" "}
          Result
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#bdc3c7",
            }}
          />{" "}
          Backtracked
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default LetterCombinationsVisualizerOg;
