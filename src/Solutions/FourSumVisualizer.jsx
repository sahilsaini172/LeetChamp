import React, { useCallback, useEffect, useRef, useState } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";

function FourSumVisualizer() {
  const [inputArray, setInputArray] = useState("1,0,-1,0,-2,2");
  const [inputTarget, setInputTarget] = useState(0);

  const [running, setRunning] = useState(false);
  const [sortedNums, setSortedNums] = useState([]);

  // Visual state
  const [prefix, setPrefix] = useState([]); // chosen numbers along recursion
  const [k, setK] = useState(4);
  const [depth, setDepth] = useState(0);
  const [start, setStart] = useState(0);
  const [iIndex, setIIndex] = useState(-1);
  const [lo, setLo] = useState(-1);
  const [hi, setHi] = useState(-1);

  const [currentTarget, setCurrentTarget] = useState(0);
  const [avg, setAvg] = useState(null);
  const [action, setAction] = useState("idle");

  const [results, setResults] = useState([]);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('Click "Start" to find quadruplets');

  const timerRef = useRef(null);

  const W = 1100;
  const H = 760;

  const parseArray = (text) => {
    const arr = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((x) => Number(x));
    if (arr.length < 4 || arr.some((x) => Number.isNaN(x))) return null;
    return arr;
  };

  // --- Generator that yields steps for animation ---
  function* fourSumSteps(nums, target) {
    let stepNo = 0;
    const sorted = [...nums].sort((a, b) => a - b);
    const out = [];

    yield {
      sortedNums: sorted,
      prefix: [],
      k: 4,
      depth: 0,
      start: 0,
      iIndex: -1,
      lo: -1,
      hi: -1,
      currentTarget: target,
      avg: null,
      action: "sort",
      results: [],
      step: stepNo++,
      status: `Sorted: [${sorted.join(", ")}], target=${target}`,
      done: false,
    };

    function* twoSumGen(target2, start2, prefix2, depth2) {
      let lo2 = start2;
      let hi2 = sorted.length - 1;

      yield {
        sortedNums: sorted,
        prefix: prefix2,
        k: 2,
        depth: depth2,
        start: start2,
        iIndex: -1,
        lo: lo2,
        hi: hi2,
        currentTarget: target2,
        avg: target2 / 2,
        action: "twoSum_start",
        results: [...out],
        step: stepNo++,
        status: `twoSum on range [${start2}..${
          sorted.length - 1
        }], target=${target2}`,
        done: false,
      };

      while (lo2 < hi2) {
        const sum = sorted[lo2] + sorted[hi2];

        yield {
          sortedNums: sorted,
          prefix: prefix2,
          k: 2,
          depth: depth2,
          start: start2,
          iIndex: -1,
          lo: lo2,
          hi: hi2,
          currentTarget: target2,
          avg: target2 / 2,
          action: "twoSum_compute",
          results: [...out],
          step: stepNo++,
          status: `lo=${lo2} (${sorted[lo2]}), hi=${hi2} (${sorted[hi2]}) → sum=${sum}`,
          done: false,
        };

        if (
          sum < target2 ||
          (lo2 > start2 && sorted[lo2] === sorted[lo2 - 1])
        ) {
          yield {
            sortedNums: sorted,
            prefix: prefix2,
            k: 2,
            depth: depth2,
            start: start2,
            iIndex: -1,
            lo: lo2,
            hi: hi2,
            currentTarget: target2,
            avg: target2 / 2,
            action: "twoSum_move_lo",
            results: [...out],
            step: stepNo++,
            status:
              sum < target2
                ? `sum < target → lo++`
                : `Skip duplicate lo (${sorted[lo2]} == ${
                    sorted[lo2 - 1]
                  }) → lo++`,
            done: false,
          };
          lo2++;
        } else if (
          sum > target2 ||
          (hi2 < sorted.length - 1 && sorted[hi2] === sorted[hi2 + 1])
        ) {
          yield {
            sortedNums: sorted,
            prefix: prefix2,
            k: 2,
            depth: depth2,
            start: start2,
            iIndex: -1,
            lo: lo2,
            hi: hi2,
            currentTarget: target2,
            avg: target2 / 2,
            action: "twoSum_move_hi",
            results: [...out],
            step: stepNo++,
            status:
              sum > target2
                ? `sum > target → hi--`
                : `Skip duplicate hi (${sorted[hi2]} == ${
                    sorted[hi2 + 1]
                  }) → hi--`,
            done: false,
          };
          hi2--;
        } else {
          const pair = [sorted[lo2], sorted[hi2]];
          const quad = [...prefix2, ...pair];
          out.push(quad);

          yield {
            sortedNums: sorted,
            prefix: prefix2,
            k: 2,
            depth: depth2,
            start: start2,
            iIndex: -1,
            lo: lo2,
            hi: hi2,
            currentTarget: target2,
            avg: target2 / 2,
            action: "twoSum_found",
            results: [...out],
            step: stepNo++,
            status: `✓ Found pair [${pair.join(
              ", "
            )}] → quadruplet [${quad.join(", ")}]`,
            done: false,
          };

          lo2++;
          hi2--;
        }
      }
    }

    function* kSumGen(targetK, startK, kK, prefixK, depthK) {
      if (startK === sorted.length) return;

      const averageValue = targetK / kK;

      yield {
        sortedNums: sorted,
        prefix: prefixK,
        k: kK,
        depth: depthK,
        start: startK,
        iIndex: -1,
        lo: -1,
        hi: -1,
        currentTarget: targetK,
        avg: averageValue,
        action: "prune_check",
        results: [...out],
        step: stepNo++,
        status: `kSum(k=${kK}) at start=${startK}: avg=target/k=${averageValue.toFixed(
          2
        )}`,
        done: false,
      };

      // pruning identical to your code
      if (
        sorted[startK] > averageValue ||
        averageValue > sorted[sorted.length - 1]
      ) {
        yield {
          sortedNums: sorted,
          prefix: prefixK,
          k: kK,
          depth: depthK,
          start: startK,
          iIndex: -1,
          lo: -1,
          hi: -1,
          currentTarget: targetK,
          avg: averageValue,
          action: "pruned",
          results: [...out],
          step: stepNo++,
          status: `Pruned: cannot reach target with remaining numbers`,
          done: false,
        };
        return;
      }

      if (kK === 2) {
        yield* twoSumGen(targetK, startK, prefixK, depthK);
        return;
      }

      for (let idx = startK; idx < sorted.length; idx++) {
        if (idx !== startK && sorted[idx] === sorted[idx - 1]) {
          yield {
            sortedNums: sorted,
            prefix: prefixK,
            k: kK,
            depth: depthK,
            start: startK,
            iIndex: idx,
            lo: -1,
            hi: -1,
            currentTarget: targetK,
            avg: averageValue,
            action: "skip_i",
            results: [...out],
            step: stepNo++,
            status: `Skip duplicate at idx=${idx} (value ${sorted[idx]})`,
            done: false,
          };
          continue;
        }

        yield {
          sortedNums: sorted,
          prefix: prefixK,
          k: kK,
          depth: depthK,
          start: startK,
          iIndex: idx,
          lo: -1,
          hi: -1,
          currentTarget: targetK,
          avg: averageValue,
          action: "choose",
          results: [...out],
          step: stepNo++,
          status: `Choose nums[${idx}]=${sorted[idx]} → recurse k=${
            kK - 1
          }, target=${targetK - sorted[idx]}`,
          done: false,
        };

        yield* kSumGen(
          targetK - sorted[idx],
          idx + 1,
          kK - 1,
          [...prefixK, sorted[idx]],
          depthK + 1
        );

        yield {
          sortedNums: sorted,
          prefix: prefixK,
          k: kK,
          depth: depthK,
          start: startK,
          iIndex: idx,
          lo: -1,
          hi: -1,
          currentTarget: targetK,
          avg: averageValue,
          action: "backtrack",
          results: [...out],
          step: stepNo++,
          status: `Backtrack after trying nums[${idx}]=${sorted[idx]}`,
          done: false,
        };
      }
    }

    yield* kSumGen(target, 0, 4, [], 0);

    yield {
      sortedNums: sorted,
      prefix: [],
      k: 4,
      depth: 0,
      start: 0,
      iIndex: -1,
      lo: -1,
      hi: -1,
      currentTarget: target,
      avg: null,
      action: "complete",
      results: [...out],
      step: stepNo++,
      status: `✓ Complete! Found ${out.length} quadruplet(s).`,
      done: true,
    };

    return out;
  }

  const startRun = useCallback(() => {
    const arr = parseArray(inputArray);
    const tgt = Number(inputTarget);

    if (!arr || Number.isNaN(tgt)) {
      setStatus("❌ Enter at least 4 integers and a valid target.");
      return;
    }

    setRunning(true);
    setResults([]);
    setSortedNums([]);
    setPrefix([]);
    setK(4);
    setDepth(0);
    setStart(0);
    setIIndex(-1);
    setLo(-1);
    setHi(-1);
    setCurrentTarget(tgt);
    setAvg(null);
    setAction("idle");
    setStep(0);

    const gen = fourSumSteps(arr, tgt);

    const tick = () => {
      const { value } = gen.next();
      if (!value) {
        setRunning(false);
        return;
      }

      setSortedNums(value.sortedNums);
      setPrefix(value.prefix);
      setK(value.k);
      setDepth(value.depth);
      setStart(value.start);
      setIIndex(value.iIndex);
      setLo(value.lo);
      setHi(value.hi);
      setCurrentTarget(value.currentTarget);
      setAvg(value.avg);
      setAction(value.action);
      setResults(value.results);
      setStep(value.step);
      setStatus(value.status);

      if (value.done) {
        setRunning(false);
        return;
      }
      timerRef.current = setTimeout(tick, 700);
    };

    tick();
  }, [inputArray, inputTarget]);

  const stopRun = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
  };

  const reset = () => {
    stopRun();
    setResults([]);
    setSortedNums([]);
    setPrefix([]);
    setK(4);
    setDepth(0);
    setStart(0);
    setIIndex(-1);
    setLo(-1);
    setHi(-1);
    setCurrentTarget(Number(inputTarget) || 0);
    setAvg(null);
    setAction("idle");
    setStep(0);
    setStatus('Click "Start" to find quadruplets');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const cellColor = (idx) => {
    if (idx === iIndex) return "bg-orange-500 text-white"; // chosen index at current k>2 level
    if (idx === lo) return "bg-blue-500 text-white"; // twoSum lo
    if (idx === hi) return "bg-indigo-500 text-white"; // twoSum hi
    if (idx >= start && idx <= sortedNums.length - 1)
      return "bg-inverseSurface text-inverseOnSurface";
    return "bg-surfaceContainer-low text-onSurface";
  };

  return (
    <div className="flex flex-col gap-2 text-onSurface **:ease-in **:duration-150 ease-in duration-150">
      <h2 className="text-headline-medium">4 Sum Visualizer (kSum + twoSum)</h2>

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
          kSum recursion + twoSum base case
        </p>

        {/* Top info panel */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-body-medium">
          <p>
            depth: <span className="font-bold">{depth}</span> | k:{" "}
            <span className="font-bold">{k}</span> | start:{" "}
            <span className="font-bold">{start}</span>
          </p>
          <p>
            target:{" "}
            <span className="font-bold text-red-500">{currentTarget}</span>
            {avg !== null && (
              <>
                {"  "} | avg=target/k:{" "}
                <span className="font-bold text-indigo-500">
                  {Number.isFinite(avg) ? avg.toFixed(2) : "-"}
                </span>
              </>
            )}
          </p>
          <p>
            prefix:
            <span className="font-bold text-green-500">
              {" "}
              {prefix.length ? `[${prefix.join(", ")}]` : "(empty)"}
            </span>
          </p>
        </div>

        {/* Array row */}
        <div className="relative flex flex-col">
          <p className="text-title-medium">Sorted array:</p>
          {/* Main container for the visualization */}
          <div className="h-32 overflow-x-scroll">
            {sortedNums.map((num, idx) => {
              return (
                <div key={idx} className="relative">
                  {/* Number Cell */}
                  <div
                    className={`absolute mt-8 flex items-center justify-center size-12 rounded-lg transition-all shrink-0 duration-300 ${cellColor(
                      idx
                    )}`}
                    style={{translate:`${idx*60}px`}}
                  >
                    <span className="font-medium text-lg">{num}</span>

                    {/* Index Label [0], [1], etc. */}
                    <span className="absolute -bottom-6 text-label-medium text-onSurfaceVarient">
                      [{idx}]
                    </span>

                    {/* 'i' Pointer (Current Mid/Check) */}
                    {idx === iIndex && (
                      <div className="absolute -top-6 text-orange-500 text-label-large transition-all duration-300">
                        i
                      </div>
                    )}

                    {/* 'lo' Pointer */}
                    {idx === lo && (
                      <div className="absolute -top-6 text-blue-500 text-label-large transition-all duration-300">
                        lo
                      </div>
                    )}

                    {/* 'hi' Pointer */}
                    {idx === hi && (
                      <div className="absolute -top-6 text-blue-500 text-label-large transition-all duration-300">
                        hi
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="relative flex flex-col">
          <p className="text-title-medium">Results (last 6):</p>
          {results.slice(-6).map((q, idx) => (
            <p key={idx} className="text-green-500 text-body-medium">
              [{q.join(", ")}]
            </p>
          ))}
          {results.length === 0 && (
            <p className="text-body-medium">(none yet)</p>
          )}

          <p className="text-body-small mt-4">
            When k==2, the visual switches to the two-pointer scan on the
            remaining subarray. (Pointer idea) [web:160]
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 w-full flex-wrap">
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-orange-500 rounded-full"></div>
          <span>Current idx</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-blue-500 rounded-full"></div>
          <span>twoSum lo pointer</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-indigo-500 rounded-full"></div>
          <span>twoSum hi pointer</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex  flex-col gap-2 flex-wrap">
        <FilledTextField
          type="text"
          placeholder="Array Elements (comma-separated)"
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
            onClick={startRun}
            disabled={running}
            className="grow"
          />
          <StandardButtonS
            onClick={stopRun}
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
        <h3 className="text-title-large mb-4">Algorithm explanation</h3>
        <ol className="text-body-large">
          <li>
            Sort `nums`, then solve 4Sum as a generic `kSum(nums, target, start,
            k)` recursion.
          </li>
          <li>
            Use pruning with `average_value = target / k`: if `nums[start] &gt;
            average_value` or `average_value &gt; nums[n-1]`, no solution is
            possible from this branch.
          </li>
          <li>
            For `k &gt; 2`, iterate `i` from `start`, skip duplicates, choose
            `nums[i]`, and recurse with `(target - nums[i], i+1, k-1)`.
          </li>
          <li>
            Base case `k === 2`: run `twoSum` with two pointers (`lo`, `hi`) on
            the sorted array and skip duplicates while moving pointers.
            [web:160]
          </li>
          <li>
            Every time `twoSum` finds a pair, it gets combined with the
            recursion prefix to form a quadruplet.
          </li>
        </ol>
      </div>
    </div>
  );
}

export default FourSumVisualizer;
