import React, { useState, useCallback, useRef, useEffect } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";
import { ArrowRight } from "lucide-react";

function RomanToIntVisualizer() {
  const [inputRoman, setInputRoman] = useState("MCMXCIV");
  const [running, setRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [result, setResult] = useState(0);
  const [comparison, setComparison] = useState(null);
  const [operation, setOperation] = useState("");
  const [stepNumber, setStepNumber] = useState(0);
  const [status, setStatus] = useState(
    'Click "Start" to convert Roman numeral'
  );
  const [finalResult, setFinalResult] = useState(null);
  const [history, setHistory] = useState([]);

  const animationRef = useRef(null);

  const roman = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  // Roman to Integer algorithm generator
  function* romanToIntGenerator(s) {
    let res = 0;
    let step = 0;
    let historyLog = [];

    yield {
      index: -1,
      result: 0,
      comparison: null,
      operation: "",
      step: step++,
      status: `Starting conversion of "${s}"`,
      history: [],
      done: false,
    };

    for (let i = 0; i < s.length - 1; i++) {
      const currentVal = roman[s[i]];
      const nextVal = roman[s[i + 1]];

      yield {
        index: i,
        result: res,
        comparison: { current: s[i], next: s[i + 1], currentVal, nextVal },
        operation: "comparing",
        step: step++,
        status: `Compare: ${s[i]} (${currentVal}) vs ${s[i + 1]} (${nextVal})`,
        history: [...historyLog],
        done: false,
      };

      if (currentVal < nextVal) {
        res -= currentVal;
        historyLog.push({
          index: i,
          char: s[i],
          value: currentVal,
          operation: "subtract",
          result: res,
        });

        yield {
          index: i,
          result: res,
          comparison: { current: s[i], next: s[i + 1], currentVal, nextVal },
          operation: "subtract",
          step: step++,
          status: `${currentVal} < ${nextVal} → Subtract: ${
            res + currentVal
          } - ${currentVal} = ${res}`,
          history: [...historyLog],
          done: false,
        };
      } else {
        res += currentVal;
        historyLog.push({
          index: i,
          char: s[i],
          value: currentVal,
          operation: "add",
          result: res,
        });

        yield {
          index: i,
          result: res,
          comparison: { current: s[i], next: s[i + 1], currentVal, nextVal },
          operation: "add",
          step: step++,
          status: `${currentVal} >= ${nextVal} → Add: ${
            res - currentVal
          } + ${currentVal} = ${res}`,
          history: [...historyLog],
          done: false,
        };
      }
    }

    // Add last character
    const lastChar = s[s.length - 1];
    const lastVal = roman[lastChar];

    yield {
      index: s.length - 1,
      result: res,
      comparison: null,
      operation: "last",
      step: step++,
      status: `Processing last character: ${lastChar} (${lastVal})`,
      history: [...historyLog],
      done: false,
    };

    res += lastVal;
    historyLog.push({
      index: s.length - 1,
      char: lastChar,
      value: lastVal,
      operation: "add",
      result: res,
    });

    yield {
      index: s.length - 1,
      result: res,
      comparison: null,
      operation: "add",
      step: step++,
      status: `Add last character: ${res - lastVal} + ${lastVal} = ${res}`,
      history: [...historyLog],
      done: false,
    };

    yield {
      index: -1,
      result: res,
      comparison: null,
      operation: "complete",
      step: step++,
      status: `✓ Conversion complete! "${s}" = ${res}`,
      history: historyLog,
      done: true,
    };

    return { result: res };
  }

  // Run visualization
  const runVisualization = useCallback(() => {
    if (!inputRoman || !/^[IVXLCDM]+$/.test(inputRoman)) {
      setStatus("❌ Please enter a valid Roman numeral (I, V, X, L, C, D, M)");
      return;
    }

    setRunning(true);
    setFinalResult(null);
    setStepNumber(0);
    setHistory([]);

    const generator = romanToIntGenerator(inputRoman.toUpperCase());

    const animate = () => {
      const { value, done } = generator.next();

      if (value) {
        setCurrentIndex(value.index);
        setResult(value.result);
        setComparison(value.comparison);
        setOperation(value.operation);
        setStepNumber(value.step);
        setStatus(value.status);
        setHistory(value.history);

        if (value.done) {
          setFinalResult(value.result);
          setTimeout(() => {
            setRunning(false);
            setCurrentIndex(-1);
          }, 2000);
        } else {
          animationRef.current = setTimeout(animate, 1200);
        }
      } else {
        setRunning(false);
      }
    };

    animate();
  }, [inputRoman]);

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
    setHistory([]);
    setResult(0);
    setComparison(null);
    setOperation("");
    setStatus('Click "Start" to convert Roman numeral');
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

      {/* Status */}
      <div className="p-2 bg-surfaceContainer text-label-large rounded-md">
        Step {stepNumber}: {status}
      </div>

      {/* SVG Visualization */}
      <div
        className={`gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col relative overflow-hidden`}
      >
        {/* Title */}
        <p className="text-center top-4 text-label-medium w-full">
          Roman Numeral Conversion Process
        </p>

        {/* Roman characters display */}
        <div className="h-[130px] overflow-x-scroll">
          <p className="text-title-medium">Input String:</p>

          {inputRoman.split("").map((char, index) => {
            const x = index * 55;
            const y = 20;
            const isCurrent = index === currentIndex;
            const isNext = comparison && index === currentIndex + 1;
            const isPast = index < currentIndex;

            let bgColor = "bg-inverseSurface";
            let textColor = "text-inverseOnSurface";

            if (isCurrent) {
              bgColor =
                operation === "subtract" ? "bg-red-400" : "bg-green-400";
              textColor = "text-white";
            } else if (isNext) {
              bgColor = "bg-orange-400";
              textColor = "text-white";
            } else if (isPast) {
              bgColor = "bg-surfaceContainer-high";
              textColor = "text-onSurface";
            }

            return (
              <div key={index} className="relative flex">
                <div
                  className={`absolute ${bgColor} flex my-8 rounded-lg items-center justify-center size-12`}
                  style={{ translate: `${x}px` }}
                >
                  <span className={textColor}>{char}</span>
                  <span
                    className={`absolute text-invert -bottom-6 text-label-small`}
                  >
                    {roman[char]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison display */}
        <div className="py-2 px-4 bg-surfaceContainer-high rounded-md h-[115px] overflow-scroll">
          {comparison && (
            <div className="flex flex-col text-center gap-2">
              <span className="text-title-small">Comparison Logic</span>

              <div className="flex items-center w-full gap-4 relative">
                {/* Current character */}
                <div
                  className={`flex items-center justify-center size-12 bg-red-400 rounded-full text-white`}
                >
                  <span>{comparison.current}</span>
                  <span
                    className={`absolute text-invert text-nowrap -bottom-5 text-label-small`}
                  >
                    Value: {comparison.currentVal}
                  </span>
                </div>

                {/* Comparison symbol */}
                <span className="text-onSurface font-black">
                  {comparison.currentVal < comparison.nextVal ? "<" : "≥"}
                </span>

                {/* Next character */}
                <div
                  className={`flex flex-col relative items-center justify-center size-12 bg-orange-400 rounded-full text-white`}
                >
                  <span>{comparison.next}</span>
                  <span
                    className={`absolute flex text-nowrap text-invert -bottom-5 text-label-small`}
                  >
                    Value: {comparison.nextVal}
                  </span>
                </div>

                {/* Arrow and operation */}
                <ArrowRight size={16} />

                <div
                  className={`flex relative items-center justify-center p-2 rounded-lg text-white font-black w-fit ${
                    operation === "subtract" ? "bg-red-400" : "bg-green-400"
                  }`}
                >
                  <span>{operation === "subtract" ? "SUBTRACT" : "ADD"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Running total */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center gap-1 text-white">
          <span className="text-label-large">Running Total</span>
          <span className="font-bold text-blue-400">{result}</span>
        </div>

        {/* Operation history */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md gap-1">
          <span className="text-center text-title-small">
            Operation History
          </span>

          {history.slice(-5).map((item, index) => {
            const y = 35 + index * 25;
            return (
              <p key={index} className="text-body-medium">
                <span className="font-bold text-onSurfaceVarient">
                  [{item.index}]
                </span>{" "}
                {item.char} ({item.value}) →
                <span
                  className={
                    item.operation === "subtract"
                      ? "text-red-400 font-semibold"
                      : "text-green-400 font-semibold"
                  }
                  fontWeight="bold"
                >
                  {" "}
                  {item.operation === "subtract" ? "SUBTRACT" : "ADD"}{" "}
                </span>
                → Result: {item.result}
              </p>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 w-full flex-wrap">
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-inverseSurface rounded-full"></div>
          <span>Unvisited</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-red-400 rounded-full"></div>
          <span>Current(Subtract)</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-green-400 rounded-full"></div>
          <span>Current(Add)</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-orange-400 rounded-full"></div>
          <span>Next Character</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-surfaceContainer rounded-full"></div>
          <span>Visited</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col items-center gap-2 w-full">
          <FilledTextField
            type="text"
            value={inputRoman}
            onChange={(e) => setInputRoman(e.target.value.toUpperCase())}
            className="w-full"
            placeholder="Enter Roman Numbers"
            label={inputRoman}
            supportingText={false}
            disabled={running}
          />
        </div>
        <div className="flex items-center gap-2">
          <StandardButtonS
            text={running ? "Coverting..." : "Start Conversion"}
            disabled={running}
            onClick={runVisualization}
            className="grow"
          />
          <TonalButton
            text="Stop"
            onClick={stopVisualization}
            disabled={!running}
            style="destruction"
          />
          <TonalButton text="Reset" onClick={reset} disabled={running} />
        </div>
      </div>

      {/* Algorithm explanation */}
      <div className="flex flex-col p-4 text-onSecondary bg-secondary rounded-sm">
        <h3 className="text-title-large mb-4">Roman to Integer Algorithm:</h3>
        <ol className="text-body-large">
          <li>
            <strong>Create value map:</strong> Map each Roman symbol to its
            integer value (I=1, V=5, X=10, etc.)
          </li>
          <li>
            <strong>Initialize result:</strong> Start with res = 0
          </li>
          <li>
            <strong>Loop through string:</strong> For each character (except the
            last)
          </li>
          <li>
            <strong>Compare values:</strong> Check if current value &lt; next
            value
          </li>
          <li>
            <strong>Subtract rule:</strong> If current &lt; next, subtract
            current from result (e.g., IV → 5-1=4)
          </li>
          <li>
            <strong>Add rule:</strong> Otherwise, add current to result
          </li>
          <li>
            <strong>Add last character:</strong> Always add the last character's
            value
          </li>
          <li>
            <strong>Return result:</strong> The accumulated sum is the integer
            value
          </li>
        </ol>
        <p className="text-body-small mt-4 text-onError">
          <strong>Example:</strong> "MCMXCIV" = 1000 + (1000-100) + (100-10) +
          (5-1) = 1994
        </p>
      </div>
    </div>
  );
}

export default RomanToIntVisualizer;
