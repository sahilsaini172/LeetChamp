import { ChevronDown, ChevronsDown } from "lucide-react";
import React, { useState, useCallback, useRef, useEffect } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";

function MedianSortedArraysVisualizer() {
  const [nums1Input, setNums1Input] = useState("1,3");
  const [nums2Input, setNums2Input] = useState("2");
  const [running, setRunning] = useState(false);
  const [nums1, setNums1] = useState([]);
  const [nums2, setNums2] = useState([]);
  const [merged, setMerged] = useState([]);
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [currentMin, setCurrentMin] = useState(null);
  const [medianPos, setMedianPos] = useState([]);
  const [median, setMedian] = useState(null);
  const [stepNumber, setStepNumber] = useState(0);
  const [status, setStatus] = useState('Click "Start" to find median');
  const [finalResult, setFinalResult] = useState(null);
  const [isEven, setIsEven] = useState(false);

  const animationRef = useRef(null);

  // Parse input
  const parseInput = (input) => {
    try {
      if (!input.trim()) return [];
      const arr = input.split(",").map((s) => {
        const num = parseInt(s.trim());
        if (isNaN(num)) throw new Error("Invalid");
        return num;
      });
      return arr;
    } catch {
      return null;
    }
  };

  // Median algorithm generator
  function* medianGenerator(nums1, nums2) {
    let m = nums1.length;
    let n = nums2.length;
    let p1 = 0;
    let p2 = 0;
    let step = 0;
    const merged = [];
    const totalLength = m + n;
    const isEvenLength = totalLength % 2 === 0;

    yield {
      nums1: [...nums1],
      nums2: [...nums2],
      merged: [],
      p1: 0,
      p2: 0,
      currentMin: null,
      medianPos: [],
      median: null,
      step: step++,
      status: `Arrays: nums1=[${nums1.join(",")}], nums2=[${nums2.join(
        ","
      )}]. Total length: ${totalLength} (${isEvenLength ? "even" : "odd"})`,
      isEven: isEvenLength,
      targetIndex: 0,
      done: false,
    };

    const getMin = function () {
      if (p1 < m && p2 < n) {
        return nums1[p1] < nums2[p2]
          ? { val: nums1[p1++], from: "nums1" }
          : { val: nums2[p2++], from: "nums2" };
      } else if (p1 < m) {
        return { val: nums1[p1++], from: "nums1" };
      } else if (p2 < n) {
        return { val: nums2[p2++], from: "nums2" };
      }
      return { val: -1, from: "none" };
    };

    if (isEvenLength) {
      const targetIdx = totalLength / 2 - 1;

      yield {
        nums1: [...nums1],
        nums2: [...nums2],
        merged: [...merged],
        p1,
        p2,
        currentMin: null,
        medianPos: [targetIdx, targetIdx + 1],
        median: null,
        step: step++,
        status: `Even length: Need elements at positions ${targetIdx} and ${
          targetIdx + 1
        }`,
        isEven: isEvenLength,
        targetIndex: targetIdx,
        done: false,
      };

      // Skip to position before median
      for (let i = 0; i < targetIdx; i++) {
        yield {
          nums1: [...nums1],
          nums2: [...nums2],
          merged: [...merged],
          p1,
          p2,
          currentMin: null,
          medianPos: [targetIdx, targetIdx + 1],
          median: null,
          step: step++,
          status: `Skipping element ${i + 1} (not needed for median)`,
          isEven: isEvenLength,
          targetIndex: i,
          done: false,
        };

        const minObj = getMin();
        merged.push(minObj.val);

        yield {
          nums1: [...nums1],
          nums2: [...nums2],
          merged: [...merged],
          p1,
          p2,
          currentMin: minObj,
          medianPos: [targetIdx, targetIdx + 1],
          median: null,
          step: step++,
          status: `Got ${minObj.val} from ${minObj.from}, p1=${p1}, p2=${p2}`,
          isEven: isEvenLength,
          targetIndex: i,
          done: false,
        };
      }

      // Get first median element
      yield {
        nums1: [...nums1],
        nums2: [...nums2],
        merged: [...merged],
        p1,
        p2,
        currentMin: null,
        medianPos: [targetIdx, targetIdx + 1],
        median: null,
        step: step++,
        status: `Getting first median element at position ${targetIdx}`,
        isEven: isEvenLength,
        targetIndex: targetIdx,
        done: false,
      };

      const first = getMin();
      merged.push(first.val);

      yield {
        nums1: [...nums1],
        nums2: [...nums2],
        merged: [...merged],
        p1,
        p2,
        currentMin: first,
        medianPos: [targetIdx, targetIdx + 1],
        median: null,
        step: step++,
        status: `First median element: ${first.val} from ${first.from}`,
        isEven: isEvenLength,
        targetIndex: targetIdx,
        done: false,
      };

      // Get second median element
      yield {
        nums1: [...nums1],
        nums2: [...nums2],
        merged: [...merged],
        p1,
        p2,
        currentMin: null,
        medianPos: [targetIdx, targetIdx + 1],
        median: null,
        step: step++,
        status: `Getting second median element at position ${targetIdx + 1}`,
        isEven: isEvenLength,
        targetIndex: targetIdx + 1,
        done: false,
      };

      const second = getMin();
      merged.push(second.val);

      yield {
        nums1: [...nums1],
        nums2: [...nums2],
        merged: [...merged],
        p1,
        p2,
        currentMin: second,
        medianPos: [targetIdx, targetIdx + 1],
        median: null,
        step: step++,
        status: `Second median element: ${second.val} from ${second.from}`,
        isEven: isEvenLength,
        targetIndex: targetIdx + 1,
        done: false,
      };

      const medianValue = (first.val + second.val) / 2.0;

      yield {
        nums1: [...nums1],
        nums2: [...nums2],
        merged: [...merged],
        p1,
        p2,
        currentMin: null,
        medianPos: [targetIdx, targetIdx + 1],
        median: medianValue,
        step: step++,
        status: `✓ Median = (${first.val} + ${second.val}) / 2 = ${medianValue}`,
        isEven: isEvenLength,
        targetIndex: targetIdx + 1,
        done: true,
      };

      return { median: medianValue };
    } else {
      // Odd length
      const targetIdx = Math.floor(totalLength / 2);

      yield {
        nums1: [...nums1],
        nums2: [...nums2],
        merged: [...merged],
        p1,
        p2,
        currentMin: null,
        medianPos: [targetIdx],
        median: null,
        step: step++,
        status: `Odd length: Need element at position ${targetIdx}`,
        isEven: isEvenLength,
        targetIndex: targetIdx,
        done: false,
      };

      // Skip to median position
      for (let i = 0; i < targetIdx; i++) {
        yield {
          nums1: [...nums1],
          nums2: [...nums2],
          merged: [...merged],
          p1,
          p2,
          currentMin: null,
          medianPos: [targetIdx],
          median: null,
          step: step++,
          status: `Skipping element ${i + 1} (not needed for median)`,
          isEven: isEvenLength,
          targetIndex: i,
          done: false,
        };

        const minObj = getMin();
        merged.push(minObj.val);

        yield {
          nums1: [...nums1],
          nums2: [...nums2],
          merged: [...merged],
          p1,
          p2,
          currentMin: minObj,
          medianPos: [targetIdx],
          median: null,
          step: step++,
          status: `Got ${minObj.val} from ${minObj.from}, p1=${p1}, p2=${p2}`,
          isEven: isEvenLength,
          targetIndex: i,
          done: false,
        };
      }

      // Get median element
      yield {
        nums1: [...nums1],
        nums2: [...nums2],
        merged: [...merged],
        p1,
        p2,
        currentMin: null,
        medianPos: [targetIdx],
        median: null,
        step: step++,
        status: `Getting median element at position ${targetIdx}`,
        isEven: isEvenLength,
        targetIndex: targetIdx,
        done: false,
      };

      const medianObj = getMin();
      merged.push(medianObj.val);

      yield {
        nums1: [...nums1],
        nums2: [...nums2],
        merged: [...merged],
        p1,
        p2,
        currentMin: medianObj,
        medianPos: [targetIdx],
        median: medianObj.val,
        step: step++,
        status: `✓ Median = ${medianObj.val} from ${medianObj.from}`,
        isEven: isEvenLength,
        targetIndex: targetIdx,
        done: true,
      };

      return { median: medianObj.val };
    }
  }

  // Run visualization
  const runVisualization = useCallback(() => {
    const arr1 = parseInput(nums1Input);
    const arr2 = parseInput(nums2Input);

    if (arr1 === null || arr2 === null) {
      setStatus("❌ Please enter valid arrays (integers, comma-separated)");
      return;
    }

    if (arr1.length === 0 && arr2.length === 0) {
      setStatus("❌ At least one array must have elements");
      return;
    }

    setRunning(true);
    setFinalResult(null);
    setStepNumber(0);

    const generator = medianGenerator(arr1, arr2);

    const animate = () => {
      const { value, done } = generator.next();

      if (value) {
        setNums1(value.nums1);
        setNums2(value.nums2);
        setMerged(value.merged);
        setP1(value.p1);
        setP2(value.p2);
        setCurrentMin(value.currentMin);
        setMedianPos(value.medianPos);
        setMedian(value.median);
        setStepNumber(value.step);
        setStatus(value.status);
        setIsEven(value.isEven);
        setTargetIndex(value.targetIndex);

        if (value.done) {
          setFinalResult(value.median);
          setTimeout(() => {
            setRunning(false);
          }, 2000);
        } else {
          animationRef.current = setTimeout(animate, 900);
        }
      } else {
        setRunning(false);
      }
    };

    animate();
  }, [nums1Input, nums2Input]);

  // Stop visualization
  const stopVisualization = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setRunning(false);
  };

  // Reset
  const reset = () => {
    stopVisualization();
    setFinalResult(null);
    setStepNumber(0);
    setMerged([]);
    setP1(0);
    setP2(0);
    setCurrentMin(null);
    setMedianPos([]);
    setMedian(null);
    setStatus('Click "Start" to find median');
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full text-onSurface **:ease-in **:duration-150 ease-in duration-150">
      <h2 className="text-headline-medium">Median of Two Sorted Arrays</h2>

      {/* Status */}
      <div className="p-2 bg-surfaceContainer text-label-large rounded-md">
        Step {stepNumber}: {status}
      </div>

      {/* SVG Visualization */}
      <div
        className={`gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col relative overflow-hidden`}
      >
        {/* Title */}
        <p className="text-center top-4 left-[50%] -translate-x-[50%] absolute text-label-medium">
          Two-Pointer Merge Approach
        </p>

        {/* nums1 array */}
        <div className="h-[130px] overflow-x-scroll mt-6">
          <p className="text-title-medium">nums1: (pointer p1 = {p1})</p>
          {nums1.map((val, index) => {
            const x = index * 55;
            const y = 20;
            const isCurrent = index === p1;

            return (
              <div key={index} className="relative flex">
                <div
                  className={`absolute flex my-8 ${
                    isCurrent ? "bg-blue-400" : "bg-inverseSurface"
                  } rounded-lg items-center justify-center size-12  text-white`}
                  style={{ translate: `${x}px` }}
                >
                  <span
                    className={
                      isCurrent ? "text-white" : "text-inverseOnSurface"
                    }
                  >
                    {val}
                  </span>
                  <span
                    className={`absolute text-invert -bottom-6 text-label-small`}
                  >
                    [{index}]
                  </span>
                </div>

                {isCurrent && (
                  <>
                    <div
                      className="flex text-label-medium flex-col items-center -space-y-1 text-blue-400 absolute"
                      style={{ translate: `${x + 16}px ${y - 20}px` }}
                    >
                      <span className="font-black">p1</span>
                      <ChevronDown size={16} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* nums2 array */}
        <div className="h-[130px] overflow-x-scroll">
          <p className="text-title-medium">nums2: (pointer p2 = {p2})</p>
          {nums2.map((val, index) => {
            const x = index * 55;
            const y = 20;
            const isCurrent = index === p2;

            return (
              <div key={index} className="relative flex">
                <div
                  className={`absolute flex my-8 ${
                    isCurrent ? "bg-rose-400" : "bg-inverseSurface"
                  } rounded-lg items-center justify-center size-12  text-white`}
                  style={{ translate: `${x}px` }}
                >
                  <span
                    className={
                      isCurrent ? "text-white" : "text-inverseOnSurface"
                    }
                  >
                    {val}
                  </span>
                  <span
                    className={`absolute text-invert -bottom-6 text-label-small`}
                  >
                    [{index}]
                  </span>
                </div>
                {isCurrent && (
                  <>
                    <div
                      className="flex text-label-medium flex-col items-center -space-y-1 text-rose-400 absolute"
                      style={{ translate: `${x + 16}px ${y - 20}px` }}
                    >
                      <span className="font-black">p2</span>
                      <ChevronDown size={16} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Current min indicator */}
        <div className="relative flex items-center h-4 font-bold">
          {currentMin && currentMin.val !== -1 && (
            <span>
              Current Min from {currentMin.from}:{" "}
              <span className="font-black text-orange-400">
                {currentMin.val}
              </span>
            </span>
          )}
        </div>

        {/* Merged array (partial) */}
        <div className="h-[130px] overflow-x-scroll">
          <p className="text-title-medium">Merged Array (so far):</p>
          {merged.map((val, index) => {
            const x = index * 55;
            const y = 20;
            const isMedianElement = medianPos.includes(index);
            return (
              <div key={index} className="relative flex">
                <div
                  className={`absolute flex my-8 ${
                    isMedianElement ? "bg-indigo-400" : "bg-inverseSurface"
                  } rounded-lg items-center justify-center size-12  text-white`}
                  style={{ translate: `${x}px` }}
                >
                  <span
                    className={
                      isMedianElement ? "text-white" : "text-inverseOnSurface"
                    }
                  >
                    {val}
                  </span>
                  <span
                    className={`absolute text-invert -bottom-6 text-label-small`}
                  >
                    [{index}]
                  </span>
                </div>

                {isMedianElement && (
                  <span
                    className="text-sm font-black text-indigo-400 absolute"
                    style={{ translate: `${x}px ${y - 10}px` }}
                  >
                    Median
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Median info */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center gap-2">
          <span className="text-title-small">Median Calculation</span>
          <div className="flex items-center text-body-small">
            <span className="flex text-body-small gap-2 w-1/2">
              Total Length:{" "}
              <span className="text-blue-400 font-bold">
                {nums1.length + nums2.length}
              </span>
            </span>
            <span className="flex text-body-small gap-2 w-1/2">
              Median Position:{" "}
              <span className="text-indigo-400 font-bold">
                [{medianPos.join(", ")}]
              </span>
            </span>
          </div>
          <div className="flex items-center text-body-small">
            <span className="flex text-body-small gap-2 w-1/2">
              Even/Odd:{" "}
              <span className="text-orange-400 font-bold">
                {isEven ? "EVEN" : "ODD"}
              </span>
            </span>
            <span className="flex text-body-small gap-2 w-1/2">
              Median: <span className="text-green-400 font-bold">{median}</span>
            </span>
          </div>
        </div>
      </div>
      {/* Controls */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col items-center gap-2 w-full">
          <FilledTextField
            type="text"
            value={nums1Input}
            onChange={(e) => setNums1Input(e.target.value)}
            label={nums1Input}
            disabled={running}
            className="w-full"
            placeholder="Nums 1"
            supportingText={false}
          />
          <FilledTextField
            type="text"
            value={nums2Input}
            onChange={(e) => setNums2Input(e.target.value)}
            label={nums2Input}
            disabled={running}
            className="w-full"
            placeholder="Nums 2"
            supportingText={false}
          />
        </div>
        <div className="flex items-center gap-2">
          <StandardButtonS
            text={running ? "Finding..." : "Find Median"}
            onClick={runVisualization}
            disabled={running}
            className="grow"
          />
          <TonalButton
            text="Stop"
            disabled={!running}
            onClick={stopVisualization}
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
        <h3 className="text-title-large mb-4">Median Finding Algorithm:</h3>
        <ol className="text-body-large">
          <li>
            <strong>Initialize:</strong> Set two pointers p1=0 (nums1) and p2=0
            (nums2)
          </li>
          <li>
            <strong>getMin function:</strong> Compares current elements and
            returns smaller value, advancing pointer
          </li>
          <li>
            <strong>Determine median position:</strong>
            <ul style={{ marginLeft: "20px", marginTop: "5px" }}>
              <li>
                If total length is even: need elements at positions (m+n)/2-1
                and (m+n)/2
              </li>
              <li>
                If total length is odd: need element at position floor((m+n)/2)
              </li>
            </ul>
          </li>
          <li>
            <strong>Skip unnecessary elements:</strong> Call getMin() to skip
            elements before median position
          </li>
          <li>
            <strong>Get median element(s):</strong> Extract the element(s) at
            median position(s)
          </li>
          <li>
            <strong>Calculate median:</strong>
            <ul style={{ marginLeft: "20px", marginTop: "5px" }}>
              <li>Even: average of two middle elements</li>
              <li>Odd: the single middle element</li>
            </ul>
          </li>
        </ol>
        <p className="text-body-small mt-4 text-onError">
          <strong>Time Complexity:</strong> O((m+n)/2) - only process elements
          up to median position
          <br />
          <strong>Space Complexity:</strong> O(1) - only store median element(s)
        </p>
      </div>
    </div>
  );
}

export default MedianSortedArraysVisualizer;
