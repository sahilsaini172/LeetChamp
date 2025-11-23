import React, { useState, useCallback, useRef, useEffect } from "react";
import StandardButton from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";
import FilledTextField from "../components/textFields/FilledTextField";

// ListNode class
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

function AddTwoNumbersVisualizer() {
  const [list1Input, setList1Input] = useState("2,4,3");
  const [list2Input, setList2Input] = useState("5,6,4");
  const [running, setRunning] = useState(false);
  const [l1Array, setL1Array] = useState([]);
  const [l2Array, setL2Array] = useState([]);
  const [resultArray, setResultArray] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [carry, setCarry] = useState(0);
  const [total, setTotal] = useState(0);
  const [currentNum, setCurrentNum] = useState(null);
  const [stepNumber, setStepNumber] = useState(0);
  const [status, setStatus] = useState('Click "Start" to add the linked lists');
  const [finalResult, setFinalResult] = useState(null);

  const animationRef = useRef(null);

  const width = 1100;
  const height = 750;

  // Convert array to linked list
  const arrayToList = (arr) => {
    if (!arr.length) return null;
    const dummy = new ListNode();
    let current = dummy;
    for (const val of arr) {
      current.next = new ListNode(val);
      current = current.next;
    }
    return dummy.next;
  };

  // Convert linked list to array (for display)
  const listToArray = (head) => {
    const arr = [];
    while (head) {
      arr.push(head.val);
      head = head.next;
    }
    return arr;
  };

  // Add two numbers algorithm generator
  function* addTwoNumbersGenerator(l1, l2) {
    const l1Arr = listToArray(l1);
    const l2Arr = listToArray(l2);

    yield {
      l1Array: l1Arr,
      l2Array: l2Arr,
      resultArray: [],
      index: -1,
      carry: 0,
      total: 0,
      currentNum: null,
      step: 0,
      status: `Starting: List1=[${l1Arr.join(" → ")}], List2=[${l2Arr.join(
        " → "
      )}]`,
      done: false,
    };

    let dummy = new ListNode();
    let res = dummy;
    let total = 0,
      carry = 0;
    let index = 0;
    let step = 1;
    const result = [];

    while (l1 || l2 || carry) {
      total = carry;

      yield {
        l1Array: l1Arr,
        l2Array: l2Arr,
        resultArray: [...result],
        index,
        carry,
        total,
        currentNum: null,
        step: step++,
        status: `Position ${index}: Starting with carry = ${carry}`,
        done: false,
      };

      if (l1) {
        total += l1.val;
        yield {
          l1Array: l1Arr,
          l2Array: l2Arr,
          resultArray: [...result],
          index,
          carry,
          total,
          currentNum: null,
          step: step++,
          status: `Position ${index}: Add L1[${index}]=${l1.val} → total = ${total}`,
          done: false,
        };
        l1 = l1.next;
      }

      if (l2) {
        total += l2.val;
        yield {
          l1Array: l1Arr,
          l2Array: l2Arr,
          resultArray: [...result],
          index,
          carry,
          total,
          currentNum: null,
          step: step++,
          status: `Position ${index}: Add L2[${index}]=${l2.val} → total = ${total}`,
          done: false,
        };
        l2 = l2.next;
      }

      let num = total % 10;
      carry = Math.floor(total / 10);

      yield {
        l1Array: l1Arr,
        l2Array: l2Arr,
        resultArray: [...result],
        index,
        carry,
        total,
        currentNum: num,
        step: step++,
        status: `Position ${index}: total=${total} → digit=${num}, new carry=${carry}`,
        done: false,
      };

      result.push(num);
      dummy.next = new ListNode(num);
      dummy = dummy.next;

      yield {
        l1Array: l1Arr,
        l2Array: l2Arr,
        resultArray: [...result],
        index,
        carry,
        total,
        currentNum: num,
        step: step++,
        status: `Position ${index}: Added ${num} to result list`,
        done: false,
      };

      index++;
    }

    yield {
      l1Array: l1Arr,
      l2Array: l2Arr,
      resultArray: result,
      index: -1,
      carry: 0,
      total: 0,
      currentNum: null,
      step: step++,
      status: `✓ Addition complete! Result: [${result.join(" → ")}]`,
      done: true,
    };

    return { result: res.next };
  }

  // Parse input and validate
  const parseInput = (input) => {
    try {
      const arr = input.split(",").map((s) => {
        const num = parseInt(s.trim());
        if (isNaN(num) || num < 0 || num > 9) throw new Error("Invalid");
        return num;
      });
      return arr;
    } catch {
      return null;
    }
  };

  // Run visualization
  const runVisualization = useCallback(() => {
    const l1Arr = parseInput(list1Input);
    const l2Arr = parseInput(list2Input);

    if (!l1Arr || !l2Arr || l1Arr.length === 0 || l2Arr.length === 0) {
      setStatus(
        "❌ Please enter valid lists (single digits 0-9, comma-separated)"
      );
      return;
    }

    setRunning(true);
    setFinalResult(null);
    setStepNumber(0);

    const l1 = arrayToList(l1Arr);
    const l2 = arrayToList(l2Arr);
    const generator = addTwoNumbersGenerator(l1, l2);

    const animate = () => {
      const { value, done } = generator.next();

      if (value) {
        setL1Array(value.l1Array);
        setL2Array(value.l2Array);
        setResultArray(value.resultArray);
        setCurrentIndex(value.index);
        setCarry(value.carry);
        setTotal(value.total);
        setCurrentNum(value.currentNum);
        setStepNumber(value.step);
        setStatus(value.status);

        if (value.done) {
          setFinalResult(value.resultArray);
          setTimeout(() => {
            setRunning(false);
            setCurrentIndex(-1);
          }, 2000);
        } else {
          animationRef.current = setTimeout(animate, 1000);
        }
      } else {
        setRunning(false);
      }
    };

    animate();
  }, [list1Input, list2Input]);

  // Stop visualization
  const stopVisualization = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setRunning(false);
    setCurrentIndex(-1);
  };

  // Reset
  const reset = () => {
    stopVisualization();
    setFinalResult(null);
    setStepNumber(0);
    setResultArray([]);
    setCarry(0);
    setTotal(0);
    setCurrentNum(null);
    setStatus('Click "Start" to add the linked lists');
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  const maxLength = Math.max(
    l1Array.length,
    l2Array.length,
    resultArray.length
  );

  return (
    <div className="flex flex-col gap-2 text-onSurface **:ease-in **:duration-150 ease-in duration-150">
      <h2 className="text-headline-medium">
        Add Two Numbers <span className="inline-flex">(Linked Lists)</span>
      </h2>
      <p className="text-body-small">
        Watch digit-by-digit addition with carry propagation through linked
        lists
      </p>
      {/* Status */}
      <div className={`p-2 bg-surfaceContainer text-label-large rounded-md `}>
        Step {stepNumber}: {status}
      </div>

      {/* SVG Visualization */}
      <div
        className={`gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col relative `}
      >
        {/* Title */}
        <p className="text-center top-4 text-label-medium">
          Linked List Addition Process
        </p>

        {/* List 1 */}
        <div className="h-[82px] relative">
          <span className="text-title-medium text-hard">List 1:</span>
          {l1Array.map((val, index) => {
            const x = index * 55;
            const y = 20;
            const isCurrent = index === currentIndex;

            return (
              <div key={index} className="relative">
                {/* Node */}
                <div
                  className={`absolute flex mt-2 rounded-lg items-center justify-center size-12 ${
                    isCurrent ? "bg-primary" : "bg-inverseSurface"
                  } text-white`}
                  style={{ translate: `${x}px` }}
                >
                  <span
                    className={
                      isCurrent ? "text-onPrimary" : "text-inverseOnSurface"
                    }
                  >
                    {val}
                  </span>
                </div>

                {/* SVG Overlay for Arrows */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="10"
                      refX="8"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3, 0 6" fill="#ffffff" />
                    </marker>
                  </defs>

                  {l1Array.map((val, index) => {
                    if (index >= l1Array.length - 1) return null;

                    const x1 = index * 60 + 48; // Start from right edge of node (48 = 12*4 size)
                    const x2 = (index + 1) * 60; // End at left edge of next node
                    const y = 32; // Middle of the node vertically

                    return (
                      <line
                        key={index}
                        x1={x1}
                        y1={y}
                        x2={x2}
                        y2={y}
                        stroke="#7f8c8d"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    );
                  })}
                </svg>
              </div>
            );
          })}
        </div>

        {/* List 2 */}
        <div className="h-[82px] relative">
          <span className="text-title-medium text-medium">List 2:</span>
          {l2Array.map((val, index) => {
            const x = index * 55;
            const y = 20;
            const isCurrent = index === currentIndex;

            return (
              <div key={index} className="relative">
                {/* Node */}
                <div
                  className={`absolute flex mt-2 rounded-lg items-center justify-center size-12 ${
                    isCurrent ? "bg-error" : "bg-inverseSurface"
                  } text-white`}
                  style={{ translate: `${x}px` }}
                >
                  <span
                    className={
                      isCurrent ? "text-onError" : "text-inverseOnSurface"
                    }
                  >
                    {val}
                  </span>
                </div>

                {/* Arrow */}
                {index < l2Array.length - 1 && (
                  <>
                    <line
                      x1={x + 55}
                      y1={y + 30}
                      x2={x + 100}
                      y2={y + 30}
                      stroke="#7f8c8d"
                      strokeWidth="2"
                    />
                    <polygon
                      points={`${x + 100},${y + 30} ${x + 95},${y + 25} ${
                        x + 95
                      },${y + 35}`}
                      fill="#7f8c8d"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Computation box */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md h-[90px] text-center">
          <span className="text-title-small mb-4">Current Computation</span>
          {currentIndex >= 0 && (
            <>
              <div className="flex items-center text-body-small">
                <p className="w-1/3">
                  L1[{currentIndex}] ={" "}
                  <span className="text-primary font-bold">
                    {l1Array[currentIndex] || 0}
                  </span>
                </p>
                <p className="w-1/3">
                  Carry = <span className=" font-bold">{carry}</span>
                </p>
                <p className="w-1/3"></p>
              </div>
              <div className="flex items-center text-body-small">
                <p className="w-1/3">
                  L2[{currentIndex}] ={" "}
                  <span className="text-error  font-bold">
                    {l2Array[currentIndex] || 0}
                  </span>
                </p>
                <p className="w-1/3">
                  Total = <span className=" font-bold">{total}</span>
                </p>
                {currentNum !== null && (
                  <p className="w-1/3">
                    Result Digit:{" "}
                    <span className=" font-bold">{currentNum}</span>
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Result List */}
        <div className="h-[82px] relative">
          <span className="text-title-medium text-easy">Result:</span>
          {resultArray.map((val, index) => {
            const x = index * 55;
            const y = 20;
            const isNew =
              index === resultArray.length - 1 && currentNum === val;

            return (
              <div key={index}>
                {/* Node */}
                <div
                  className={`absolute flex mt-2 rounded-lg items-center justify-center size-12 ${
                    isNew ? "bg-easy" : "bg-surfaceContainer"
                  } text-white`}
                  style={{ translate: `${x}px` }}
                >
                  <span
                    className={isNew ? "text-black" : "text-onSurfaceVarient"}
                  >
                    {val}
                  </span>
                </div>
                {/* Arrow */}
                {index < resultArray.length - 1 && (
                  <>
                    <line
                      x1={x + 55}
                      y1={y + 30}
                      x2={x + 100}
                      y2={y + 30}
                      stroke="#27ae60"
                      strokeWidth="2"
                    />
                    <polygon
                      points={`${x + 100},${y + 30} ${x + 95},${y + 25} ${
                        x + 95
                      },${y + 35}`}
                      fill="#27ae60"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Carry indicator */}
        <div className="flex items-center gap-2">
          <span>Carry Forward:</span>
          <span className="font-bold text-easy">{carry}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex  flex-col gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <StandardButton
            text={running ? "Adding..." : "Start Addition"}
            onClick={runVisualization}
            disabled={running}
            className="grow"
          />
          <StandardButton
            onClick={stopVisualization}
            disabled={!running}
            text={"Stop"}
            style="destruction"
            className=""
          />
        </div>
        <TonalButton text={"Reset"} onClick={reset} disabled={running} />
        <FilledTextField
          type="text"
          placeholder="List 1"
          label={true}
          value={list1Input}
          disabled={running}
          onChange={(e) => setList1Input(e.target.value)}
          supporting="Enter list elements"
        />
        <FilledTextField
          type="text"
          placeholder="List 2"
          label={true}
          value={list2Input}
          onChange={(e) => setList2Input(e.target.value)}
          disabled={running}
          supporting="Enter list elements"
          className="my-6"
        />
      </div>

      {/* Algorithm explanation */}
      <div className="flex flex-col p-4 text-onSecondary bg-secondary rounded-sm">
        <h3 className="text-title-large mb-4">Add Two Numbers Algorithm:</h3>
        <ol className="text-body-large">
          <li>
            <strong>Initialize:</strong> Create dummy node, set result pointer,
            carry = 0
          </li>
          <li>
            <strong>Loop condition:</strong> Continue while l1 OR l2 OR carry
            exists
          </li>
          <li>
            <strong>Start with carry:</strong> Set total = carry from previous
            iteration
          </li>
          <li>
            <strong>Add l1 value:</strong> If l1 exists, add l1.val to total and
            move to l1.next
          </li>
          <li>
            <strong>Add l2 value:</strong> If l2 exists, add l2.val to total and
            move to l2.next
          </li>
          <li>
            <strong>Calculate digit:</strong> Result digit = total % 10
            (remainder)
          </li>
          <li>
            <strong>Calculate carry:</strong> New carry = Math.floor(total / 10)
          </li>
          <li>
            <strong>Create node:</strong> Add new node with result digit to
            output list
          </li>
          <li>
            <strong>Return:</strong> Return dummy.next (skip dummy head)
          </li>
        </ol>
        <p className="text-body-small mt-4 text-onError">
          <strong>Note:</strong> The numbers are stored in reverse order (least
          significant digit first), so 342 is represented as [2,4,3].
        </p>
      </div>
    </div>
  );
}

export default AddTwoNumbersVisualizer;
