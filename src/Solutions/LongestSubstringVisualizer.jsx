import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";

function LongestSubstringVisualizer() {
  const [inputString, setInputString] = useState("abcabcbb");
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [charSet, setCharSet] = useState(new Set());
  const [maxLength, setMaxLength] = useState(0);
  const [currentLength, setCurrentLength] = useState(0);
  const [bestSubstring, setBestSubstring] = useState("");
  const [currentSubstring, setCurrentSubstring] = useState("");
  const [stepNumber, setStepNumber] = useState(0);
  const [status, setStatus] = useState(
    'Click "Start" to find longest substring'
  );
  const [finalResult, setFinalResult] = useState(null);
  const [operation, setOperation] = useState("");

  const animationRef = useRef(null);

  // Longest substring algorithm generator
  function* longestSubstringGenerator(s) {
    let left = 0;
    let maxLength = 0;
    let charSet = new Set();
    let step = 0;
    let bestSub = "";

    yield {
      left: 0,
      right: -1,
      charSet: new Set(),
      maxLength: 0,
      currentLength: 0,
      bestSubstring: "",
      currentSubstring: "",
      step: step++,
      status: `Starting with string: "${s}"`,
      operation: "init",
      done: false,
    };

    for (let right = 0; right < s.length; right++) {
      yield {
        left,
        right,
        charSet: new Set(charSet),
        maxLength,
        currentLength: charSet.size,
        bestSubstring: bestSub,
        currentSubstring: s.substring(left, right),
        step: step++,
        status: `Moving right pointer to index ${right}: '${s[right]}'`,
        operation: "move_right",
        done: false,
      };

      // Check if character already exists
      if (charSet.has(s[right])) {
        yield {
          left,
          right,
          charSet: new Set(charSet),
          maxLength,
          currentLength: charSet.size,
          bestSubstring: bestSub,
          currentSubstring: s.substring(left, right),
          step: step++,
          status: `Duplicate found! '${s[right]}' already exists in set`,
          operation: "duplicate_found",
          done: false,
        };
      }

      // Remove duplicates by moving left pointer
      while (charSet.has(s[right])) {
        yield {
          left,
          right,
          charSet: new Set(charSet),
          maxLength,
          currentLength: charSet.size,
          bestSubstring: bestSub,
          currentSubstring: s.substring(left, right),
          step: step++,
          status: `Removing '${s[left]}' from set and moving left pointer`,
          operation: "removing",
          done: false,
        };

        charSet.delete(s[left]);
        left++;

        yield {
          left,
          right,
          charSet: new Set(charSet),
          maxLength,
          currentLength: charSet.size,
          bestSubstring: bestSub,
          currentSubstring: s.substring(left, right),
          step: step++,
          status: `Left pointer moved to ${left}`,
          operation: "moved_left",
          done: false,
        };
      }

      // Add current character
      charSet.add(s[right]);

      yield {
        left,
        right,
        charSet: new Set(charSet),
        maxLength,
        currentLength: charSet.size,
        bestSubstring: bestSub,
        currentSubstring: s.substring(left, right + 1),
        step: step++,
        status: `Added '${s[right]}' to set`,
        operation: "added",
        done: false,
      };

      // Update max length
      const newLength = right - left + 1;
      if (newLength > maxLength) {
        maxLength = newLength;
        bestSub = s.substring(left, right + 1);

        yield {
          left,
          right,
          charSet: new Set(charSet),
          maxLength,
          currentLength: newLength,
          bestSubstring: bestSub,
          currentSubstring: s.substring(left, right + 1),
          step: step++,
          status: `New max length! Length = ${maxLength}, substring = "${bestSub}"`,
          operation: "new_max",
          done: false,
        };
      } else {
        yield {
          left,
          right,
          charSet: new Set(charSet),
          maxLength,
          currentLength: newLength,
          bestSubstring: bestSub,
          currentSubstring: s.substring(left, right + 1),
          step: step++,
          status: `Current length = ${newLength} (max still ${maxLength})`,
          operation: "no_update",
          done: false,
        };
      }
    }

    yield {
      left,
      right: s.length - 1,
      charSet: new Set(charSet),
      maxLength,
      currentLength: charSet.size,
      bestSubstring: bestSub,
      currentSubstring: s.substring(left, s.length),
      step: step++,
      status: `✓ Complete! Longest substring: "${bestSub}" with length ${maxLength}`,
      operation: "complete",
      done: true,
    };

    return { maxLength, bestSubstring: bestSub };
  }

  // Run visualization
  const runVisualization = useCallback(() => {
    if (!inputString || inputString.length === 0) {
      setStatus("❌ Please enter a valid string");
      return;
    }

    setRunning(true);
    setFinalResult(null);
    setStepNumber(0);

    const generator = longestSubstringGenerator(inputString);

    const animate = () => {
      const { value, done } = generator.next();

      if (value) {
        setLeft(value.left);
        setRight(value.right);
        setCharSet(value.charSet);
        setMaxLength(value.maxLength);
        setCurrentLength(value.currentLength);
        setBestSubstring(value.bestSubstring);
        setCurrentSubstring(value.currentSubstring);
        setStepNumber(value.step);
        setStatus(value.status);
        setOperation(value.operation);

        if (value.done) {
          setFinalResult({
            maxLength: value.maxLength,
            substring: value.bestSubstring,
          });
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
    setLeft(0);
    setRight(0);
    setCharSet(new Set());
    setMaxLength(0);
    setCurrentLength(0);
    setBestSubstring("");
    setCurrentSubstring("");
    setOperation("");
    setStatus('Click "Start" to find longest substring');
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
    if (operation === "duplicate_found" && index === right) return "bg-hard";
    if (index === right && operation === "move_right") return "bg-medium";
    if (index >= left && index <= right) return "bg-easy";
    if (index < left) return "bg-inverseSurface";
    return "bg-surfaceContainer";
  };

  // Get character text color
  const getCharTextColor = (index) => {
    if (index >= left && index <= right) return "text-white";
    if (index < left) return "text-inverseOnSurface";
    return "text-onSurface";
  };

  return (
    <div className="flex flex-col gap-2 text-onSurface **:ease-in **:duration-150 ease-in duration-150">
      <h2 className="text-headline-medium">
        Longest Substring Without Repeating Characters
      </h2>

      {/* Status */}
      <div
        className={`p-2 ${
          finalResult == null ? "bg-surfaceContainer" : "bg-easy"
        } text-label-large ${
          finalResult == null ? "text-onSurface" : "text-black"
        } rounded-md `}
      >
        Step {stepNumber}: {status}
      </div>

      {/* SVG Visualization */}
      <div
        className={`gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col relative overflow-hidden`}
      >
        {/* Title */}
        <p className="text-center text-label-medium">
          Sliding Window Algorithm
        </p>

        {/* String visualization */}
        <div className="h-[152px] overflow-x-scroll relative">
          <p className="text-title-medium">Input String:</p>

          {inputString.split("").map((char, index) => {
            const x = index * 55;
            const y = 20;

            return (
              <div key={index} className="relative mx-2">
                {/* Character box */}
                <div
                  className={`absolute flex my-8 rounded-lg items-center justify-center size-12 ${getCharColor(
                    index
                  )} text-white`}
                  style={{ translate: `${x}px` }}
                >
                  <span className={getCharTextColor(index)}>{char}</span>
                  <span
                    className={`absolute text-invert -bottom-6 text-label-small`}
                  >
                    [{index}]
                  </span>
                </div>

                {/* Pointer indicators */}
                {index === left && (
                  <>
                    <div
                      className="flex text-label-medium flex-col items-center -space-y-1 text-blue-400 absolute"
                      style={{ translate: `${x + 9}px ${y + 80}px` }}
                    >
                      <ChevronUp size={16} />
                      <span>LEFT</span>
                    </div>
                  </>
                )}

                {index === right && right >= 0 && (
                  <>
                    <div
                      className="flex flex-col items-center -space-y-1 text-error text-label-medium absolute"
                      style={{ translate: `${x + 5}px ${y - 20}px` }}
                    >
                      <span>RIGHT</span>
                      <ChevronDown size={16} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
          {/* Current window highlight */}
          {left <= right && right >= 0 && (
            <div style={{ translate: `-14px 8px` }}>
              <div
                className="border-2 border-easy rounded-xl absolute"
                style={{
                  width: `${(right - left + 1) * 55 + 3}px`,
                  translate: `${left * 55 + 17}px 20px`,
                  height: `56px`,
                }}
              />
            </div>
          )}
        </div>

        {/* Character Set display */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center">
          <span className="text-title-small mb-4">
            Character Set (No Duplicates)
          </span>
          <div className="flex items-center text-body-small h-8">
            Current Set:
            {Array.from(charSet).map((char, index) => {
              const x = index * 40 + 75;

              return (
                <div
                  key={index}
                  className={`absolute flex rounded-lg items-center justify-center size-8 bg-blue-500 text-white font-bold`}
                  style={{ translate: `${x}px` }}
                >
                  <span>{char}</span>
                </div>
              );
            })}
          </div>
          <span className="flex text-body-small gap-2">
            Set Size:{" "}
            <span className="text-blue-500 font-bold">{charSet.size}</span>
          </span>
        </div>

        {/* Metrics */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center gap-4">
          <span className="text-title-small">Metrics</span>
          <div className="flex items-center text-body-small">
            <span className="flex text-body-small gap-2 w-1/2">
              Left Pointer:{" "}
              <span className="text-blue-500 font-bold">{left}</span>
            </span>
            <span className="flex text-body-small gap-2 w-1/2">
              Current Length:{" "}
              <span className="text-medium font-bold">{currentLength}</span>
            </span>
          </div>
          <div className="flex items-center text-body-small">
            <span className="flex text-body-small gap-2 w-1/2">
              Right Pointer:{" "}
              <span className="text-hard font-bold">{right}</span>
            </span>
            <span className="flex text-body-small gap-2 w-1/2">
              Max Length:{" "}
              <span className="text-easy font-bold">{maxLength}</span>
            </span>
          </div>
        </div>

        {/* Current and best substring */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-title-small">Current Window:</span>
            <span className="text-title-small flex-1 bg-surface rounded-md p-2 text-medium">
              "{currentSubstring}"
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-title-small">Best Substring:</span>
            <span className="text-title-small flex-1 bg-surface rounded-md p-2 text-easy">
              "{bestSubstring}" (length: {maxLength})
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 w-full flex-wrap">
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-surfaceContainer rounded-full"></div>
          <span>Unvisited</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-easy rounded-full"></div>
          <span>Current</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-medium rounded-full"></div>
          <span>Right Pointer(adding)</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-hard rounded-full"></div>
          <span>Duplicate Found</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-inverseSurface rounded-full"></div>
          <span>Visited</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex  flex-col gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <FilledTextField
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            label={inputString}
            disabled={running}
            className="flex-1"
            placeholder="Enter a string"
            supportingText={false}
          />
          <StandardButtonS
            text={running ? "Running..." : "Start"}
            onClick={runVisualization}
            disabled={running}
            className="w-30"
          />
        </div>
        <div className="flex items-center gap-2">
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
        <h3 className="text-title-large mb-4">Sliding Window Algorithm:</h3>
        <ol className="text-body-large">
          <li>
            <strong>Initialize:</strong> Set left = 0, maxLength = 0, create
            empty character set
          </li>
          <li>
            <strong>Right pointer loop:</strong> Iterate through string with
            right pointer (0 to length-1)
          </li>
          <li>
            <strong>Check duplicate:</strong> While current character exists in
            set:
          </li>
          <ul className="text-body-large">
            <li>Remove character at left pointer from set</li>
            <li>Move left pointer forward (shrink window from left)</li>
          </ul>
          <li>
            <strong>Add character:</strong> Add current character at right
            pointer to set
          </li>
          <li>
            <strong>Update max:</strong> Calculate current window length (right
            - left + 1)
          </li>
          <li>
            <strong>Track best:</strong> If current length &gt; maxLength,
            update maxLength
          </li>
          <li>
            <strong>Return:</strong> Return maxLength after processing entire
            string
          </li>
        </ol>
        <p className="text-body-small mt-4 text-onError">
          <strong>Time Complexity:</strong> O(n) where n is the string length
          (each character visited at most twice)
          <br />
          <strong>Space Complexity:</strong> O(min(m, n)) where m is the
          character set size
        </p>
      </div>
    </div>
  );
}

export default LongestSubstringVisualizer;
