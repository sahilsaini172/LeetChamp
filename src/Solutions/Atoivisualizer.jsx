import React, { useState, useCallback, useRef, useEffect } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";
import { ChevronDown, ChevronUp } from "lucide-react";

function AtoiVisualizer() {
  const [inputString, setInputString] = useState("-42");
  const [running, setRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState("init");
  const [sign, setSign] = useState(1);
  const [result, setResult] = useState(0);
  const [stepNumber, setStepNumber] = useState(0);
  const [status, setStatus] = useState(
    'Click "Start" to convert string to integer'
  );
  const [finalResult, setFinalResult] = useState(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const [processedChars, setProcessedChars] = useState([]);

  const animationRef = useRef(null);

  const width = 1100;
  const height = 850;

  const INT_MAX = Math.pow(2, 31) - 1; // 2147483647
  const INT_MIN = -Math.pow(2, 31); // -2147483648

  // atoi algorithm generator
  function* atoiGenerator(s) {
    if (!s) {
      yield {
        index: 0,
        phase: "done",
        sign: 1,
        result: 0,
        step: 0,
        status: "Empty string, returning 0",
        processed: [],
        isOverflow: false,
        done: true,
      };
      return 0;
    }

    let i = 0;
    const n = s.length;
    let step = 0;
    const processed = [];

    yield {
      index: 0,
      phase: "init",
      sign: 1,
      result: 0,
      step: step++,
      status: `Starting atoi conversion for "${s}"`,
      processed: [],
      isOverflow: false,
      done: false,
    };

    // Step 1: Skip leading whitespace
    yield {
      index: i,
      phase: "whitespace",
      sign: 1,
      result: 0,
      step: step++,
      status: "Step 1: Skipping leading whitespace",
      processed: [],
      isOverflow: false,
      done: false,
    };

    while (i < n && s[i] === " ") {
      processed.push({ char: s[i], index: i, type: "whitespace" });
      yield {
        index: i,
        phase: "whitespace",
        sign: 1,
        result: 0,
        step: step++,
        status: `Skipping whitespace at index ${i}`,
        processed: [...processed],
        isOverflow: false,
        done: false,
      };
      i++;
    }

    // Check if we've reached the end
    if (i === n) {
      yield {
        index: i,
        phase: "done",
        sign: 1,
        result: 0,
        step: step++,
        status: "Reached end after whitespace, returning 0",
        processed: [...processed],
        isOverflow: false,
        done: true,
      };
      return 0;
    }

    // Step 2: Check for sign
    yield {
      index: i,
      phase: "sign",
      sign: 1,
      result: 0,
      step: step++,
      status: "Step 2: Checking for sign (+/-)",
      processed: [...processed],
      isOverflow: false,
      done: false,
    };

    let sign = 1;
    if (s[i] === "+") {
      processed.push({ char: s[i], index: i, type: "sign" });
      yield {
        index: i,
        phase: "sign",
        sign: 1,
        result: 0,
        step: step++,
        status: `Found '+' sign at index ${i}`,
        processed: [...processed],
        isOverflow: false,
        done: false,
      };
      i++;
    } else if (s[i] === "-") {
      sign = -1;
      processed.push({ char: s[i], index: i, type: "sign" });
      yield {
        index: i,
        phase: "sign",
        sign: -1,
        result: 0,
        step: step++,
        status: `Found '-' sign at index ${i}, number will be negative`,
        processed: [...processed],
        isOverflow: false,
        done: false,
      };
      i++;
    }

    // Step 3: Read digits and convert
    yield {
      index: i,
      phase: "digits",
      sign: sign,
      result: 0,
      step: step++,
      status: "Step 3: Reading and converting digits",
      processed: [...processed],
      isOverflow: false,
      done: false,
    };

    let res = 0;
    while (i < n && s[i] >= "0" && s[i] <= "9") {
      const digit = parseInt(s[i]);

      yield {
        index: i,
        phase: "digits",
        sign: sign,
        result: res,
        step: step++,
        status: `Reading digit '${digit}' at index ${i}`,
        processed: [...processed],
        isOverflow: false,
        done: false,
      };

      res = res * 10 + digit;
      processed.push({ char: s[i], index: i, type: "digit", value: digit });

      yield {
        index: i,
        phase: "digits",
        sign: sign,
        result: res,
        step: step++,
        status: `Updated result: ${res - digit} × 10 + ${digit} = ${res}`,
        processed: [...processed],
        isOverflow: false,
        done: false,
      };

      // Check for overflow
      if (sign * res <= INT_MIN) {
        yield {
          index: i,
          phase: "overflow",
          sign: sign,
          result: res,
          step: step++,
          status: `Overflow detected! Result ${
            sign * res
          } <= INT_MIN (${INT_MIN})`,
          processed: [...processed],
          isOverflow: true,
          done: true,
        };
        return INT_MIN;
      }
      if (sign * res >= INT_MAX) {
        yield {
          index: i,
          phase: "overflow",
          sign: sign,
          result: res,
          step: step++,
          status: `Overflow detected! Result ${
            sign * res
          } >= INT_MAX (${INT_MAX})`,
          processed: [...processed],
          isOverflow: true,
          done: true,
        };
        return INT_MAX;
      }

      i++;
    }

    // Check if stopped due to non-digit character
    if (i < n) {
      processed.push({ char: s[i], index: i, type: "stop" });
      yield {
        index: i,
        phase: "stop",
        sign: sign,
        result: res,
        step: step++,
        status: `Stopped at non-digit character '${s[i]}' at index ${i}`,
        processed: [...processed],
        isOverflow: false,
        done: false,
      };
    }

    // Step 4: Apply sign and return
    const finalResult = res * sign;
    yield {
      index: i,
      phase: "done",
      sign: sign,
      result: res,
      step: step++,
      status: `✓ Applying sign: ${res} × ${sign} = ${finalResult}`,
      processed: [...processed],
      isOverflow: false,
      done: true,
    };

    return finalResult;
  }

  // Run visualization
  const runVisualization = useCallback(() => {
    setRunning(true);
    setFinalResult(null);
    setStepNumber(0);
    setIsOverflow(false);

    const generator = atoiGenerator(inputString);

    const animate = () => {
      const { value, done } = generator.next();

      if (value) {
        setCurrentIndex(value.index);
        setPhase(value.phase);
        setSign(value.sign);
        setResult(value.result);
        setStepNumber(value.step);
        setStatus(value.status);
        setProcessedChars(value.processed);
        setIsOverflow(value.isOverflow);

        if (value.done) {
          setFinalResult(value.sign * value.result);
          setTimeout(() => {
            setRunning(false);
          }, 2000);
        } else {
          animationRef.current = setTimeout(animate, 800);
        }
      } else {
        setRunning(false);
      }
    };

    animate();
  }, [inputString]);

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
    setCurrentIndex(0);
    setPhase("init");
    setSign(1);
    setResult(0);
    setProcessedChars([]);
    setIsOverflow(false);
    setStatus('Click "Start" to convert string to integer');
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  // Get character color
  const getCharColor = (index) => {
    const proc = processedChars.find((p) => p.index === index);
    if (proc) {
      if (proc.type === "whitespace") return "bg-surface";
      if (proc.type === "sign") return "bg-rose-400";
      if (proc.type === "digit") return "bg-green-400";
      if (proc.type === "stop") return "bg-red-400";
    }
    if (index === currentIndex && phase !== "done") return "bg-orange-400";
    return "bg-surfaceContainer";
  };

  const getCharTextColor = (index) => {
    const color = getCharColor(index);
    if (color === "bg-surfaceContainer" || color === "bg-surface")
      return "text-onSurface";
    return "white";
  };

  return (
    <div className="flex flex-col gap-2 text-onSurface **:ease-in **:duration-150 ease-in duration-150">

      {/* Controls */}
      <div className="flex  flex-col gap-2 flex-wrap">
        <FilledTextField
          type="text"
          placeholder="Enter String"
          label={true}
          value={inputString}
          disabled={running}
          onChange={(e) => setInputString(e.target.value)}
          supportingText={false}
        />
        <div className="flex items-center gap-2">
          <StandardButtonS
            text={running ? "Converting..." : "Convert to Integer"}
            onClick={runVisualization}
            disabled={running}
            className="grow"
          />
          <StandardButtonS
            onClick={stopVisualization}
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
        Step {stepNumber}: {status}
      </div>

      {/* SVG Visualization */}
      <div
        className={`gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col relative`}
      >
        {/* Title */}
        <p className="text-center text-label-medium">Atoi Parsing Algorithm</p>

        {/* String visualization */}
        <div className="h-[140px] overflow-x-scroll relative">
          <p className="text-title-medium">Input String:</p>

          {inputString.split("").map((char, index) => {
            const x = index * 55;
            const y = 20;
            const displayChar = char === " " ? "␣" : char;

            return (
              <div key={index} className="relative mx-2">
                <div
                  className={`absolute flex my-7 rounded-lg items-center justify-center size-12 ${getCharColor(
                    index
                  )} text-white`}
                  style={{ translate: `${x}px` }}
                >
                  <span className={getCharTextColor(index)}>{displayChar}</span>
                  <span
                    className={`absolute text-invert -bottom-6 text-label-small`}
                  >
                    [{index}]
                  </span>
                </div>

                {/* Current pointer */}
                {index === currentIndex && phase !== "done" && (
                  <>
                    <div
                      className="flex flex-col items-center text-orange-400 text-label-medium absolute"
                      style={{ translate: `${x + 16}px ${y - 12}px` }}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Phase indicator */}
        <div className="p-2 bg-surfaceContainer-high gap-1 flex flex-col items-center rounded-md text-center">
          <span className="text-title-small">Current Phase</span>

          <rect
            x={350}
            y={45}
            width={300}
            height={45}
            fill={
              phase === "whitespace"
                ? "#95a5a6"
                : phase === "sign"
                ? "#e67e22"
                : phase === "digits"
                ? "#27ae60"
                : phase === "overflow"
                ? "#e74c3c"
                : "#3498db"
            }
            rx="8"
          />
          <span
            className={`${
              phase === "whitespace"
                ? "bg-surfaceContainer text-onSurface"
                : phase === "sign"
                ? "bg-orange-400 text-white"
                : phase === "digits"
                ? "bg-green-400 text-white"
                : phase === "overflow"
                ? "bg-red-400"
                : "bg-blue-400 text-white"
            } w-fit px-8 py-1 text-body-small rounded-sm`}
          >
            <span className="font-bold">
              {phase === "whitespace"
                ? "1. SKIP WHITESPACE"
                : phase === "sign"
                ? "2. CHECK SIGN"
                : phase === "digits"
                ? "3. READ DIGITS"
                : phase === "overflow"
                ? "OVERFLOW!"
                : phase === "done"
                ? "COMPLETE"
                : "INITIALIZING"}
            </span>
          </span>
        </div>

        {/* Variables */}
        <div className="p-2 bg-surfaceContainer-high gap-1 flex flex-col items-center rounded-md text-center">
          <span className="text-title-small">Variables</span>

          <div className="flex justify-between w-full p-2">
            <div className="flex grow flex-col text-left">
              {/* Index */}
              <div className="flex items-center gap-2">
                <span className="text-body-small">Index (i):</span>
                <div className="flex-1 rounded-md font-bold text-blue-400">
                  {currentIndex}
                </div>
              </div>

              {/* Sign */}
              <div className="flex items-center gap-2">
                <span className="text-body-small">Sign:</span>
                <div className="flex-1 rounded-md font-bold text-orange-400">
                  {sign === 1 ? "+1" : "-1"}
                </div>
              </div>
            </div>

            <div className="flex grow flex-col text-left">
              {/* Result */}
              <div className="flex items-center gap-2">
                <span className="text-body-small">Result (unsigned):</span>
                <div className="flex-1 rounded-md font-bold text-green-400">
                  {result}
                </div>
              </div>

              {/* Final value */}
              <div className="flex items-center gap-2">
                <span className="text-body-small">Signed value:</span>
                <div className="flex-1 rounded-md font-bold text-indigo-400">
                  {sign * result}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Character legend */}
        <div className="p-2 bg-surfaceContainer-high gap-1 flex flex-col items-center rounded-md text-center">
          <span className="text-title-small">Processed Characters</span>

          <div className="flex justify-between w-full p-2">
            <div className="flex grow flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-body-small">Whitespace (skipped):</span>
                <div className="flex-1 rounded-md font-bold text-blue-400">
                  {processedChars.filter((p) => p.type === "whitespace").length}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-body-small">Sign:</span>
                <div className="flex-1 rounded-md font-bold text-orange-400">
                  {processedChars
                    .filter((p) => p.type === "sign")
                    .map((p) => p.char)
                    .join("") || "none"}
                </div>
              </div>
            </div>

            <div className="flex grow flex-col text-left">
              {/* Result */}
              <div className="flex items-center gap-2">
                <span className="text-body-small">Digits read:</span>
                <div className="flex-1 rounded-md font-bold text-green-400">
                  {processedChars
                    .filter((p) => p.type === "digit")
                    .map((p) => p.char)
                    .join("")}
                </div>
              </div>

              {/* Final value */}
              <div className="flex items-center gap-2">
                <span className="text-body-small">Stop character:</span>
                <div className="flex-1 rounded-md font-bold text-indigo-400">
                  {processedChars
                    .filter((p) => p.type === "stop")
                    .map((p) => (p.char === " " ? "(space)" : `'${p.char}'`))
                    .join("") || "none"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overflow bounds */}
        <div className="p-2 bg-surfaceContainer-low gap-1 flex flex-col items-center rounded-md text-center">
          <span className="text-title-small">32-bit Integer Bounds</span>

          <div className="flex items-center justify-between w-full p-2">
            <span className="text-body-small">INT_MIN:</span>
            <div className="flex-1 rounded-md font-bold text-red-400">
              -2147483648
            </div>

            <span className="text-body-small">INT_MAX:</span>
            <div className="flex-1 rounded-md font-bold text-red-400">
              2147483647
            </div>
          </div>
        </div>

        <div className="p-2 bg-surfaceContainer-low gap-1 flex flex-col items-center rounded-md text-center h-12 justify-center">
          {/* Final result */}
          {finalResult !== null && (
            <span
              className={`${
                isOverflow ? "bg-red-400" : "bg-green-400"
              } text-white font-bold px-8 py-1 rounded-lg`}
            >
              {isOverflow
                ? `⚠️ OVERFLOW! Clamped to: ${finalResult}`
                : `✓ Result: ${finalResult}`}
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 w-full flex-wrap">
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-surfaceContainer rounded-full"></div>
          <span>Unvisited</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-rose-400 rounded-full"></div>
          <span>Sign (+/-)</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-surface rounded-full"></div>
          <span>Whitespace</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-green-400 rounded-full"></div>
          <span>Digit</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-orange-400 rounded-full"></div>
          <span>Current Position</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-red-400 rounded-full"></div>
          <span>Stop Character</span>
        </div>
      </div>

      {/* Algorithm explanation */}
      <div className="flex flex-col p-4 text-onSecondary bg-secondary rounded-sm">
        <h3 className="text-title-large mb-4">
          String to Integer (atoi) Algorithm:
        </h3>
        <ol className="text-body-large">
          <li>
            <strong>Step 1 - Skip whitespace:</strong> Ignore leading spaces
            until a non-space character is found
          </li>
          <li>
            <strong>Step 2 - Check sign:</strong> Look for '+' or '-' character
            (only one, at most)
          </li>
          <li>
            <strong>Step 3 - Read digits:</strong>
            <ul className="text-body-large">
              <li>Convert consecutive digits (0-9) to integer</li>
              <li>Build result: result = result × 10 + digit</li>
              <li>Stop at first non-digit character</li>
            </ul>
          </li>
          <li>
            <strong>Step 4 - Overflow check:</strong> If result exceeds 32-bit
            bounds, clamp to INT_MIN or INT_MAX
          </li>
          <li>
            <strong>Return:</strong> Apply sign and return final integer value
          </li>
        </ol>
        <p className="text-body-small mt-4 text-onError">
          <strong>Time Complexity:</strong> O(n) where n is string length
          <br />
          <strong>Space Complexity:</strong> O(1)
          <br />
          <strong>Edge Cases:</strong> Leading whitespace, optional sign,
          non-digit characters, integer overflow
        </p>
      </div>
    </div>
  );
}

export default AtoiVisualizer;
