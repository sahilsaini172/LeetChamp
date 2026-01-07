import React, { useState, useCallback, useRef, useEffect } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";

function LetterCombinationsVisualizer() {
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
    if (id === activeNodeId) return "fill-orange-500 text-white"; // Orange (Active)
    if (status === "found") return "fill-green-500 text-white"; // Green (Result)
    if (status === "visited")
      return "fill-surfaceContainer-low text-inverseOnSurface"; // Gray (Backtracked)
    if (status === "visiting") return "fill-blue-500 text-white"; // Blue (Current path)
    if (id === "root") return "fill-indigo-500 text-white"; // Dark Blue (Root)
    return "fill-inverseSurface";
  };

  const getNodeTextColor = (status, id) => {
    if (id === activeNodeId) return "fill-white"; // Orange (Active)
    if (status === "found") return "fill-white"; // Green (Result)
    if (status === "visited") return "fill-onSurface"; // Gray (Backtracked)
    if (status === "visiting") return "fill-white"; // Blue (Current path)
    if (id === "root") return "fill-white"; // Dark Blue (Root)
    return "fill-onSurface";
  };

  const getNodeRadius = (depth) => Math.max(12, 30 - depth * 2);

  return (
    <div className="flex flex-col w-full gap-2 text-onSurface **:ease-in **:duration-150 ease-in duration-150">


      {/* Status & Path */}
      <div
        className={`p-2 flex flex-col gap-1 bg-surfaceContainer text-label-large rounded-md `}
      >
        <div>Status: {status}</div>
        <div className="text-title-large">
          Current Path: <span className="text-orange-500">"{currentPath}"</span>
          <span>_</span>
        </div>
      </div>

      {/* Info Panel */}
      <div
        className={`gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col relative `}
      >
        {/* Input Map */}
        <p className="text-center text-label-medium">Phone Mapping</p>
        <div className="flex items-center gap-1 justify-between flex-wrap">
          {Object.entries(digitToLetters).map(([d, l]) => (
            <div
              className={`${
                digits.includes(d)
                  ? "bg-green-500 text-white"
                  : "bg-surfaceContainer-low text-onSurfaceVarient"
              } text-body-small p-2 flex items-center justify-center rounded-md grow`}
              key={d}
            >
              <b>{d}:</b> {l}
            </div>
          ))}
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center max-h-1/2">
        {/* Tree SVG */}
        <div className="flex-1">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="overflow-scroll"
          >
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
                <path d="M0,0 L0,6 L9,3 z" className="fill-outlineVarient" />
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
                  className="stroke-onSurfaceVarient"
                  strokeWidth="2"
                />
              );
            })}

            {/* Nodes */}
            {treeNodes.map((node) => (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                className="overflow-auto"
              >
                <circle
                  r={getNodeRadius(node.depth)}
                  className={getNodeColor(node.status, node.id)}
                  style={{ transition: "fill 0.3s" }}
                />
                <text
                  dy=".35em"
                  textAnchor="middle"
                  className={getNodeTextColor(node.status, node.id)}
                  fontSize={Math.max(10, 20 - node.depth)}
                  fontWeight="bold"
                >
                  {node.val === "Start" ? "R" : node.val}
                </text>
                {/* Tooltip-like label for active node */}
                {node.id === activeNodeId && (
                  <text
                    y={-38}
                    textAnchor="middle"
                    fill="#e67e22"
                    fontSize="16"
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
        <div className="p-2 bg-surfaceContainer flex flex-col rounded-md text-center max-h-24 overflow-scroll">
          <span className="text-title-small mb-4">
            Results ({results.length})
          </span>
          <div className="flex gap-1 overflow-x-scroll">
            {results.map((res, i) => (
              <div
                key={i}
                className={`flex items-center justify-center shrink-0 py-2 px-4 text-title-small ${
                  i === results.length - 1
                    ? "bg-green-500/10 text-green-500"
                    : "bg-surfaceContainer-high text-onSurface"
                } rounded-sm ease-in duration-100`}
              >
                {i + 1}. "{res}"
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 w-full flex-wrap">
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-orange-500 rounded-full"></div>
          <span>Active</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-blue-500 rounded-full"></div>
          <span>Visiting</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-green-400 rounded-full"></div>
          <span>Result</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-surfaceContainer-low rounded-full"></div>
          <span>Backtracked</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex  flex-col gap-2 flex-wrap">
        <FilledTextField
          type="text"
          placeholder="Enter Number"
          label={true}
          value={digits}
          disabled={running}
          onChange={(e) => setDigits(e.target.value)}
          supportingText={false}
        />
        <div className="flex items-center gap-2">
          <StandardButtonS
            text={running ? "Running..." : "Start"}
            onClick={runVisualization}
            disabled={running}
            className="grow"
          />
          <StandardButtonS
            onClick={stop}
            disabled={!running}
            text={"Stop"}
            style="destruction"
            className=""
          />
          <TonalButton text={"Reset"} onClick={reset} disabled={running} />
        </div>
      </div>

      {/* Algorithm explanation */}
      <div className="flex flex-col p-4 text-onSecondary bg-secondary rounded-sm">
        <h3 className="text-title-large mb-4">
          Algorithm: Backtracking (DFS)
        </h3>

        <ol className="text-body-large">
          <li>
            <strong>Mapping:</strong> Create a map linking each digit (2-9) to
            its corresponding letters (e.g., '2' → "abc").[web:227][web:243]
          </li>
          <li>
            <strong>Base Case:</strong> If the current combination length equals
            the input digits length, add it to the results and
            return.[web:227][web:247]
          </li>
          <li>
            <strong>Recursive Step:</strong>
            <ul className="text-body-large">
              <li>
                Get the current digit at <code>index</code>.
              </li>
              <li>Iterate through all possible letters for that digit.</li>
              <li>
                For each letter, append it to the current path and call the
                function recursively for <code>index + 1</code>.
              </li>
              <li>
                After the recursive call returns (backtracks), the loop
                continues to the next letter.[web:227][web:243]
              </li>
            </ul>
          </li>
          <li>
            <strong>Start:</strong> Initiate the recursion with index 0 and an
            empty string.[web:227][web:247]
          </li>
        </ol>

        <p className="text-body-small mt-4 text-onError">
          <strong>Time Complexity:</strong> O(4ⁿ · n), where n is the length of
          digits. The 4ⁿ comes from the worst case (digits 7 and 9 have 4
          letters), and n accounts for building the string.[web:245][web:248]
          <br />
          <strong>Space Complexity:</strong> O(n) for the recursion stack
          depth.[web:248]
        </p>
      </div>
    </div>
  );
}

export default LetterCombinationsVisualizer;
