import { ArrowRight } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";

export default function MergeTwoListsVisualizer() {
  const [input1, setInput1] = useState("1,2,4");
  const [input2, setInput2] = useState("1,3,4");
  const [running, setRunning] = useState(false);

  // Visual state
  const [list1Nodes, setList1Nodes] = useState([]);
  const [list2Nodes, setList2Nodes] = useState([]);
  const [mergedNodes, setMergedNodes] = useState([]);

  const [ptr1, setPtr1] = useState(0); // list1 pointer index
  const [ptr2, setPtr2] = useState(0); // list2 pointer index
  const [curIdx, setCurIdx] = useState(-1); // current position in merged list

  const [action, setAction] = useState("idle");
  const [status, setStatus] = useState('Click "Start" to merge');
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const timerRef = useRef(null);

  function* mergeSteps(arr1, arr2) {
    let stepNo = 0;
    const merged = []; // Will store values as we build
    let i = 0; // list1 index
    let j = 0; // list2 index

    yield {
      step: stepNo++,
      list1Nodes: arr1,
      list2Nodes: arr2,
      mergedNodes: [],
      ptr1: 0,
      ptr2: 0,
      curIdx: -1,
      action: "init",
      status: `Initialize: dummy node created, cur points to dummy`,
      done: false,
    };

    // Main merge loop: while both lists have nodes
    while (i < arr1.length && j < arr2.length) {
      yield {
        step: stepNo++,
        list1Nodes: arr1,
        list2Nodes: arr2,
        mergedNodes: [...merged],
        ptr1: i,
        ptr2: j,
        curIdx: merged.length - 1,
        action: "compare",
        status: `Compare: list1[${i}]=${arr1[i]} vs list2[${j}]=${arr2[j]}`,
        done: false,
      };

      if (arr1[i] <= arr2[j]) {
        merged.push(arr1[i]);
        yield {
          step: stepNo++,
          list1Nodes: arr1,
          list2Nodes: arr2,
          mergedNodes: [...merged],
          ptr1: i,
          ptr2: j,
          curIdx: merged.length - 1,
          action: "pick_list1",
          status: `list1[${i}]=${arr1[i]} ≤ list2[${j}]=${arr2[j]} → append ${arr1[i]} from list1`,
          done: false,
        };
        i++;
      } else {
        merged.push(arr2[j]);
        yield {
          step: stepNo++,
          list1Nodes: arr1,
          list2Nodes: arr2,
          mergedNodes: [...merged],
          ptr1: i,
          ptr2: j,
          curIdx: merged.length - 1,
          action: "pick_list2",
          status: `list2[${j}]=${arr2[j]} < list1[${i}]=${arr1[i]} → append ${arr2[j]} from list2`,
          done: false,
        };
        j++;
      }

      yield {
        step: stepNo++,
        list1Nodes: arr1,
        list2Nodes: arr2,
        mergedNodes: [...merged],
        ptr1: i,
        ptr2: j,
        curIdx: merged.length - 1,
        action: "advance",
        status: `Advance cur pointer. Merged so far: [${merged.join(", ")}]`,
        done: false,
      };
    }

    // Append remaining nodes from list1 or list2
    if (i < arr1.length) {
      yield {
        step: stepNo++,
        list1Nodes: arr1,
        list2Nodes: arr2,
        mergedNodes: [...merged],
        ptr1: i,
        ptr2: j,
        curIdx: merged.length - 1,
        action: "append_rest",
        status: `list2 exhausted. Append remaining list1: [${arr1.slice(i).join(", ")}]`,
        done: false,
      };
      merged.push(...arr1.slice(i));
    } else if (j < arr2.length) {
      yield {
        step: stepNo++,
        list1Nodes: arr1,
        list2Nodes: arr2,
        mergedNodes: [...merged],
        ptr1: i,
        ptr2: j,
        curIdx: merged.length - 1,
        action: "append_rest",
        status: `list1 exhausted. Append remaining list2: [${arr2.slice(j).join(", ")}]`,
        done: false,
      };
      merged.push(...arr2.slice(j));
    }

    yield {
      step: stepNo++,
      list1Nodes: arr1,
      list2Nodes: arr2,
      mergedNodes: [...merged],
      ptr1: -1,
      ptr2: -1,
      curIdx: merged.length - 1,
      action: "complete",
      status: `✓ Merge complete! Result: [${merged.join(", ")}]`,
      done: true,
    };
  }

  const start = useCallback(() => {
    const arr1 = input1
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
    const arr2 = input2
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

    if (arr1.length === 0 && arr2.length === 0) {
      setStatus("❌ Enter at least one non-empty list");
      return;
    }

    setRunning(true);
    setDone(false);
    setStatus("Starting...");

    const gen = mergeSteps(arr1, arr2);

    const tick = () => {
      const { value } = gen.next();
      if (!value) {
        setRunning(false);
        return;
      }

      setList1Nodes(value.list1Nodes);
      setList2Nodes(value.list2Nodes);
      setMergedNodes(value.mergedNodes);
      setPtr1(value.ptr1);
      setPtr2(value.ptr2);
      setCurIdx(value.curIdx);
      setAction(value.action);
      setStatus(`Step ${value.step}: ${value.status}`);
      setStep(value.step);
      setDone(value.done);

      if (value.done) {
        setTimeout(() => setRunning(false), 1000);
        return;
      }

      timerRef.current = setTimeout(tick, 1000);
    };

    tick();
  }, [input1, input2]);

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
  };

  const reset = () => {
    stop();
    setList1Nodes([]);
    setList2Nodes([]);
    setMergedNodes([]);
    setPtr1(0);
    setPtr2(0);
    setCurIdx(-1);
    setAction("idle");
    setStatus('Click "Start" to merge');
    setStep(0);
    setDone(false);
  };

  useEffect(() => {
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, []);

  const ListRow = ({ nodes, pointer, label, color }) => (
    <div className="h-[100px] overflow-x-scroll">
      <p className="text-title-medium">{label}</p>
      <div className="relative flex gap-4 mt-6">
        {nodes.length === 0 ? (
          <span className="text-title-small text-onSurfaceVarient italic">
            empty / null
          </span>
        ) : (
          nodes.map((val, idx) => (
            <div key={idx} className="relative flex">
              <div
                className={`size-12 rounded-lg flex items-center justify-center  transition-all
                  ${pointer === idx ? `${color} text-white` : "bg-surfaceContainer text-onSurface"}`}
              >
                {val}
              </div>
              {pointer === idx && (
                <div
                  className={`absolute -top-5 left-1/2 -translate-x-1/2 text-label-medium font-bold ${color.replace("bg-", "text-")}`}
                >
                  ptr
                </div>
              )}
              {idx < nodes.length - 1 && (
                <div className="absolute top-1/2 -translate-y-1/2 -right-4 text-onSurfaceVarient">
                  <ArrowRight size={16} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2 w-full text-onSurface **:ease-in **:duration-150 ease-in duration-150">
      {/* Status */}
      <div className="p-2 bg-surfaceContainer text-label-large rounded-md">
        {status}
      </div>

      {/* Visualization */}
      <div
        className={`gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col relative overflow-hidden`}
      >
        <ListRow
          nodes={list1Nodes}
          pointer={ptr1}
          label="List 1"
          color="bg-blue-500"
        />
        <ListRow
          nodes={list2Nodes}
          pointer={ptr2}
          label="List 2"
          color="bg-indigo-500"
        />

        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center gap-4">
          <span className="text-title-small">
            <span>Merged Result</span>
            {curIdx >= 0 && (
              <span className="ml-2 text-label-small bg-primaryContainer text-onPrimaryContainer px-2 py-0.5 rounded">
                cur at index {curIdx}
              </span>
            )}
          </span>
          <div className="flex gap-4 items-center min-h-[60px]">
            {mergedNodes.length === 0 ? (
              <span className="text-onSurfaceVarient text-title-small italic">
                dummy → (building...)
              </span>
            ) : (
              mergedNodes.map((val, idx) => (
                <div key={idx} className="relative flex gap-4">
                  <div
                    className={`size-12 rounded-lg flex items-center justify-center font-bold transition-all
                      ${idx === curIdx ? "bg-green-500 text-white" : "bg-surfaceContainer-highest text-onSurface"}`}
                  >
                    {val}
                  </div>
                  {idx === curIdx && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-label-medium font-bold text-green-500">
                      cur
                    </div>
                  )}
                  {idx < mergedNodes.length - 1 && (
                    <div className="absolute top-1/2 -translate-y-1/2 -right-4 text-onSurfaceVarient">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col items-center gap-2 w-full">
          <FilledTextField
            type="text"
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
            label={input1}
            disabled={running}
            className="w-full"
            placeholder="List 1:"
            supportingText={false}
          />
          <FilledTextField
            type="text"
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
            label={input2}
            disabled={running}
            className="w-full"
            placeholder="List 2:"
            supportingText={false}
          />
        </div>
        <div className="flex items-center gap-2">
          <StandardButtonS
            text={running ? "Running..." : "Start"}
            onClick={start}
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

      {/* Algorithm explanation */}
      <div className="flex flex-col p-4 text-onSecondary bg-secondary rounded-sm">
        <h3 className="text-title-large mb-4">
          Algorithm: Iterative Two-Pointer Merge
        </h3>
        <ol className="text-body-large">
          <li>
            <strong>Create Dummy Node:</strong> Initialize a dummy node to serve
            as the starting point of the merged list. This simplifies edge cases
            (like when one list is empty initially)[web:274][web:276].
          </li>
          <li>
            <strong>Initialize Pointers:</strong> Use a <code>cur</code> pointer
            starting at the dummy node, and keep <code>list1</code> and{" "}
            <code>list2</code> pointers at the heads of their respective
            lists[web:274][web:277].
          </li>
          <li>
            <strong>Compare and Attach:</strong> While both <code>list1</code>{" "}
            and <code>list2</code> are not null:
            <ul className="text-body-large list-disc list-inside">
              <li>
                Compare <code>list1.val</code> with <code>list2.val</code>.
              </li>
              <li>
                Attach the node with the smaller value to <code>cur.next</code>
                [web:274][web:276].
              </li>
              <li>
                Move the pointer of the chosen list forward (
                <code>list1 = list1.next</code> or{" "}
                <code>list2 = list2.next</code>)[web:274].
              </li>
              <li>
                Move <code>cur</code> forward (<code>cur = cur.next</code>
                )[web:274][web:276].
              </li>
            </ul>
          </li>
          <li>
            <strong>Attach Remaining:</strong> After the loop, one list may
            still have nodes. Attach the remaining portion using{" "}
            <code>cur.next = list1 || list2</code>[web:274][web:276].
          </li>
          <li>
            <strong>Return Result:</strong> Return <code>dummy.next</code>,
            which points to the head of the merged list (skipping the dummy
            node)[web:274][web:276].
          </li>
        </ol>

        <p className="text-body-small mt-4 text-onError">
          <p>
            <strong>Time Complexity:</strong> O(n + m) — We traverse both lists
            exactly once, where n and m are the lengths of the two
            lists[web:276].
          </p>
          <p>
            <strong>Space Complexity:</strong> O(1) — We only use a constant
            amount of extra space for pointers (no new nodes are created, just
            rearranged)[web:276].
          </p>
        </p>
      </div>
    </div>
  );
}
