import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useCallback, useRef, useEffect } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";

function RemoveNthVisualizer() {
  const [listInput, setListInput] = useState("1,2,3,4,5");
  const [nInput, setNInput] = useState(2);
  const [list, setList] = useState([1, 2, 3, 4, 5]);
  const [n, setN] = useState(2);
  const [running, setRunning] = useState(false);

  // Animation state
  const [nodes, setNodes] = useState([]);
  const [fastIdx, setFastIdx] = useState(0); // Index of 'head' pointer
  const [slowIdx, setSlowIdx] = useState(0); // Index of 'dummy' pointer
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('Click "Start" to remove node');
  const [finalList, setFinalList] = useState([]);
  const [action, setAction] = useState("idle"); // 'gap', 'move', 'remove', 'done'

  const timerRef = useRef(null);

  const WIDTH = 800;
  const HEIGHT = 400;
  const NODE_RADIUS = 25;
  const GAP = 80;

  // Build steps generator
  function* algorithmSteps(initialList, targetN) {
    let stepCount = 0;

    // Create logical list with dummy node at index 0
    // Real nodes are at indices 1 to length
    const logicalList = [0, ...initialList];
    const len = logicalList.length;

    // Initial state: dummy and head point to index 0 (dummy node)
    // In the code: let res = new ListNode(0, head); let dummy = res;
    // 'head' variable in code starts at real head (index 1), but let's visualize logic carefully.
    // Actually, code says: head starts at real head. dummy starts at dummy node.
    // Let's map indices:
    // Index 0: Dummy Node (res)
    // Index 1..len-1: Real nodes

    let fast = 1; // head (starts at first real node)
    let slow = 0; // dummy (starts at dummy node)

    yield {
      nodes: [...logicalList],
      fast,
      slow,
      action: "init",
      step: stepCount++,
      status: `Initialize: dummy at 0, head at node 1. n=${targetN}`,
      done: false,
    };

    // Move head (fast) n steps
    // Code: for (let i = 0; i < n; i++) head = head.next;
    for (let i = 0; i < targetN; i++) {
      yield {
        nodes: [...logicalList],
        fast,
        slow,
        action: "gap",
        step: stepCount++,
        status: `Move head forward (i=${i}/${targetN})...`,
        done: false,
      };

      // Check if fast goes null (beyond list)
      if (fast < len) {
        fast++;
      }

      yield {
        nodes: [...logicalList],
        fast,
        slow,
        action: "gap",
        step: stepCount++,
        status: `Head is now at index ${fast < len ? fast : "null"}`,
        done: false,
      };
    }

    yield {
      nodes: [...logicalList],
      fast,
      slow,
      action: "gap_done",
      step: stepCount++,
      status: `Gap created. Head is ${targetN} steps ahead of start.`,
      done: false,
    };

    // Move both until head is null
    // Code: while (head) { head = head.next; dummy = dummy.next; }
    while (fast < len) {
      yield {
        nodes: [...logicalList],
        fast,
        slow,
        action: "move",
        step: stepCount++,
        status: `Head exists (idx ${fast}). Move both pointers.`,
        done: false,
      };

      fast++;
      slow++;

      yield {
        nodes: [...logicalList],
        fast,
        slow,
        action: "move",
        step: stepCount++,
        status: `Now: dummy at ${slow}, head at ${fast < len ? fast : "null"}`,
        done: false,
      };
    }

    yield {
      nodes: [...logicalList],
      fast,
      slow,
      action: "ready_remove",
      step: stepCount++,
      status: `Head reached end (null). Dummy is before target node.`,
      done: false,
    };

    // Remove node
    // Code: dummy.next = dummy.next.next;
    const nodeToRemoveIdx = slow + 1;

    if (nodeToRemoveIdx < len) {
      yield {
        nodes: [...logicalList],
        fast,
        slow,
        action: "remove",
        step: stepCount++,
        status: `Removing node at index ${nodeToRemoveIdx} (Value: ${logicalList[nodeToRemoveIdx]})`,
        done: false,
      };

      // Create new list without the node
      const newList = logicalList.filter((_, idx) => idx !== nodeToRemoveIdx);
      // Remove dummy from final result visualization (indices shift)
      const resultValues = newList.slice(1);

      yield {
        nodes: [...newList],
        fast: -1, // Hide pointers
        slow: -1,
        action: "done",
        step: stepCount++,
        status: `✓ Node removed! Result: [${resultValues.join(", ")}]`,
        finalList: resultValues,
        done: true,
      };
    } else {
      // Should not happen with valid input n <= len
      yield {
        nodes: [...logicalList],
        fast,
        slow,
        action: "error",
        step: stepCount++,
        status: `Error: Node to remove is out of bounds.`,
        done: true,
      };
    }
  }

  const runVisualization = useCallback(() => {
    const arr = listInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
    const targetN = parseInt(nInput);

    if (
      arr.length === 0 ||
      isNaN(targetN) ||
      targetN < 1 ||
      targetN > arr.length
    ) {
      setStatus(
        "❌ Invalid input. Ensure list has numbers and 1 <= n <= length."
      );
      return;
    }

    setList(arr);
    setN(targetN);
    setRunning(true);
    setFinalList([]);
    setStep(0);

    const generator = algorithmSteps(arr, targetN);

    const animate = () => {
      const { value } = generator.next();

      if (value) {
        setNodes(value.nodes);
        setFastIdx(value.fast);
        setSlowIdx(value.slow);
        setAction(value.action);
        setStep(value.step);
        setStatus(value.status);

        if (value.finalList) {
          setFinalList(value.finalList);
        }

        if (value.done) {
          setTimeout(() => setRunning(false), 2000);
        } else {
          timerRef.current = setTimeout(animate, 1000);
        }
      } else {
        setRunning(false);
      }
    };

    animate();
  }, [listInput, nInput]);

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
  };

  const reset = () => {
    stop();
    setFinalList([]);
    setStep(0);
    setNodes([]);
    setFastIdx(0);
    setSlowIdx(0);
    setStatus('Click "Start" to remove node');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Helper to draw arrow
  const Arrow = ({ x1, y1, x2, y2, color = "#2c3e50" }) => (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3" />
      <polygon
        points={`${x2},${y2} ${x2 - 8},${y2 - 5} ${x2 - 8},${y2 + 5}`}
        fill={color}
        transform={`rotate(${
          (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
        }, ${x2}, ${y2})`}
      />
    </g>
  );

  return (
    <div className="flex flex-col gap-2 text-onSurface **:ease-in **:duration-150 ease-in duration-150">
      {/* Controls */}
      <div className="flex  flex-col gap-2 flex-wrap">
        <FilledTextField
          type="text"
          value={listInput}
          onChange={(e) => setListInput(e.target.value)}
          label={listInput}
          disabled={running}
          className="flex-1"
          placeholder="List (e.g. 1,2,3,4,5)"
          supportingText={false}
        />
        <FilledTextField
          type="number"
          value={nInput}
          onChange={(e) => setNInput(e.target.value)}
          label={nInput}
          disabled={running}
          className="flex-1"
          placeholder="Nth"
          supportingText={false}
        />
        <div className="flex items-center gap-2">
          <StandardButtonS
            text={running ? "Running..." : "Start"}
            onClick={runVisualization}
            disabled={running}
            className="grow"
          />
          <TonalButton
            text="Stop"
            disabled={!running}
            onClick={stop}
            style="destruction"
            className="grow"
          />
          <TonalButton
            text="Reset"
            disabled={running}
            onClick={reset}
            className="grow"
          />
        </div>
      </div>

      {/* Status */}
      <div className="p-2 bg-surfaceContainer text-label-large rounded-md">
        <strong>Step {step}:</strong> {status}
      </div>

      {/* Visualization Container */}
      <div className="w-full overflow-x-auto bg-surfaceContainer-highest flex items-center rounded-lg relative h-[400px]">
        {/* Layer 1: SVG Connections (Background) */}
        <svg
          width={Math.max(WIDTH, nodes.length * GAP + 100)}
          height={HEIGHT}
          className="absolute top-0 left-0 pointer-events-none"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="28"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#bdc3c7" />
            </marker>
          </defs>

          {nodes.map((_, idx) => {
            const x = 50 + idx * GAP;
            const y = HEIGHT / 2;
            const isTarget = action === "remove" && idx === slowIdx + 1;

            return (
              <g key={`link-${idx}`}>
                {/* Standard Link */}
                {idx < nodes.length - 1 && !isTarget && (
                  //   <Arrow
                  //     x1={x + NODE_RADIUS}
                  //     y1={y}
                  //     x2={x + GAP - NODE_RADIUS - 5}
                  //     y2={y}
                  //     color="#"
                  //   />
                  <ArrowRight
                    className={`absolute text-onSurface`}
                    style={{ translate: `${x + 28}px ${y - 12}px` }}
                  />
                )}

                {/* Removal Curve Link */}
                {action === "remove" && idx === slowIdx && (
                  <path
                    d={`M ${x + NODE_RADIUS} ${y} Q ${x + GAP} ${y - 60} ${
                      x + GAP * 2 - NODE_RADIUS - 5
                    } ${y}`}
                    fill="none"
                    stroke="#e74c3c"
                    strokeWidth="3"
                    markerEnd="url(#arrowhead)"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Layer 2: HTML Nodes & Labels (Foreground) */}
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{ width: Math.max(WIDTH, nodes.length * GAP + 100) }}
        >
          {nodes.map((val, idx) => {
            const x = 50 + idx * GAP;
            const y = HEIGHT / 2;
            const isDummy = idx === 0 && action !== "done";
            const isTarget = action === "remove" && idx === slowIdx + 1;

            return (
              <div key={`node-${idx}`}>
                {/* Node Circle */}
                <div
                  className={`absolute flex items-center justify-center rounded-full shadow-sm transition-colors duration-300
              ${
                isDummy
                  ? "bg-inverseSurface text-inverseOnSurface"
                  : isTarget
                  ? "bg-red-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
                  style={{
                    width: NODE_RADIUS * 2,
                    height: NODE_RADIUS * 2,
                    left: x - NODE_RADIUS,
                    top: y - NODE_RADIUS,
                  }}
                >
                  <span className="font-bold text-sm">
                    {isDummy ? "D" : val}
                  </span>
                </div>

                {/* Index Label */}
                <span
                  className="absolute text-xs text-onSurfaceVariant font-medium text-center"
                  style={{
                    left: x - 20,
                    top: y + NODE_RADIUS + 8,
                    width: 40,
                  }}
                >
                  [{idx}]
                </span>
              </div>
            );
          })}

          {/* Pointer Text Labels (HTML for better text rendering) */}
          {slowIdx >= 0 && slowIdx < nodes.length && action !== "done" && (
            <div
              className="absolute flex flex-col items-center justify-center text-center text-orange-500 font-bold text-sm"
              style={{
                left: 50 + slowIdx * GAP - 40,
                top: HEIGHT / 2 - 90,
                width: 80,
              }}
            >
              dummy (slow)
              <ChevronDown />
            </div>
          )}

          {fastIdx >= 0 && fastIdx < nodes.length && action !== "done" && (
            <div
              className="absolute text-center flex flex-col items-center justify-center text-indigo-500 font-bold text-sm"
              style={{
                left: 50 + fastIdx * GAP - 40,
                top: HEIGHT / 2 + 50,
                width: 80,
              }}
            >
              <ChevronUp />
              head (fast)
            </div>
          )}

          {/* Null Pointer Case */}
          {fastIdx >= nodes.length &&
            action !== "done" &&
            action !== "init" && (
              <div
                className="absolute text-center text-indigo-500 font-bold text-sm flex flex-col items-center"
                style={{
                  left: 50 + nodes.length * GAP - 40,
                  top: HEIGHT / 2 + 10,
                  width: 80,
                }}
              >
                <div className="w-10 h-6 border-2 border-dashed border-indigo-500 mb-1"></div>
                head (null)
              </div>
            )}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 w-full flex-wrap">
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-inverseSurface rounded-full"></div>
          <span>Dummy Node</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-blue-500 rounded-full"></div>
          <span>List Node</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-red-500 rounded-full"></div>
          <span>Target Node</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-orange-500 rounded-full"></div>
          <span>Slow Pointer</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-indigo-500 rounded-full"></div>
          <span>Fast Pointer</span>
        </div>
      </div>

      {/* Explanation */}
      <div className="flex flex-col p-4 text-onSecondary bg-secondary rounded-sm">
        <h3 className="text-title-large mb-4">
          Two-Pointer Algorithm (One Pass)
        </h3>
        <ol className="text-body-large">
          <li>
            <strong>Dummy Node:</strong> Create a dummy node pointing to the
            head to handle edge cases (like removing the first node)
            easily.[web:254][web:261]
          </li>
          <li>
            <strong>Create Gap:</strong> Move the <code>fast</code> (head)
            pointer <code>n</code> steps ahead of the <code>slow</code> (dummy)
            pointer.[web:257][web:263]
          </li>
          <li>
            <strong>Move Together:</strong> Move both pointers one step at a
            time until <code>fast</code> reaches the end (null). At this point,{" "}
            <code>slow</code> will be at the node <em>before</em> the one we
            want to remove.[web:258][web:263]
          </li>
          <li>
            <strong>Remove:</strong> Update <code>slow.next</code> to skip the
            target node (<code>slow.next = slow.next.next</code>
            ).[web:259][web:261]
          </li>
        </ol>
      </div>
    </div>
  );
}

export default RemoveNthVisualizer;
