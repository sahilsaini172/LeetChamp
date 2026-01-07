import React, { useState, useCallback, useRef, useEffect } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import TonalButton from "../components/buttons/TonalButton";
import StandardButtonS from "../components/buttons/StandardButton";
import { ChevronDown, ChevronUp } from "lucide-react";

function LongestPalindromeVisualizer() {
  const [inputString, setInputString] = useState("babad");
  const [running, setRunning] = useState(false);
  const [currentLength, setCurrentLength] = useState(0);
  const [currentStart, setCurrentStart] = useState(0);
  const [checkingSubstring, setCheckingSubstring] = useState("");
  const [checkLeft, setCheckLeft] = useState(-1);
  const [checkRight, setCheckRight] = useState(-1);
  const [isChecking, setIsChecking] = useState(false);
  const [isPalindromeResult, setIsPalindromeResult] = useState(null);
  const [longestPalindrome, setLongestPalindrome] = useState("");
  const [stepNumber, setStepNumber] = useState(0);
  const [status, setStatus] = useState(
    'Click "Start" to find longest palindrome'
  );
  const [finalResult, setFinalResult] = useState(null);
  const [checkedSubstrings, setCheckedSubstrings] = useState([]);

  const animationRef = useRef(null);

  const width = 1100;
  const height = 950;

  // Longest palindrome algorithm generator
  function* longestPalindromeGenerator(s) {
    let step = 0;
    let longestFound = "";
    const checked = [];

    yield {
      currentLength: s.length,
      currentStart: 0,
      checkingSubstring: "",
      checkLeft: -1,
      checkRight: -1,
      isChecking: false,
      isPalindromeResult: null,
      longestPalindrome: "",
      step: step++,
      status: `Starting with string: "${s}" (length ${s.length})`,
      checkedSubstrings: [],
      done: false,
    };

    // Check function generator
    function* checkPalindrome(i, j) {
      const substring = s.substring(i, j);
      let left = i;
      let right = j - 1;

      yield {
        currentLength: j - i,
        currentStart: i,
        checkingSubstring: substring,
        checkLeft: -1,
        checkRight: -1,
        isChecking: true,
        isPalindromeResult: null,
        longestPalindrome: longestFound,
        step: step++,
        status: `Checking substring "${substring}" from index ${i} to ${j - 1}`,
        checkedSubstrings: [...checked],
        done: false,
      };

      while (left < right) {
        yield {
          currentLength: j - i,
          currentStart: i,
          checkingSubstring: substring,
          checkLeft: left,
          checkRight: right,
          isChecking: true,
          isPalindromeResult: null,
          longestPalindrome: longestFound,
          step: step++,
          status: `Comparing s[${left}]='${s.charAt(
            left
          )}' with s[${right}]='${s.charAt(right)}'`,
          checkedSubstrings: [...checked],
          done: false,
        };

        if (s.charAt(left) !== s.charAt(right)) {
          yield {
            currentLength: j - i,
            currentStart: i,
            checkingSubstring: substring,
            checkLeft: left,
            checkRight: right,
            isChecking: false,
            isPalindromeResult: false,
            longestPalindrome: longestFound,
            step: step++,
            status: `Not a palindrome: '${s.charAt(left)}' ≠ '${s.charAt(
              right
            )}'`,
            checkedSubstrings: [...checked],
            done: false,
          };

          checked.push({
            substring,
            isPalindrome: false,
            start: i,
            end: j - 1,
          });
          return false;
        }

        left++;
        right--;
      }

      yield {
        currentLength: j - i,
        currentStart: i,
        checkingSubstring: substring,
        checkLeft: -1,
        checkRight: -1,
        isChecking: false,
        isPalindromeResult: true,
        longestPalindrome: longestFound,
        step: step++,
        status: `✓ Palindrome found: "${substring}"`,
        checkedSubstrings: [...checked],
        done: false,
      };

      checked.push({ substring, isPalindrome: true, start: i, end: j - 1 });
      return true;
    }

    // Main loop: try all lengths from longest to shortest
    for (let length = s.length; length > 0; length--) {
      yield {
        currentLength: length,
        currentStart: 0,
        checkingSubstring: "",
        checkLeft: -1,
        checkRight: -1,
        isChecking: false,
        isPalindromeResult: null,
        longestPalindrome: longestFound,
        step: step++,
        status: `Trying length ${length}...`,
        checkedSubstrings: [...checked],
        done: false,
      };

      // Try all possible starting positions for this length
      for (let start = 0; start <= s.length - length; start++) {
        yield {
          currentLength: length,
          currentStart: start,
          checkingSubstring: s.substring(start, start + length),
          checkLeft: -1,
          checkRight: -1,
          isChecking: false,
          isPalindromeResult: null,
          longestPalindrome: longestFound,
          step: step++,
          status: `Trying start position ${start} with length ${length}`,
          checkedSubstrings: [...checked],
          done: false,
        };

        // Check if this substring is a palindrome
        const checkGen = checkPalindrome(start, start + length);
        let checkResult;

        for (const value of checkGen) {
          yield value;
          if (value.isPalindromeResult !== null) {
            checkResult = value.isPalindromeResult;
          }
        }

        // If we found a palindrome, this is the longest (since we search from longest first)
        if (checkResult) {
          longestFound = s.substring(start, start + length);

          yield {
            currentLength: length,
            currentStart: start,
            checkingSubstring: longestFound,
            checkLeft: -1,
            checkRight: -1,
            isChecking: false,
            isPalindromeResult: true,
            longestPalindrome: longestFound,
            step: step++,
            status: `✓ Found longest palindrome: "${longestFound}" (length ${length})`,
            checkedSubstrings: [...checked],
            done: true,
          };

          return longestFound;
        }
      }
    }

    yield {
      currentLength: 0,
      currentStart: 0,
      checkingSubstring: "",
      checkLeft: -1,
      checkRight: -1,
      isChecking: false,
      isPalindromeResult: null,
      longestPalindrome: "",
      step: step++,
      status: "No palindrome found (empty string)",
      checkedSubstrings: [...checked],
      done: true,
    };

    return "";
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
    setCheckedSubstrings([]);

    const generator = longestPalindromeGenerator(inputString);

    const animate = () => {
      const { value, done } = generator.next();

      if (value) {
        setCurrentLength(value.currentLength);
        setCurrentStart(value.currentStart);
        setCheckingSubstring(value.checkingSubstring);
        setCheckLeft(value.checkLeft);
        setCheckRight(value.checkRight);
        setIsChecking(value.isChecking);
        setIsPalindromeResult(value.isPalindromeResult);
        setLongestPalindrome(value.longestPalindrome);
        setStepNumber(value.step);
        setStatus(value.status);
        setCheckedSubstrings(value.checkedSubstrings);

        if (value.done) {
          setFinalResult(value.longestPalindrome);
          setTimeout(() => {
            setRunning(false);
          }, 2000);
        } else {
          animationRef.current = setTimeout(animate, 600);
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
    setCurrentLength(0);
    setCurrentStart(0);
    setCheckingSubstring("");
    setCheckLeft(-1);
    setCheckRight(-1);
    setIsChecking(false);
    setIsPalindromeResult(null);
    setLongestPalindrome("");
    setCheckedSubstrings([]);
    setStatus('Click "Start" to find longest palindrome');
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  // Get character color for main string
  const getCharColor = (index) => {
    const end = currentStart + currentLength - 1;

    if (checkLeft >= 0 && checkRight >= 0) {
      if (index === checkLeft || index === checkRight) {
        return isPalindromeResult === false ? "bg-red-400" : "bg-orange-400";
      }
    }

    if (index >= currentStart && index <= end && checkingSubstring) {
      if (finalResult && checkingSubstring === longestPalindrome) {
        return "bg-green-400";
      }
      return "bg-inverseSurface";
    }

    return "bg-surfaceContainer";
  };

  const getCharTextColor = (index) => {
    const color = getCharColor(index);
    if (color === "bg-inverseSurface") return "text-black";
    return "white";
  };

  return (
    <div className="flex flex-col gap-2 text-onSurface **:ease-in **:duration-150 ease-in duration-150">
       


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
          Brute Force Palindrome Search
        </p>

        {/* Input string visualization */}
        <div className="h-[152px] overflow-x-scroll relative">
          <p className="text-title-medium">Input String:</p>

          {inputString.split("").map((char, index) => {
            const x = index * 55;
            const y = 20;

            return (
              <div key={index} className="relative mx-2">
                {/* Character box */}
                <div
                  className={`absolute flex my-7 rounded-lg items-center justify-center size-12 ${getCharColor(
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

                {/* Check pointers */}
                {index === checkLeft && checkLeft >= 0 && (
                  <>
                    <div
                      className="flex text-label-medium flex-col items-center -space-y-1 text-blue-400 absolute"
                      style={{ translate: `${x + 8}px ${y + 80}px` }}
                    >
                      <ChevronUp size={16} />
                      <span>LEFT</span>
                    </div>
                  </>
                )}

                {index === checkRight && checkRight >= 0 && (
                  <>
                    <div
                      className="flex flex-col items-center -space-y-1 text-rose-400 text-label-medium absolute"
                      style={{ translate: `${x + 4}px ${y - 25}px` }}
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
          {checkingSubstring && currentStart >= 0 && (
            <div
              className={`border-2 border-dashed rounded-xl absolute ${
                isPalindromeResult === true
                  ? "border-green-400"
                  : isPalindromeResult === false
                  ? "border-red-400"
                  : "border-inverseSurface"
              }`}
              style={{
                left: `${currentStart * 55 + 3}px`,
                width: `${(currentLength - currentStart + 1) * 55 - 52}px`,
                top: "48px",
                height: "56px",
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {/* Current substring being checked */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center">
          <span className="text-title-small mb-4">Current Substring Check</span>
          <div className="flex items-center gap-2">
            <span className="text-body-small">Substring:</span>
            <div className="flex-1 p-2 bg-surface rounded-md text-blue-400">
              "{checkingSubstring || "(none)"}"
            </div>
          </div>

          <div className="flex items-center text-left gap-2">
            <span className="text-body-small"> Position: </span>
            <div className="p-2 text-orange-400">
              [{currentStart} to {currentStart + currentLength - 1}]
            </div>
          </div>
          <div className="flex items-center text-left gap-2">
            <span className="text-body-small">Length: </span>
            <div className="p-2 text-indigo-400">{currentLength}</div>
          </div>
        </div>

        {/* Check function visualization */}
        <div className="bg-surfaceContainer-high h-[120px] rounded-md">
          {isChecking && checkLeft >= 0 && checkRight >= 0 && (
            <div className="p-2 flex flex-col text-center">
              <span className="text-title-small mb-4">
                Checking: Two-Pointer Comparison
              </span>
              <div className="flex items-center justify-center gap-8">
                {/* Left character */}
                <div className="flex flex-col">
                  <div
                    className={`flex rounded-lg relative items-center justify-center bg-orange-400 size-12 text-white`}
                  >
                    <span>{inputString.charAt(checkLeft)}</span>
                    <span
                      className={`absolute text-invert -bottom-5 text-label-small`}
                    >
                      left[{checkLeft}]
                    </span>
                  </div>
                </div>

                {/* Comparison */}
                <div className="flex flex-col">
                  <div
                    className={`flex rounded-lg relative items-center justify-center size-12 text-white`}
                  >
                    <span>
                      {inputString.charAt(checkLeft) ===
                      inputString.charAt(checkRight)
                        ? "=="
                        : "≠"}
                    </span>
                  </div>
                </div>

                {/* Right character */}
                <div className="flex flex-col">
                  <div
                    className={`flex rounded-lg relative items-center justify-center bg-orange-400 size-12 text-white`}
                  >
                    <span>{inputString.charAt(checkRight)}</span>
                    <span
                      className={`absolute text-invert -bottom-5 text-label-small`}
                    >
                      right[{checkRight}]
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result indicator */}
          {isPalindromeResult !== null && (
            <div
              className={`flex items-center justify-center text-center text-white m-4 p-4 rounded-lg ${
                isPalindromeResult ? "bg-green-400" : "bg-red-400"
              }`}
            >
              <span>
                {isPalindromeResult ? "✓ IS PALINDROME" : "✗ NOT A PALINDROME"}
              </span>
            </div>
          )}
        </div>

        {/* Longest palindrome found */}
        <div className="flex flex-col text-body-small gap-2">
          <span className="font-bold">Longest Palindrome Found So Far</span>
          <span
            className={`w-full p-2 text-center rounded-md bg-surfaceContainer-low ${
              longestPalindrome ? "text-green-400" : "text-onSurface"
            }`}
          >
            "{longestPalindrome || "(Searching...)"}"
          </span>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-2 text-body-small">
          <div className="flex items-center gap-2">
            <span className="font-bold">Checked Substrings: </span>
            <span className="text-blue-400">{checkedSubstrings.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Palindromes Found: </span>
            <span className="text-green-400">
              {checkedSubstrings.filter((s) => s.isPalindrome).length}
            </span>
          </div>
        </div>
      </div>

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
            text={running ? "Running..." : "Find Palindrome"}
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

      {/* Algorithm explanation */}
      <div className="flex flex-col p-4 text-onSecondary bg-secondary rounded-sm">
        <h3 className="text-title-large mb-4">Brute Force Algorithm:</h3>
        <ol className="text-body-large">
          <li>
            <strong>Outer loop:</strong> Try all possible lengths from longest
            (n) to shortest (1)
          </li>
          <li>
            <strong>Inner loop:</strong> For each length, try all possible
            starting positions
          </li>
          <li>
            <strong>Check function:</strong> For each substring, verify if it's
            a palindrome:
            <ul className="text-body-large">
              <li>Initialize left pointer at start, right pointer at end-1</li>
              <li>
                While left &lt; right, compare characters at both pointers
              </li>
              <li>If mismatch found, return false</li>
              <li>Otherwise, move pointers toward center (left++, right--)</li>
              <li>If loop completes, return true</li>
            </ul>
          </li>
          <li>
            <strong>Early return:</strong> Since we check from longest to
            shortest, the first palindrome found is the answer
          </li>
          <li>
            <strong>Return:</strong> Return the longest palindromic substring
            found
          </li>
        </ol>
        <p className="text-body-small mt-4 text-onError">
          <strong>Time Complexity:</strong> O(n³) - O(n²) substrings × O(n)
          palindrome check
          <br />
          <strong>Space Complexity:</strong> O(1) - only constant extra space
          needed
        </p>
      </div>
    </div>
  );
}

export default LongestPalindromeVisualizer;
