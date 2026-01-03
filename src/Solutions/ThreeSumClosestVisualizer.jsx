import React, { useState, useCallback, useRef, useEffect } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";

function ThreeSumClosestVisualizer() {
  const [inputArray, setInputArray] = useState("-1,2,1,-4");
  const [inputTarget, setInputTarget] = useState(1);
  const [nums, setNums] = useState([-1, 2, 1, -4]);
  const [target, setTarget] = useState(1);
  const [running, setRunning] = useState(false);

  const [sortedNums, setSortedNums] = useState([]);
  const [i, setI] = useState(-1);
  const [left, setLeft] = useState(-1);
  const [right, setRight] = useState(-1);

  const [currentSum, setCurrentSum] = useState(null);
  const [currentDiff, setCurrentDiff] = useState(null);
  const [closestSum, setClosestSum] = useState(null);
  const [minDiff, setMinDiff] = useState(null);

  const [action, setAction] = useState("");
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('Click "Start" to find closest sum');
  const [finalResult, setFinalResult] = useState(null);
  const [history, setHistory] = useState([]);

  const timerRef = useRef(null);

  const width = 1100;
  const height = 900;

  // 3Sum Closest generator
  function* threeSumClosestGenerator(arr, tgt) {
    let stepNum = 0;
    const sorted = [...arr].sort((a, b) => a - b);
    let closest = Infinity;
    let minD = Infinity;
    const hist = [];

    yield {
      sortedNums: sorted,
      i: -1,
      left: -1,
      right: -1,
      currentSum: null,
      currentDiff: null,
      closestSum: closest,
      minDiff: minD,
      action: "sort",
      step: stepNum++,
      status: `Sorted array: [${sorted.join(", ")}], target = ${tgt}`,
      history: [],
      done: false,
    };

    for (let idx_i = 0; idx_i < sorted.length - 2; idx_i++) {
      yield {
        sortedNums: sorted,
        i: idx_i,
        left: -1,
        right: -1,
        currentSum: null,
        currentDiff: null,
        closestSum: closest,
        minDiff: minD,
        action: "fix_i",
        step: stepNum++,
        status: `Fix i=${idx_i}, nums[i]=${sorted[idx_i]}`,
        history: [...hist],
        done: false,
      };

      let idx_left = idx_i + 1;
      let idx_right = sorted.length - 1;

      while (idx_left < idx_right) {
        const sum = sorted[idx_i] + sorted[idx_left] + sorted[idx_right];
        const diff = Math.abs(sum - tgt);

        yield {
          sortedNums: sorted,
          i: idx_i,
          left: idx_left,
          right: idx_right,
          currentSum: sum,
          currentDiff: diff,
          closestSum: closest,
          minDiff: minD,
          action: "compute",
          step: stepNum++,
          status: `i=${idx_i}, left=${idx_left}, right=${idx_right} → sum = ${sorted[idx_i]} + ${sorted[idx_left]} + ${sorted[idx_right]} = ${sum}, diff = |${sum} - ${tgt}| = ${diff}`,
          history: [...hist],
          done: false,
        };

        if (diff < minD) {
          minD = diff;
          closest = sum;

          hist.push({
            i: idx_i,
            left: idx_left,
            right: idx_right,
            sum,
            diff,
            isUpdate: true,
          });

          yield {
            sortedNums: sorted,
            i: idx_i,
            left: idx_left,
            right: idx_right,
            currentSum: sum,
            currentDiff: diff,
            closestSum: closest,
            minDiff: minD,
            action: "update",
            step: stepNum++,
            status: `✅ New closest! diff ${diff} < ${
              minD + diff
            }, closestSum = ${closest}`,
            history: [...hist],
            done: false,
          };
        } else {
          hist.push({
            i: idx_i,
            left: idx_left,
            right: idx_right,
            sum,
            diff,
            isUpdate: false,
          });
        }

        // Early return for exact match
        if (sum === tgt) {
          yield {
            sortedNums: sorted,
            i: idx_i,
            left: idx_left,
            right: idx_right,
            currentSum: sum,
            currentDiff: 0,
            closestSum: sum,
            minDiff: 0,
            action: "exact",
            step: stepNum++,
            status: `🎯 Exact match! sum = target = ${tgt}`,
            history: [...hist],
            done: true,
          };
          return sum;
        }

        if (sum < tgt) {
          yield {
            sortedNums: sorted,
            i: idx_i,
            left: idx_left,
            right: idx_right,
            currentSum: sum,
            currentDiff: diff,
            closestSum: closest,
            minDiff: minD,
            action: "move_left",
            step: stepNum++,
            status: `Sum ${sum} < target ${tgt} → move left pointer right (left++)`,
            history: [...hist],
            done: false,
          };
          idx_left++;
        } else {
          yield {
            sortedNums: sorted,
            i: idx_i,
            left: idx_left,
            right: idx_right,
            currentSum: sum,
            currentDiff: diff,
            closestSum: closest,
            minDiff: minD,
            action: "move_right",
            step: stepNum++,
            status: `Sum ${sum} > target ${tgt} → move right pointer left (right--)`,
            history: [...hist],
            done: false,
          };
          idx_right--;
        }
      }
    }

    yield {
      sortedNums: sorted,
      i: -1,
      left: -1,
      right: -1,
      currentSum: null,
      currentDiff: null,
      closestSum: closest,
      minDiff: minD,
      action: "complete",
      step: stepNum++,
      status: `✓ Complete! Closest sum = ${closest}, difference = ${minD}`,
      history: hist,
      done: true,
    };

    return closest;
  }

  const runVisualization = useCallback(() => {
    const arr = inputArray
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => parseInt(s, 10));

    const tgt = parseInt(inputTarget, 10);

    if (arr.length < 3 || arr.some((n) => isNaN(n)) || isNaN(tgt)) {
      setStatus("❌ Enter at least 3 valid integers and a valid target");
      return;
    }

    setNums(arr);
    setTarget(tgt);
    setRunning(true);
    setFinalResult(null);
    setStep(0);
    setHistory([]);

    const generator = threeSumClosestGenerator(arr, tgt);

    const animate = () => {
      const { value } = generator.next();

      if (value) {
        setSortedNums(value.sortedNums);
        setI(value.i);
        setLeft(value.left);
        setRight(value.right);
        setCurrentSum(value.currentSum);
        setCurrentDiff(value.currentDiff);
        setClosestSum(value.closestSum);
        setMinDiff(value.minDiff);
        setAction(value.action);
        setStep(value.step);
        setStatus(value.status);
        setHistory(value.history);

        if (value.done) {
          setFinalResult(value.closestSum);
          setTimeout(() => {
            setRunning(false);
          }, 2000);
        } else {
          timerRef.current = setTimeout(animate, 800);
        }
      } else {
        setRunning(false);
      }
    };

    animate();
  }, [inputArray, inputTarget]);

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
  };

  const reset = () => {
    stop();
    setFinalResult(null);
    setStep(0);
    setHistory([]);
    setSortedNums([]);
    setI(-1);
    setLeft(-1);
    setRight(-1);
    setCurrentSum(null);
    setCurrentDiff(null);
    setClosestSum(null);
    setMinDiff(null);
    setAction("");
    setStatus('Click "Start" to find closest sum');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const getBarColor = (index) => {
    if (index === i) return "bg-red-400"; // red for i
    if (index === left) return "bg-blue-400"; // blue for j
    if (index === right) return "bg-indigo-400"; // purple for k
    return "bg-surfaceContainer";
  };

  const getBarTextColor = (index) => {
    if (index === i || index === left || index === right) return "text-white";
    return "text-onSurface";
  };

  return (
    <div className="flex flex-col gap-2 text-onSurface **:ease-in **:duration-150 ease-in duration-150">
      <h2 className="text-headline-medium">
        3 Sum Closest Visualizer (Two Pointers)
      </h2>

      {/* Controls */}
      <div className="flex  flex-col gap-2 flex-wrap">
        <FilledTextField
          type="text"
          placeholder="Array (comma-separated)"
          label={true}
          value={inputArray}
          disabled={running}
          onChange={(e) => setInputArray(e.target.value)}
          supportingText={false}
        />
        <FilledTextField
          type="number"
          placeholder="Target"
          label={true}
          value={inputTarget}
          disabled={running}
          onChange={(e) => setInputTarget(e.target.value)}
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

      {/* Status */}
      <div className={`p-2 bg-surfaceContainer text-label-large rounded-md `}>
        Step {step}: {status}
      </div>

      {/* SVG Visualization */}
      <div
        className={`gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col relative `}
      >
        {/* Title */}
        <p className="text-center text-label-medium">3 Sum Closest Algorithm</p>

        {/* Target display */}
        <div className="px-8 py-2 bg-orange-500/25 border w-fit border-orange-500 flex flex-col rounded-md text-center">
          <span className="font-bold text-orange-500">Target: {target}</span>
        </div>

        {/* Sorted array bars */}
        <div className="h-[260px] overflow-x-scroll relative">
          <p className="text-title-medium">Sorted Array:</p>

          {sortedNums.map((num, index) => {
            const barWidth = 60;
            const barGap = 10;
            const x = index * (barWidth + barGap);
            const maxHeight = 150;
            const maxAbsVal = Math.max(...sortedNums.map(Math.abs), 1);
            const barHeight = Math.max(
              20,
              (Math.abs(num) / maxAbsVal) * maxHeight
            );
            const y = 180 - barHeight;

            return (
              <div key={index} className="relative flex items-baseline mx-2">
                <div
                  className={`absolute flex flex-col rounded-lg items-center justify-center ${getBarColor(
                    index
                  )} text-white`}
                  style={{
                    translate: `${x}px ${y}px`,
                    width: `${barWidth}px`,
                    height: `${barHeight}px`,
                  }}
                >
                  <span className={getBarTextColor(index)}>{num}</span>
                  <span
                    className={`absolute -bottom-6 text-onSurfaceVarient text-body-medium`}
                  >
                    [{index}]
                  </span>

                  {/* Lables */}
                  {index === i && (
                    <span
                      className="absolute -bottom-14 text-blue-400"
                      style={{ translate: `${x + barWidth / 2} px` }}
                    >
                      i
                    </span>
                  )}
                  {index === left && (
                    <span
                      className="absolute -bottom-14 text-blue-400"
                      style={{ translate: `${x + barWidth / 2} px` }}
                    >
                      Left
                    </span>
                  )}
                  {index === right && (
                    <span
                      className="absolute -bottom-14 text-indigo-400"
                      style={{ translate: `${x + barWidth / 2} px` }}
                    >
                      Right
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current calculation */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center">
          <span className="text-title-small mb-4">Current Calculation</span>
          <div className="h-8 flex items-center justify-between">
            {currentSum !== null && (
              <>
                <span className="text-title-small">
                  Sum:{" "}
                  <span className="text-blue-500 font-bold">{currentSum}</span>
                </span>

                <span className="text-title-small">
                  Target:{" "}
                  <span className="text-red-500 font-bold">{target}</span>
                </span>

                <span className="text-title-small">
                  Difference:{" "}
                  <span className="text-indigo-500 font-bold">
                    {currentDiff}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Best so far */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center">
          <span className="text-title-small mb-4">Best So Far</span>
          <div className="h-8 flex items-center justify-between">
            <span className="text-title-small">
              Closest Sum:{" "}
              <span className="font-bold text-green-500">
                {closestSum === Infinity ? "-" : closestSum}
              </span>
            </span>

            <span className="text-title-small">
              Min Difference:{" "}
              <span className="font-bold text-green-500">
                {minDiff === Infinity ? "-" : minDiff}
              </span>
            </span>
          </div>{" "}
        </div>

        {/* Action indicator */}
        <div className="p-2 min-h-10 bg-surfaceContainer-high flex flex-col rounded-md text-center">
          <span className="font-bold">
            {action === "sort" && "📊 Sorting array..."}
            {action === "fix_i" && "📌 Fixed i, starting two-pointer search"}
            {action === "compute" && "🧮 Computing sum and difference..."}
            {action === "update" && "✅ Found closer sum! Updating best..."}
            {action === "move_left" && "➡️ Sum < target, moving left right"}
            {action === "move_right" && "⬅️ Sum > target, moving right left"}
            {action === "exact" && "🎯 Exact match found!"}
            {action === "complete" && "🎉 Search complete!"}
          </span>
        </div>

        {/* History (last 5) */}
        <div className="p-2 flex flex-col gap-2">
          <span className="text-title-small">Recent Checks (last 5):</span>

          {history.slice(-5).map((item, idx) => {
            const y = 25 + idx * 22;
            return (
              <span
                key={idx}
                className={`${
                  item.isUpdate ? "text-green-500" : "text-orange-500"
                }`}
              >
                i={item.i}, L={item.left}, R={item.right} → sum={item.sum},
                diff={item.diff} {item.isUpdate && <span>✓ UPDATED</span>}
              </span>
            );
          })}
        </div>

        {/* Final result */}
        {finalResult !== null && (
          <div className="p-2 flex items-center gap-2">
            <span className="font-bold text-green-400">
              ✓ Closest Sum: {finalResult} (diff:{" "}
              {Math.abs(finalResult - target)})
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 w-full flex-wrap">
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-red-400 rounded-full"></div>
          <span>i (fixed)</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-blue-400 rounded-full"></div>
          <span>Left pointer</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-indigo-400 rounded-full"></div>
          <span>Right pointer</span>
        </div>
      </div>

      {/* Algorithm explanation */}
      <div className="flex flex-col p-4 text-onSecondary bg-secondary rounded-sm">
        <h3 className="text-title-large mb-4">3Sum Closest Algorithm:</h3>
        <ol className="text-body-large">
          <li>
            <strong>Sort array:</strong> Enables two-pointer
            technique[web:216][web:218][web:222].
          </li>
          <li>
            <strong>Initialize:</strong> closestSum = Infinity, minDiff =
            Infinity[web:216][web:218].
          </li>
          <li>
            <strong>Fix first element (i):</strong> Iterate through
            array[web:216][web:218].
          </li>
          <li>
            <strong>Two pointers:</strong> left = i+1, right =
            n-1[web:216][web:218].
          </li>
          <li>
            <strong>Calculate:</strong> currentSum = nums[i] + nums[left] +
            nums[right][web:216][web:222]
            <br />
            currentDiff = |currentSum - target|[web:216][web:222]
          </li>
          <li>
            <strong>Update best:</strong> If currentDiff &lt; minDiff, update
            closestSum and minDiff[web:216][web:218][web:222].
          </li>
          <li>
            <strong>Move pointers:</strong>
            <ul className="text-body-large">
              <li>
                If currentSum &lt; target: left++ (need larger
                sum)[web:216][web:222]
              </li>
              <li>
                If currentSum &gt; target: right-- (need smaller
                sum)[web:216][web:222]
              </li>
              <li>
                If currentSum == target: exact match, return
                immediately[web:216][web:218]
              </li>
            </ul>
          </li>
          <li>
            <strong>Return:</strong> closestSum after checking all
            triplets[web:216][web:218].
          </li>
        </ol>
        <p className="text-body-small mt-4 text-onError">
          <strong>Time Complexity:</strong> O(n²) - O(n log n) sort + O(n²)
          nested loops[web:216][web:218].
          <br />
          <strong>Space Complexity:</strong> O(1) or O(n) for sorting[web:216].
          <br />
          <strong>Key insight:</strong> Unlike 3Sum which finds exact zero, this
          tracks minimum difference continuously[web:218][web:222].
        </p>
      </div>
    </div>
  );
}

export default ThreeSumClosestVisualizer;
