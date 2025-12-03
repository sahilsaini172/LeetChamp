import { CircleCheck, CircleX, X } from "lucide-react";
import React, { useState, useCallback, useRef, useEffect } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";

function ReverseIntegerVisualizer() {
  const [inputNumber, setInputNumber] = useState(123);
  const [running, setRunning] = useState(false);
  const [currentX, setCurrentX] = useState(0);
  const [reverse, setReverse] = useState(0);
  const [popDigit, setPopDigit] = useState(null);
  const [overflowCheck, setOverflowCheck] = useState({
    positive: false,
    negative: false,
  });
  const [digits, setDigits] = useState([]);
  const [stepNumber, setStepNumber] = useState(0);
  const [status, setStatus] = useState('Click "Start" to reverse integer');
  const [finalResult, setFinalResult] = useState(null);
  const [isOverflow, setIsOverflow] = useState(false);

  const animationRef = useRef(null);

  const INT_MAX = Math.pow(2, 31) - 1; // 2147483647
  const INT_MIN = -Math.pow(2, 31); // -2147483648

  // Reverse integer algorithm generator
  function* reverseIntegerGenerator(x) {
    let rev = 0;
    let step = 0;
    let extractedDigits = [];
    let hasOverflowed = false;

    yield {
      currentX: x,
      reverse: 0,
      popDigit: null,
      overflowCheck: { positive: false, negative: false },
      digits: [],
      step: step++,
      status: `Starting with x = ${x}`,
      done: false,
    };

    while (x !== 0) {
      // Extract last digit
      const pop = x % 10;
      extractedDigits.push(pop);

      yield {
        currentX: x,
        reverse: rev,
        popDigit: pop,
        overflowCheck: { positive: false, negative: false },
        digits: [...extractedDigits],
        step: step++,
        status: `Extract digit: x % 10 = ${pop}`,
        done: false,
      };

      // Update x (remove last digit)
      x = (x - pop) / 10;

      yield {
        currentX: x,
        reverse: rev,
        popDigit: pop,
        overflowCheck: { positive: false, negative: false },
        digits: [...extractedDigits],
        step: step++,
        status: `Remove digit: x = (${x * 10 + pop} - ${pop}) / 10 = ${x}`,
        done: false,
      };

      // Overflow check - positive
      const posOverflow =
        rev > Math.pow(2, 31) / 10 || (rev === Math.pow(2, 31) / 10 && pop > 7);

      // Overflow check - negative
      const negOverflow =
        rev < Math.pow(-2, 31) / 10 ||
        (rev === Math.pow(-2, 31) / 10 && pop < -8);

      yield {
        currentX: x,
        reverse: rev,
        popDigit: pop,
        overflowCheck: { positive: posOverflow, negative: negOverflow },
        digits: [...extractedDigits],
        step: step++,
        status: `Overflow check: rev=${rev}, pop=${pop}`,
        done: false,
      };

      if (posOverflow || negOverflow) {
        hasOverflowed = true;
        yield {
          currentX: x,
          reverse: rev,
          popDigit: pop,
          overflowCheck: { positive: posOverflow, negative: negOverflow },
          digits: [...extractedDigits],
          step: step++,
          status: `❌ OVERFLOW DETECTED! Returning 0`,
          done: true,
        };
        return 0;
      }

      // Build reverse number
      rev = rev * 10 + pop;

      yield {
        currentX: x,
        reverse: rev,
        popDigit: pop,
        overflowCheck: { positive: false, negative: false },
        digits: [...extractedDigits],
        step: step++,
        status: `Build reverse: (${rev - pop} × 10) + ${pop} = ${rev}`,
        done: false,
      };
    }

    yield {
      currentX: 0,
      reverse: rev,
      popDigit: null,
      overflowCheck: { positive: false, negative: false },
      digits: extractedDigits,
      step: step++,
      status: `✓ Complete! Reversed number: ${rev}`,
      done: true,
    };

    return rev;
  }

  // Run visualization
  const runVisualization = useCallback(() => {
    setRunning(true);
    setFinalResult(null);
    setStepNumber(0);
    setIsOverflow(false);

    const generator = reverseIntegerGenerator(inputNumber);

    const animate = () => {
      const { value, done } = generator.next();

      if (value) {
        setCurrentX(value.currentX);
        setReverse(value.reverse);
        setPopDigit(value.popDigit);
        setOverflowCheck(value.overflowCheck);
        setDigits(value.digits);
        setStepNumber(value.step);
        setStatus(value.status);

        if (value.done) {
          setFinalResult(value.reverse);
          setIsOverflow(false);
          setTimeout(() => {
            setRunning(false);
          }, 2000);
        } else {
          animationRef.current = setTimeout(animate, 1000);
        }
      } else {
        setRunning(false);
      }
    };

    animate();
  }, [inputNumber]);

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
    setCurrentX(0);
    setReverse(0);
    setPopDigit(null);
    setOverflowCheck({ positive: false, negative: false });
    setDigits([]);
    setStatus('Click "Start" to reverse integer');
    setIsOverflow(false);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  // Sample inputs
  const samples = [
    { num: 123, desc: "123 → 321" },
    { num: -123, desc: "-123 → -321" },
    { num: 120, desc: "120 → 21" },
    { num: 1534236469, desc: "Overflow → 0" },
  ];

  return (
    <div className="flex flex-col gap-2 text-onSurface **:ease-in **:duration-150 ease-in duration-150">
      <h2 className="text-headline-medium">
        Reverse Integer Visualizer (with Overflow Detection)
      </h2>

      {/* Status */}
      <div className={`p-2 bg-surfaceContainer text-label-large rounded-md `}>
        Step {stepNumber}: {status}
      </div>

      {/* SVG Visualization */}
      <div
        className={`gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col relative `}
      >
        {/* Title */}
        <p className="text-center text-label-medium">
          Integer Reversal Process
        </p>

        {/* Variables display */}
        <div className="h-[152px] overflow-x-scroll relative">
          {/* Original number */}
          <p className="text-title-medium">
            Current x:{" "}
            <span className="font-bold text-orange-400">
              {currentX || inputNumber}
            </span>
          </p>

          {/* Reverse being built */}
          <p className="text-title-medium">
            Reverse:
            <span className="font-bold text-indigo-400"> {reverse}</span>
          </p>

          {/* Current digit */}
          <div className="p-2 bg-surfaceContainer-high flex items-center  justify-center gap-4 h-16 mt-2 rounded-md text-center">
            {popDigit !== null && (
              <>
                <p>Popped Digit: </p>
                <div
                  className={`flex my-7 rounded-lg items-center justify-center size-12 text-white bg-primary`}
                >
                  <span className="text-onPrimary">{popDigit}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Digit extraction visualization */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col gap-4 -mt-8 rounded-md text-center">
          <p className="text-center text-label-medium">
            Digit Extraction Process
          </p>

          {/* Original number digits */}
          <div className="h-[88px] overflow-x-scroll">
            <p className="text-title-small  text-left text-orange-400">
              Original digits (left to right):
            </p>
            {digits.length > 0 && (
              <>
                {digits.map((digit, index) => {
                  const x = index * 65;
                  const isCurrent =
                    index === digits.length - 1 && popDigit === digit;

                  return (
                    <div key={index} className="relative flex">
                      <div
                        className={`absolute flex my-4 ${
                          isCurrent ? "bg-inverseSurface" : "bg-blue-400"
                        } rounded-lg items-center justify-center size-12  text-white`}
                        style={{ translate: `${x}px` }}
                      >
                        <span
                          className={
                            isCurrent ? "text-inverseOnSurface" : "text-white"
                          }
                        >
                          {digit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Formula display */}
          <p className="text-label-small  text-left ">
            Formula: <span className="font-bold">pop = x % 10</span>,{" "}
            <span className="font-bold">x = (x - pop) / 10</span>
          </p>
          <p className="text-label-small  text-left ">
            Build: <span className="font-bold">rev = rev × 10 + pop</span>
          </p>
        </div>

        {/* Overflow checking */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col gap-2 rounded-md text-center">
          <p className="text-center text-label-medium">
            32-bit Integer Overflow Check
          </p>

          <div className="flex w-full justify-between">
            {/* Bounds */}
            <div className="flex flex-col gap-2 w-1/2">
              <p className="text-title-small text-left">
                INT_MAX:{" "}
                <span className="text-red-400 font-bold">2147483647</span>
              </p>
              <p className="text-title-small text-left">
                INT_MIN:{" "}
                <span className="text-red-400 font-bold">-2147483648</span>
              </p>
            </div>

            {/* Current checks */}
            <div className="flex flex-col gap-2 w-1/2">
              <p
                className={`text-title-small text-left flex items-center gap-2 ${
                  overflowCheck.positive ? "text-red-400" : "text-green-400"
                }`}
              >
                Positive overflow:{" "}
                {overflowCheck.positive ? <CircleX /> : <CircleCheck />}
              </p>
              <p
                className={`text-title-small text-left flex items-center gap-2 ${
                  overflowCheck.negative ? "text-red-400" : "text-green-400"
                }`}
              >
                Positive overflow:{" "}
                {overflowCheck.negative ? <CircleX /> : <CircleCheck />}
              </p>
            </div>
          </div>

          {/* Overflow conditions */}
          <p className="text-label-small  text-left ">
            Check: rev &gt; 2³¹/10 OR (rev == 2³¹/10 AND pop &gt; 7)
          </p>
          <p className="text-label-small  text-left ">
            Check: rev &lt; -2³¹/10 OR (rev == -2³¹/10 AND pop &lt; -8)
          </p>

          {/* Result */}
          <p
            className={`text-title-small text-center  flex items-center h-6 gap-2 
                  ${isOverflow ? "text-red-400" : "text-green-400"}`}
          >
            {finalResult !== null &&
              (isOverflow
                ? "❌ OVERFLOW! Result: 0"
                : `✓ Result: ${finalResult}`)}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 w-full flex-wrap">
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-orange-400 rounded-full"></div>
          <span>Current x</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-indigo-400 rounded-full"></div>
          <span>Reverse (building)</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-primary rounded-full"></div>
          <span>Popped digit</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex  flex-col gap-2 flex-wrap">
        <FilledTextField
          type="text"
          value={inputNumber}
          onChange={(e) => setInputNumber(parseInt(e.target.value) || 0)}
          label={inputNumber}
          disabled={running}
          className="flex-1"
          placeholder="Enter integer"
          supportingText={false}
        />
        <div className="flex items-center gap-2">
          <StandardButtonS
            text={running ? "Reversing..." : "Reverse Number"}
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
        <h3 className="text-title-large mb-4">Reverse Integer Algorithm:</h3>
        <ol className="text-body-large">
          <li>
            <strong>Extract digit:</strong> pop = x % 10 (gets last digit)
          </li>
          <li>
            <strong>Remove digit:</strong> x = (x - pop) / 10 (integer division
            removes last digit)
          </li>
          <li>
            <strong>Overflow check (before building):</strong>
            <ul className="text-body-large">
              <li>
                Positive: rev &gt; 2³¹/10 OR (rev == 2³¹/10 AND pop &gt; 7)
              </li>
              <li>
                Negative: rev &lt; -2³¹/10 OR (rev == -2³¹/10 AND pop &lt; -8)
              </li>
            </ul>
          </li>
          <li>
            <strong>Build reverse:</strong> rev = rev × 10 + pop
          </li>
          <li>
            <strong>Repeat:</strong> Continue while x ≠ 0
          </li>
          <li>
            <strong>Return:</strong> rev if no overflow, 0 if overflow detected
          </li>
        </ol>
        <p className="text-body-small mt-4 text-onError">
          <strong>Why check before building?</strong> Prevents overflow during
          multiplication
          <br />
          <strong>Time Complexity:</strong> O(log n) where n is absolute value
          of input
          <br />
          <strong>Space Complexity:</strong> O(1)
        </p>
      </div>
    </div>
  );
}

export default ReverseIntegerVisualizer;
