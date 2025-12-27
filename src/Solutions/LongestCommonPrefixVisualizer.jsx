import React, { useState, useCallback, useRef, useEffect } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";

function LongestCommonPrefixVisualizer() {
  const [inputStrings, setInputStrings] = useState("flower,flow,flight");
  const [strs, setStrs] = useState(["flower", "flow", "flight"]);
  const [running, setRunning] = useState(false);

  const [minLen, setMinLen] = useState(0);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [middle, setMiddle] = useState(0);

  const [checkingLen, setCheckingLen] = useState(null);
  const [checkResult, setCheckResult] = useState(null);
  const [candidatePrefix, setCandidatePrefix] = useState("");

  const [step, setStep] = useState(0);
  const [status, setStatus] = useState(
    'Click "Start" to find longest common prefix'
  );
  const [finalResult, setFinalResult] = useState(null);
  const [history, setHistory] = useState([]);

  const timerRef = useRef(null);

  const width = 1100;
  const height = 800;

  // Generator for the binary search algorithm
  function* longestCommonPrefixGen(arr) {
    if (!arr || arr.length === 0) {
      yield {
        minLen: 0,
        low: 0,
        high: 0,
        middle: 0,
        checkingLen: null,
        checkResult: null,
        candidatePrefix: "",
        step: 0,
        status: 'Empty input, returning ""',
        history: [],
        done: true,
      };
      return "";
    }

    let stepNum = 0;
    const historyLog = [];

    // Find min length
    let minLength = Number.MAX_SAFE_INTEGER;
    for (const str of arr) {
      minLength = Math.min(minLength, str.length);
    }

    yield {
      minLen: minLength,
      low: 0,
      high: 0,
      middle: 0,
      checkingLen: null,
      checkResult: null,
      candidatePrefix: "",
      step: stepNum++,
      status: `Found min length = ${minLength}`,
      history: [],
      done: false,
    };

    let lo = 1;
    let hi = minLength;

    yield {
      minLen: minLength,
      low: lo,
      high: hi,
      middle: 0,
      checkingLen: null,
      checkResult: null,
      candidatePrefix: "",
      step: stepNum++,
      status: `Binary search range: low=${lo}, high=${hi}`,
      history: [],
      done: false,
    };

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);

      yield {
        minLen: minLength,
        low: lo,
        high: hi,
        middle: mid,
        checkingLen: null,
        checkResult: null,
        candidatePrefix: "",
        step: stepNum++,
        status: `Binary search: low=${lo}, high=${hi}, middle=${mid}`,
        history: [...historyLog],
        done: false,
      };

      // Check if prefix of length mid is common
      const prefix = arr[0].substring(0, mid);

      yield {
        minLen: minLength,
        low: lo,
        high: hi,
        middle: mid,
        checkingLen: mid,
        checkResult: null,
        candidatePrefix: prefix,
        step: stepNum++,
        status: `Checking if prefix "${prefix}" (length ${mid}) is common to all strings`,
        history: [...historyLog],
        done: false,
      };

      let isCommon = true;
      for (let i = 1; i < arr.length; i++) {
        if (!arr[i].startsWith(prefix)) {
          isCommon = false;
          break;
        }
      }

      yield {
        minLen: minLength,
        low: lo,
        high: hi,
        middle: mid,
        checkingLen: mid,
        checkResult: isCommon,
        candidatePrefix: prefix,
        step: stepNum++,
        status: isCommon
          ? `✓ "${prefix}" is common to all → search right half`
          : `✗ "${prefix}" is NOT common → search left half`,
        history: [...historyLog],
        done: false,
      };

      historyLog.push({
        low: lo,
        high: hi,
        middle: mid,
        prefix,
        isCommon,
      });

      if (isCommon) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    const resultLen = Math.floor((lo + hi) / 2);
    const result = arr[0].substring(0, resultLen);

    yield {
      minLen: minLength,
      low: lo,
      high: hi,
      middle: 0,
      checkingLen: null,
      checkResult: null,
      candidatePrefix: result,
      step: stepNum++,
      status: `✓ Binary search complete! Longest common prefix: "${result}" (length ${resultLen})`,
      history: historyLog,
      done: true,
    };

    return result;
  }

  const runVisualization = useCallback(() => {
    const arr = inputStrings
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (arr.length === 0) {
      setStatus("❌ Please enter at least one string");
      return;
    }

    setStrs(arr);
    setRunning(true);
    setFinalResult(null);
    setStep(0);
    setHistory([]);

    const generator = longestCommonPrefixGen(arr);

    const animate = () => {
      const { value } = generator.next();

      if (value) {
        setMinLen(value.minLen);
        setLow(value.low);
        setHigh(value.high);
        setMiddle(value.middle);
        setCheckingLen(value.checkingLen);
        setCheckResult(value.checkResult);
        setCandidatePrefix(value.candidatePrefix);
        setStep(value.step);
        setStatus(value.status);
        setHistory(value.history);

        if (value.done) {
          setFinalResult(value.candidatePrefix);
          setTimeout(() => {
            setRunning(false);
          }, 2000);
        } else {
          timerRef.current = setTimeout(animate, 1000);
        }
      } else {
        setRunning(false);
      }
    };

    animate();
  }, [inputStrings]);

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
  };

  const reset = () => {
    stop();
    setFinalResult(null);
    setStep(0);
    setHistory([]);
    setMinLen(0);
    setLow(0);
    setHigh(0);
    setMiddle(0);
    setCheckingLen(null);
    setCheckResult(null);
    setCandidatePrefix("");
    setStatus('Click "Start" to find longest common prefix');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const samples = [
    { text: "flower,flow,flight", desc: "Classic" },
    { text: "dog,racecar,car", desc: "No prefix" },
    { text: "interspecies,interstellar,interstate", desc: "Long prefix" },
  ];

  return (
    <div className="flex flex-col gap-2 text-onSurface **:ease-in **:duration-150 ease-in duration-150">
      <h2 className="text-headline-medium">
        Longest Common Prefix (Binary Search)
      </h2>
      <p className="text-body-small">
        Binary search on prefix length (1 to minLen)[web:197][web:201]
      </p>

      {/* Status */}
      <div
        className={`p-2 bg-surfaceContainer line-clamp-1 overflow-hidden text-label-large rounded-md `}
      >
        Step {step}: {status}
      </div>

      {/* SVG Visualization */}
      <div
        className={`gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col relative `}
      >
        {/* Title */}
        <p className="text-center text-label-medium">
          Binary Search on Prefix Length
        </p>

        {/* Strings display */}
        <div className="overflow-x-scroll relative">
          <p className="text-title-medium mb-2">Input Strings:</p>

          {strs.map((str, idx) => {
            const y = 30 + idx * 0;
            return (
              <div key={idx} className="">
                <div
                  className={`flex p-2 rounded-lg relative mb-1 items-center w-full bg-inverseSurface text-inverseOnSurface tracking-wider`}
                >
                  <span>{str}</span>
                </div>

                {/* Highlight candidate prefix */}
                {candidatePrefix && str.startsWith(candidatePrefix) && (
                  <div
                    className="absolute bg-orange-400/30 outline-2 outline-orange-400/75 rounded-l-md h-9 z-30"
                    style={{
                      transform: `translate(2px, ${y - 72}px)`, // increase X for more left padding
                      width: `${candidatePrefix.length * 17 - 20}px`, // adjust width accordingly
                    }}
                  ></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Binary search range */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center">
          <span className="text-title-small mb-4">Binary Search Range</span>

          <div className="flex gap-2 justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-body-small">Min Length:</span>
                <div className="p-2 text-rose-400">{minLen}</div>
              </div>

              <div className="flex items-center text-left gap-1">
                <span className="text-body-small"> Low: </span>
                <div className="p-2 text-blue-400">{low}</div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-body-small">High:</span>
                <div className="p-2 text-indigo-400">{high}</div>
              </div>

              <div className="flex items-center text-left gap-1">
                <span className="text-body-small"> Middle: </span>
                <div className="p-2 text-orange-400">{middle}</div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-body-small">Checking Length:</span>
                <div className="p-2 text-green-400">{checkingLen ?? "-"}</div>
              </div>

              <div className="flex items-center text-left gap-1">
                <span className="text-body-small"> Middle: </span>
                <div
                  className={`p-2 textbody-small ${
                    checkResult === null
                      ? "text-cyan-400"
                      : checkResult
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {checkResult === null
                    ? "-"
                    : checkResult
                    ? "✓ Common"
                    : "✗ Not common"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate prefix */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center">
          <span className="text-title-small">Candidate Prefix</span>

          <div className="p-2">"{candidatePrefix || "(empty)"}"</div>
        </div>

        {/* History */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center">
          <span className="text-title-small">Check History (last 5):</span>

          {history.slice(-5).map((item, idx) => {
            const y = 25 + idx * 30;
            return (
              <span className="text-body-medium flex flex-col mt-2">
                L={item.low}, H={item.high}, M={item.middle} → "{item.prefix}
                ":
                <span
                  className={`font-bold ${
                    item.isCommon ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {item.isCommon ? "✓" : "✗"}
                </span>
              </span>
            );
          })}
        </div>

        {/* Final result */}
        {finalResult !== null && (
          <div className="p-2 bg-green-900/50 text-green-400 flex flex-col rounded-md text-center">
            ✓ Longest Common Prefix: "{finalResult}"
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex  flex-col gap-2 flex-wrap">
        <FilledTextField
          type="text"
          placeholder="Enter strings (comma-separated)"
          label={true}
          value={inputStrings}
          disabled={running}
          onChange={(e) => setInputStrings(e.target.value)}
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
          Longest Common Prefix (Binary Search):
        </h3>
        <ol className="text-body-large">
          <li>
            <strong>Find min length:</strong> The common prefix cannot exceed
            the shortest string's length[web:197][web:201].
          </li>
          <li>
            <strong>Binary search:</strong> Search space is [1, minLen]. Set
            low=1, high=minLen[web:197][web:201].
          </li>
          <li>
            <strong>Check middle:</strong> For mid = (low+high)/2, check if
            prefix of length mid is common to all strings[web:197][web:201].
          </li>
          <li>
            <strong>Adjust range:</strong> If common, search right half
            (low=mid+1); else search left half (high=mid-1)[web:197][web:201].
          </li>
          <li>
            <strong>Return result:</strong> When low &gt; high, the answer is
            the prefix of length (low+high)/2[web:197][web:201].
          </li>
        </ol>
        <p className="text-body-small mt-4 text-onError">
          <strong>Time Complexity:</strong> O(S × log(minLen)) where S is the
          sum of all characters[web:197][web:201].
          <br />
          <strong>Space Complexity:</strong> O(1)[web:197].
        </p>
      </div>
    </div>
  );
}

export default LongestCommonPrefixVisualizer;
