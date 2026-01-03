import React, { useState, useCallback, useRef, useEffect } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";

function ThreeSumVisualizer() {
  const [inputArray, setInputArray] = useState("-1,0,1,2,-1,-4");
  const [nums, setNums] = useState([-1, 0, 1, 2, -1, -4]);
  const [running, setRunning] = useState(false);

  const [sortedNums, setSortedNums] = useState([]);
  const [i, setI] = useState(-1);
  const [j, setJ] = useState(-1);
  const [k, setK] = useState(-1);
  const [currentSum, setCurrentSum] = useState(null);
  const [action, setAction] = useState("");

  const [result, setResult] = useState([]);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('Click "Start" to find triplets');
  const [finalResult, setFinalResult] = useState(null);

  const timerRef = useRef(null);

  const width = 1100;
  const height = 800;

  // 3Sum generator
  function* threeSumGenerator(arr) {
    let stepNum = 0;
    const res = [];
    const sorted = [...arr].sort((a, b) => a - b);

    yield {
      sortedNums: sorted,
      i: -1,
      j: -1,
      k: -1,
      currentSum: null,
      action: "sort",
      result: [],
      step: stepNum++,
      status: `Sorted array: [${sorted.join(", ")}]`,
      done: false,
    };

    for (let idx_i = 0; idx_i < sorted.length; idx_i++) {
      // Skip duplicate i
      if (idx_i > 0 && sorted[idx_i] === sorted[idx_i - 1]) {
        yield {
          sortedNums: sorted,
          i: idx_i,
          j: -1,
          k: -1,
          currentSum: null,
          action: "skip_i",
          result: [...res],
          step: stepNum++,
          status: `Skip duplicate i=${idx_i} (${sorted[idx_i]} == ${
            sorted[idx_i - 1]
          })`,
          done: false,
        };
        continue;
      }

      yield {
        sortedNums: sorted,
        i: idx_i,
        j: -1,
        k: -1,
        currentSum: null,
        action: "fix_i",
        result: [...res],
        step: stepNum++,
        status: `Fix i=${idx_i}, nums[i]=${sorted[idx_i]}`,
        done: false,
      };

      let idx_j = idx_i + 1;
      let idx_k = sorted.length - 1;

      while (idx_j < idx_k) {
        const total = sorted[idx_i] + sorted[idx_j] + sorted[idx_k];

        yield {
          sortedNums: sorted,
          i: idx_i,
          j: idx_j,
          k: idx_k,
          currentSum: total,
          action: "compute",
          result: [...res],
          step: stepNum++,
          status: `i=${idx_i}, j=${idx_j}, k=${idx_k} → sum = ${sorted[idx_i]} + ${sorted[idx_j]} + ${sorted[idx_k]} = ${total}`,
          done: false,
        };

        if (total > 0) {
          yield {
            sortedNums: sorted,
            i: idx_i,
            j: idx_j,
            k: idx_k,
            currentSum: total,
            action: "move_k",
            result: [...res],
            step: stepNum++,
            status: `Sum ${total} > 0 → move k left (k--)`,
            done: false,
          };
          idx_k--;
        } else if (total < 0) {
          yield {
            sortedNums: sorted,
            i: idx_i,
            j: idx_j,
            k: idx_k,
            currentSum: total,
            action: "move_j",
            result: [...res],
            step: stepNum++,
            status: `Sum ${total} < 0 → move j right (j++)`,
            done: false,
          };
          idx_j++;
        } else {
          // Found triplet
          res.push([sorted[idx_i], sorted[idx_j], sorted[idx_k]]);

          yield {
            sortedNums: sorted,
            i: idx_i,
            j: idx_j,
            k: idx_k,
            currentSum: total,
            action: "found",
            result: [...res],
            step: stepNum++,
            status: `✓ Found triplet: [${sorted[idx_i]}, ${sorted[idx_j]}, ${sorted[idx_k]}]`,
            done: false,
          };

          idx_j++;

          // Skip duplicates for j
          while (sorted[idx_j] === sorted[idx_j - 1] && idx_j < idx_k) {
            yield {
              sortedNums: sorted,
              i: idx_i,
              j: idx_j,
              k: idx_k,
              currentSum: null,
              action: "skip_j",
              result: [...res],
              step: stepNum++,
              status: `Skip duplicate j=${idx_j} (${sorted[idx_j]} == ${
                sorted[idx_j - 1]
              })`,
              done: false,
            };
            idx_j++;
          }
        }
      }
    }

    yield {
      sortedNums: sorted,
      i: -1,
      j: -1,
      k: -1,
      currentSum: null,
      action: "complete",
      result: res,
      step: stepNum++,
      status: `✓ Complete! Found ${res.length} unique triplet(s)`,
      done: true,
    };

    return res;
  }

  const runVisualization = useCallback(() => {
    const arr = inputArray
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => parseInt(s, 10));

    if (arr.length < 3 || arr.some((n) => isNaN(n))) {
      setStatus("❌ Enter at least 3 valid integers");
      return;
    }

    setNums(arr);
    setRunning(true);
    setFinalResult(null);
    setStep(0);
    setResult([]);

    const generator = threeSumGenerator(arr);

    const animate = () => {
      const { value } = generator.next();

      if (value) {
        setSortedNums(value.sortedNums);
        setI(value.i);
        setJ(value.j);
        setK(value.k);
        setCurrentSum(value.currentSum);
        setAction(value.action);
        setResult(value.result);
        setStep(value.step);
        setStatus(value.status);

        if (value.done) {
          setFinalResult(value.result);
          setTimeout(() => {
            setRunning(false);
          }, 2000);
        } else {
          timerRef.current = setTimeout(animate, 900);
        }
      } else {
        setRunning(false);
      }
    };

    animate();
  }, [inputArray]);

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
  };

  const reset = () => {
    stop();
    setFinalResult(null);
    setStep(0);
    setResult([]);
    setSortedNums([]);
    setI(-1);
    setJ(-1);
    setK(-1);
    setCurrentSum(null);
    setAction("");
    setStatus('Click "Start" to find triplets');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const getBarColor = (index) => {
    if (index === i) return "bg-red-400"; // red for i
    if (index === j) return "bg-blue-400"; // blue for j
    if (index === k) return "bg-indigo-400"; // purple for k
    return "bg-surfaceContainer";
  };

  const getBarTextColor = (index) => {
    if (index === i || index === j || index === k) return "text-white";
    return "text-onSurface";
  };

  return (
    <div className="flex flex-col gap-2 text-onSurface **:ease-in **:duration-150 ease-in duration-150">
      <h2 className="text-headline-medium">3 Sum Visualizer (Two Pointers)</h2>

      {/* Status */}
      <div className={`p-2 bg-surfaceContainer text-label-large rounded-md `}>
        Step {step}: {status}
      </div>

      {/* SVG Visualization */}
      <div
        className={`gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col relative `}
      >
        {/* Title */}
        <p className="text-center text-label-medium">
          3Sum Two Pointer Algorithm
        </p>

        {/* Sorted array bars */}
        <div className="h-[250px] overflow-x-scroll relative">
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
            const y = 160 - barHeight;

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
                  {/* Labels */}
                  {index === i && (
                    <span
                      className="absolute -bottom-14 text-red-400"
                      style={{ translate: `${x + barWidth / 2} px` }}
                    >
                      i (fixed)
                    </span>
                  )}
                  {index === j && (
                    <span
                      className="absolute -bottom-14 text-blue-400"
                      style={{ translate: `${x + barWidth / 2} px` }}
                    >
                      j (left)
                    </span>
                  )}
                  {index === k && (
                    <span
                      className="absolute -bottom-14 text-indigo-400"
                      style={{ translate: `${x + barWidth / 2} px` }}
                    >
                      k (right)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current sum display */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center">
          <span className="text-title-small mb-4">Current Sum</span>
          <div className="h-8">
            {currentSum !== null && (
              <>
                <span
                  x={500}
                  y={60}
                  textAnchor="middle"
                  fontSize="20"
                  fill="#2c3e50"
                >
                  {i >= 0 && `nums[${i}]=${sortedNums[i]}`} +{" "}
                  {j >= 0 && `nums[${j}]=${sortedNums[j]}`} +{" "}
                  {k >= 0 && `nums[${k}]=${sortedNums[k]}`} ={" "}
                  <span
                    className={`${
                      currentSum === 0
                        ? "text-green-400"
                        : currentSum > 0
                        ? "text-red-400"
                        : "text-blue-400"
                    } font-bold`}
                  >
                    {currentSum}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action indicator */}
        <div className="p-2 h-10 bg-surfaceContainer-high flex flex-col rounded-md text-center">
          <span className="font-bold">
            {action === "sort" && "📊 Sorting array..."}
            {action === "fix_i" && "📌 Fixed i, starting two-pointer search"}
            {action === "skip_i" && "⏩ Skipping duplicate i"}
            {action === "compute" && "🧮 Computing sum..."}
            {action === "move_j" && "➡️ Sum < 0, moving j right"}
            {action === "move_k" && "⬅️ Sum > 0, moving k left"}
            {action === "found" && "✅ Found triplet!"}
            {action === "skip_j" && "⏩ Skipping duplicate j"}
            {action === "complete" && "🎉 Search complete!"}
          </span>
        </div>

        {/* Found triplets */}
        <div className="p-2 flex items-center gap-2">
          <span x={0} y={0} fontSize="18" fontWeight="bold" fill="#2c3e50">
            Found Triplets:
          </span>

          {result.length === 0 && (
            <span x={10} y={30} fontSize="14" fill="#7f8c8d" fontStyle="italic">
              (none yet)
            </span>
          )}

          {result.slice(-6).map((triplet, idx) => {
            const y = 30 + idx * 25;
            return (
              <span key={idx} className="font-bold text-green-400">
                [{triplet.join(", ")}]
              </span>
            );
          })}
        </div>

        {/* Final result */}
        {finalResult !== null && (
          <div className="p-2 flex items-center gap-2">
            <span  className="font-bold text-green-400">
              ✓ Found {finalResult.length} unique triplet(s)
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 w-full flex-wrap">
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-red-400 rounded-full"></div>
          <span>i (fixed element)</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-blue-400 rounded-full"></div>
          <span>j (left pointer)</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-indigo-400 rounded-full"></div>
          <span>k (right pointer)</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex  flex-col gap-2 flex-wrap">
        <FilledTextField
          type="text"
          placeholder="Enter integers (comma-separated)"
          label={true}
          value={inputArray}
          disabled={running}
          onChange={(e) => setInputString(e.target.value)}
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
          3Sum Algorithm (Two Pointers):
        </h3>
        <ol className="text-body-large">
          <li>
            <strong>Sort the array:</strong> Enables two-pointer technique and
            easy duplicate detection[web:208][web:210].
          </li>
          <li>
            <strong>Fix first element (i):</strong> Iterate through array, skip
            duplicates where nums[i] == nums[i-1][web:210][web:212].
          </li>
          <li>
            <strong>Two pointers:</strong> Set j = i+1 (left), k = n-1
            (right)[web:208][web:210].
          </li>
          <li>
            <strong>Calculate sum:</strong> total = nums[i] + nums[j] +
            nums[k][web:210].
          </li>
          <li>
            <strong>Adjust pointers:</strong>
            <ul className="text-body-large">
              <li>If sum &gt; 0: move k left (k--)[web:210][web:214]</li>
              <li>If sum &lt; 0: move j right (j++)[web:210][web:214]</li>
              <li>
                If sum == 0: found triplet! Add to result, move j right, skip
                duplicates[web:210][web:215]
              </li>
            </ul>
          </li>
          <li>
            <strong>Skip duplicates:</strong> After finding triplet, skip
            duplicate j values while j &lt; k[web:210][web:212].
          </li>
        </ol>
        <p className="text-body-small mt-4 text-onError">
          <strong>Time Complexity:</strong> O(n²) - O(n log n) for sort + O(n²)
          for nested loops[web:208][web:210].
          <br />
          <strong>Space Complexity:</strong> O(1) or O(n) depending on sort
          implementation[web:210].
          <br />
          <strong>Why sort?</strong> Enables two-pointer convergence and
          simplifies duplicate handling[web:208][web:210].
        </p>
      </div>
    </div>
  );
}

export default ThreeSumVisualizer;
