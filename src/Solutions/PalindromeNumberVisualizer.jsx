import { useState, useCallback, useRef, useEffect } from "react";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";
import FilledTextField from "../components/textFields/FilledTextField";

function PalindromeNumberVisualizer() {
  const [inputNumber, setInputNumber] = useState(121);
  const [running, setRunning] = useState(false);
  const [currentX, setCurrentX] = useState(0);
  const [reverse, setReverse] = useState(0);
  const [xcopy, setXcopy] = useState(0);
  const [digits, setDigits] = useState([]);
  const [currentDigit, setCurrentDigit] = useState(null);
  const [stepNumber, setStepNumber] = useState(0);
  const [status, setStatus] = useState(
    'Click "Start" to check if number is palindrome'
  );
  const [result, setResult] = useState(null);

  const animationRef = useRef(null);

  // Palindrome algorithm generator
  function* palindromeGenerator(x) {
    if (x < 0) {
      yield {
        x: x,
        reverse: 0,
        xcopy: x,
        step: 0,
        digit: null,
        digits: [],
        status: `Number ${x} is negative → NOT a palindrome`,
        result: false,
        done: true,
      };
      return { result: false };
    }

    let reverse = 0;
    let xcopy = x;
    let step = 0;
    let extractedDigits = [];

    yield {
      x: xcopy,
      reverse: 0,
      xcopy: xcopy,
      step: step++,
      digit: null,
      digits: [],
      status: `Starting: x = ${xcopy}, reverse = 0`,
      result: null,
      done: false,
    };

    while (x > 0) {
      const digit = x % 10;
      extractedDigits.push(digit);

      yield {
        x: x,
        reverse: reverse,
        xcopy: xcopy,
        step: step++,
        digit: digit,
        digits: [...extractedDigits],
        status: `Extract digit: ${x} % 10 = ${digit}`,
        result: null,
        done: false,
      };

      reverse = reverse * 10 + digit;

      yield {
        x: x,
        reverse: reverse,
        xcopy: xcopy,
        step: step++,
        digit: digit,
        digits: [...extractedDigits],
        status: `Build reverse: (${
          reverse - digit
        } × 10) + ${digit} = ${reverse}`,
        result: null,
        done: false,
      };

      x = Math.floor(x / 10);

      yield {
        x: x,
        reverse: reverse,
        xcopy: xcopy,
        step: step++,
        digit: null,
        digits: [...extractedDigits],
        status: `Remove digit: x = ${x}`,
        result: null,
        done: false,
      };
    }

    const isPalindrome = reverse === xcopy;

    yield {
      x: 0,
      reverse: reverse,
      xcopy: xcopy,
      step: step++,
      digit: null,
      digits: extractedDigits,
      status: `Compare: reverse (${reverse}) ${
        isPalindrome ? "===" : "!=="
      } original (${xcopy}) → ${
        isPalindrome ? "✓ PALINDROME!" : "✗ NOT a palindrome"
      }`,
      result: isPalindrome,
      done: true,
    };

    return { result: isPalindrome };
  }

  // Run visualization
  const runVisualization = useCallback(() => {
    setRunning(true);
    setResult(null);
    setStepNumber(0);
    setDigits([]);

    const generator = palindromeGenerator(inputNumber);

    const animate = () => {
      const { value, done } = generator.next();

      if (value) {
        setCurrentX(value.x);
        setReverse(value.reverse);
        setXcopy(value.xcopy);
        setStepNumber(value.step);
        setCurrentDigit(value.digit);
        setDigits(value.digits);
        setStatus(value.status);

        if (value.done) {
          setResult(value.result);
          setTimeout(() => {
            setRunning(false);
            setCurrentDigit(null);
          }, 2000);
        } else {
          animationRef.current = setTimeout(animate, 1200);
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
    setCurrentDigit(null);
  };

  // Reset
  const reset = () => {
    stopVisualization();
    setResult(null);
    setStepNumber(0);
    setDigits([]);
    setReverse(0);
    setCurrentX(0);
    setXcopy(0);
    setStatus('Click "Start" to check if number is palindrome');
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
    <div className="flex flex-col gap-2 text-onSurface **:ease-in **:duration-150 ease-in duration-150">


      {/* Status */}
      <div className="p-2 bg-surfaceContainer text-label-large rounded-md">
        Step {stepNumber}: {status}
      </div>

      {/* SVG Visualization */}
      <div
        className={`gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col relative overflow-hidden`}
      >
        {/* Title */}
        <p className="text-center text-label-medium">Algorithm Visualization</p>

        {/* Variables Box */}
        <div className="flex items-center text-body-small gap-2">
          <div className="flex flex-col flex-1 gap-2">
            {/* Original Number */}
            <span className="flex text-body-small gap-2">
              Original (xcopy):{" "}
              <span className="text-blue-400 font-bold">
                {xcopy || inputNumber}
              </span>
            </span>

            {/* Current X */}
            <span className="flex text-body-small gap-2">
              Current x:{" "}
              <span className="text-orange-400 font-bold">{currentX}</span>
            </span>

            {/* Reverse */}
            <span className="flex text-body-small gap-2">
              Reverse:{" "}
              <span className="text-indigo-400 font-bold">{reverse}</span>
            </span>
          </div>
          <div className="flex flex-1 gap-2 items-center">
            <span className="text-body-small">Current Digit: </span>

            {/* Current Digit Highlight */}
            {currentDigit !== null && (
              <div
                className={`bg-red-400 flex rounded-lg items-center justify-center size-8 text-white`}
              >
                {" "}
                <span>{currentDigit}</span>
              </div>
            )}
          </div>
        </div>

        {/* Digit Flow Visualization */}
        <div className="h-[106px] overflow-x-scroll relative">
          <p className="text-title-medium">Extracted Digits (right to left):</p>
          {digits.map((digit, index) => {
            const x = index * 55;
            const isCurrentDigit =
              index === digits.length - 1 && currentDigit === digit;

            return (
              <div key={index} className="relative">
                <div
                  className={`absolute flex my-2 rounded-lg items-center justify-center size-12 ${
                    isCurrentDigit ? "bg-blue-400" : "bg-inverseSurface"
                  }`}
                  style={{ translate: `${x}px` }}
                >
                  <span
                    className={
                      isCurrentDigit ? "text-white" : "text-inverseOnSurface"
                    }
                  >
                    {digit}
                  </span>
                  <span
                    className={`absolute text-invert -bottom-6 text-label-small`}
                  >
                    [{digits.length - 1 - index}]
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Result indicator */}
        <div
          className={`h-10 rounded-md ${
            result ? "bg-green-400" : "bg-red-400"
          } text-white flex items-center justify-center`}
        >
          {result !== null && (
            <p>{result ? "✓ IS PALINDROME!" : "✗ NOT A PALINDROME"}</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex  flex-col gap-2 flex-wrap">
        <FilledTextField
          type="number"
          value={inputNumber}
          placeholder="Enter Number"
          supportingText={false}
          onChange={(e) => setInputNumber(Number(e.target.value))}
          disabled={running}
        />
        <div className="flex items-center gap-2">
          <StandardButtonS
            disabled={running}
            text={running ? "Running..." : "Start Check"}
            onClick={runVisualization}
            className="grow"
          />
          <StandardButtonS
            disabled={!running}
            text={"Stop"}
            onClick={stopVisualization}
            style="destruction"
            className=""
          />
        </div>
        <TonalButton disabled={running} text={"Reset"} onClick={reset} />
      </div>

      {/* Algorithm Explanation */}
      <div className="flex flex-col p-4 text-onSecondary bg-secondary rounded-sm">
        <h3 className="text-title-large mb-4">Algorithm Steps:</h3>
        <ol className="text-body-large">
          <li>
            <strong>Check negative:</strong> If x &lt; 0, return false
            immediately
          </li>
          <li>
            <strong>Initialize:</strong> Set reverse = 0, save original as xcopy
          </li>
          <li>
            <strong>Extract digit:</strong> Get last digit using x % 10
          </li>
          <li>
            <strong>Build reverse:</strong> Multiply current reverse by 10 and
            add the digit
          </li>
          <li>
            <strong>Remove digit:</strong> Divide x by 10 (integer division)
          </li>
          <li>
            <strong>Repeat:</strong> Continue steps 3-5 while x &gt; 0
          </li>
          <li>
            <strong>Compare:</strong> Check if reverse === xcopy
          </li>
        </ol>
      </div>
    </div>
  );
}

export default PalindromeNumberVisualizer;
