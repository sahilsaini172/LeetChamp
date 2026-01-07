import React, { useState, useCallback, useRef, useEffect } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";
import { ArrowRight } from "lucide-react";

function IntToRomanVisualizer() {
  const [inputNum, setInputNum] = useState(1994);
  const [running, setRunning] = useState(false);

  const [currentPairIndex, setCurrentPairIndex] = useState(-1);
  const [currentValue, setCurrentValue] = useState(null);
  const [currentSymbol, setCurrentSymbol] = useState(null);

  const [numRemaining, setNumRemaining] = useState(0);
  const [romanOut, setRomanOut] = useState("");

  const [stepNumber, setStepNumber] = useState(0);
  const [status, setStatus] = useState('Click "Start" to convert integer');
  const [finalResult, setFinalResult] = useState(null);

  const [history, setHistory] = useState([]);

  const animationRef = useRef(null);

  // Greedy mapping including subtractive cases (most common approach)
  const pairs = [
    { value: 1000, symbol: "M" },
    { value: 900, symbol: "CM" },
    { value: 500, symbol: "D" },
    { value: 400, symbol: "CD" },
    { value: 100, symbol: "C" },
    { value: 90, symbol: "XC" },
    { value: 50, symbol: "L" },
    { value: 40, symbol: "XL" },
    { value: 10, symbol: "X" },
    { value: 9, symbol: "IX" },
    { value: 5, symbol: "V" },
    { value: 4, symbol: "IV" },
    { value: 1, symbol: "I" },
  ];

  // Int to Roman algorithm generator (greedy)
  function* intToRomanGenerator(num) {
    let step = 0;
    let out = "";
    let n = num;
    const historyLog = [];

    yield {
      pairIndex: -1,
      currentValue: null,
      currentSymbol: null,
      numRemaining: n,
      romanOut: out,
      step: step++,
      status: `Starting conversion of ${num}`,
      history: [],
      done: false,
    };

    for (let i = 0; i < pairs.length; i++) {
      const { value, symbol } = pairs[i];

      yield {
        pairIndex: i,
        currentValue: value,
        currentSymbol: symbol,
        numRemaining: n,
        romanOut: out,
        step: step++,
        status: `Considering ${symbol} (${value})`,
        history: [...historyLog],
        done: false,
      };

      if (n >= value) {
        const count = Math.floor(n / value);

        // show decision
        yield {
          pairIndex: i,
          currentValue: value,
          currentSymbol: symbol,
          numRemaining: n,
          romanOut: out,
          step: step++,
          status: `${value} fits into ${n} → count = ${count}. Append "${symbol}" × ${count}`,
          history: [...historyLog],
          done: false,
        };

        // append count times (step-by-step so animation is visible)
        for (let k = 0; k < count; k++) {
          out += symbol;
          n -= value;

          historyLog.push({
            symbol,
            value,
            operation: "append",
            romanOut: out,
            numRemaining: n,
          });

          yield {
            pairIndex: i,
            currentValue: value,
            currentSymbol: symbol,
            numRemaining: n,
            romanOut: out,
            step: step++,
            status: `Appended "${symbol}", remaining = ${n}`,
            history: [...historyLog],
            done: false,
          };
        }
      }
    }

    yield {
      pairIndex: -1,
      currentValue: null,
      currentSymbol: null,
      numRemaining: 0,
      romanOut: out,
      step: step++,
      status: `✓ Conversion complete! ${num} = "${out}"`,
      history: historyLog,
      done: true,
    };

    return out;
  }

  const runVisualization = useCallback(() => {
    const n = Number(inputNum);

    if (!Number.isInteger(n) || n < 1 || n > 3999) {
      setStatus("❌ Enter an integer in range 1 to 3999");
      return;
    }

    setRunning(true);
    setFinalResult(null);
    setStepNumber(0);
    setHistory([]);

    const generator = intToRomanGenerator(n);

    const animate = () => {
      const { value } = generator.next();

      if (value) {
        setCurrentPairIndex(value.pairIndex);
        setCurrentValue(value.currentValue);
        setCurrentSymbol(value.currentSymbol);

        setNumRemaining(value.numRemaining);
        setRomanOut(value.romanOut);

        setStepNumber(value.step);
        setStatus(value.status);
        setHistory(value.history);

        if (value.done) {
          setFinalResult(value.romanOut);
          setTimeout(() => {
            setRunning(false);
            setCurrentPairIndex(-1);
          }, 1200);
        } else {
          animationRef.current = setTimeout(animate, 900);
        }
      } else {
        setRunning(false);
      }
    };

    animate();
  }, [inputNum]);

  const stopVisualization = () => {
    if (animationRef.current) clearTimeout(animationRef.current);
    setRunning(false);
    setCurrentPairIndex(-1);
  };

  const reset = () => {
    stopVisualization();
    setFinalResult(null);
    setStepNumber(0);
    setHistory([]);
    setNumRemaining(0);
    setRomanOut("");
    setCurrentPairIndex(-1);
    setCurrentValue(null);
    setCurrentSymbol(null);
    setStatus('Click "Start" to convert integer');
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full text-onSurface **:ease-in **:duration-150 ease-in duration-150">


      {/* Status */}
      <div className="p-2 bg-surfaceContainer text-label-large rounded-md">
        Step {stepNumber}: {status}
      </div>

      {/* Visualization */}
      <div className="gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col relative overflow-hidden">
        <p className="text-center top-4 text-label-medium w-full">
          Integer → Roman (Greedy)
        </p>

        {/* Pair list (like your previous "Input String" row, but for mapping) */}
        <div className="h-[140px] overflow-x-scroll">
          <p className="text-title-medium">Roman Pairs (largest → smallest):</p>

          <div className="relative flex items-center mt-6">
            {pairs.map((p, idx) => {
              const x = idx * 86;

              const isCurrent = idx === currentPairIndex;
              const bg =
                isCurrent ? "bg-orange-400" : "bg-surfaceContainer-high";
              const txt = isCurrent ? "text-white" : "text-onSurface";

              return (
                <div key={idx} className="relative flex">
                  <div
                    className={`absolute ${bg} flex flex-col rounded-lg items-center justify-center h-14 w-20`}
                    style={{ translate: `${x}px` }}
                  >
                    <span className={`text-label-large font-bold ${txt}`}>
                      {p.symbol}
                    </span>
                    <span className={`text-label-small ${txt}`}>
                      {p.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current decision */}
        <div className="py-2 px-4 bg-surfaceContainer-high rounded-md">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-col">
              <span className="text-title-small">Remaining number</span>
              <span className="text-title-large font-black text-blue-400">
                {numRemaining}
              </span>
            </div>

            <ArrowRight size={18} />

            <div className="flex flex-col">
              <span className="text-title-small">Current pair</span>
              <span className="text-title-large font-black">
                {currentSymbol ?? "-"}{" "}
                <span className="text-onSurfaceVarient">
                  ({currentValue ?? "-"})
                </span>
              </span>
            </div>

            <ArrowRight size={18} />

            <div className="flex flex-col">
              <span className="text-title-small">Output so far</span>
              <span className="text-title-large font-black text-green-400">
                {romanOut || "(empty)"}
              </span>
            </div>
          </div>
        </div>

        {/* Operation history */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md gap-1 max-h-[160px] overflow-auto">
          <span className="text-center text-title-small">Operation History</span>

          {history.slice(-8).map((item, index) => (
            <p key={index} className="text-body-medium">
              Append{" "}
              <span className="text-green-400 font-semibold">
                {item.symbol}
              </span>{" "}
              ({item.value}) → remaining:{" "}
              <span className="text-blue-400 font-semibold">
                {item.numRemaining}
              </span>{" "}
              → out:{" "}
              <span className="text-green-400 font-semibold">
                {item.romanOut}
              </span>
            </p>
          ))}
        </div>

        {/* Final */}
        {finalResult !== null && (
          <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center gap-1">
            <span className="text-label-large">Final Roman</span>
            <span className="font-black text-green-400 text-title-large">
              {finalResult}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 w-full flex-wrap">
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-surfaceContainer-high rounded-full"></div>
          <span>Not current</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-orange-400 rounded-full"></div>
          <span>Current pair</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col items-center gap-2 w-full">
          <FilledTextField
            type="number"
            value={inputNum}
            onChange={(e) => setInputNum(e.target.value)}
            className="w-full"
            placeholder="Enter an integer (1..3999)"
            label={`${inputNum}`}
            supportingText={false}
            disabled={running}
          />
        </div>

        <div className="flex items-center gap-2">
          <StandardButtonS
            text={running ? "Converting..." : "Start Conversion"}
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
        <h3 className="text-title-large mb-4">Integer to Roman Algorithm:</h3>
        <ol className="text-body-large">
          <li>
            <strong>Prepare ordered pairs:</strong> Use a list of values and
            symbols from largest to smallest, including subtractive cases like
            900→CM, 4→IV. [web:184][web:180]
          </li>
          <li>
            <strong>Greedy choose:</strong> For each pair (value, symbol), while
            num ≥ value, append symbol and subtract value. [web:184][web:180]
          </li>
          <li>
            <strong>Stop:</strong> When num becomes 0, the built string is the
            Roman numeral. [web:184]
          </li>
        </ol>

        <p className="text-body-small mt-4 text-onError">
          <strong>Example:</strong> 1994 = 1000(M) + 900(CM) + 90(XC) + 4(IV) →
          "MCMXCIV". [web:180][web:184]
        </p>
      </div>
    </div>
  );
}

export default IntToRomanVisualizer;
