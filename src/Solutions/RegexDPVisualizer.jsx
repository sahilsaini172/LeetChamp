import React, { useState, useEffect, useRef, useCallback } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";

function RegexDPVisualizer() {
  const [s, setS] = useState("aab");
  const [p, setP] = useState("c*a*b");
  const [running, setRunning] = useState(false);
  const [dp, setDp] = useState([]);
  const [currentCell, setCurrentCell] = useState({ i: 0, j: 0 });
  const [phase, setPhase] = useState("init"); // init, firstRow, fill
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('Click "Start" to build DP table');
  const [finalResult, setFinalResult] = useState(null);

  const timerRef = useRef(null);

  // Build steps (precomputed) for animation
  const buildSteps = useCallback((sStr, pStr) => {
    const m = sStr.length;
    const n = pStr.length;
    const dpTable = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(false)
    );

    const steps = [];

    // Initial state
    dpTable[0][0] = true;
    steps.push({
      phase: "init",
      i: 0,
      j: 0,
      dp: dpTable.map((row) => [...row]),
      message:
        "Initialize dp[0][0] = true (empty string matches empty pattern)",
    });

    // First row (i = 0), handle patterns like a*, a*b*, etc.
    for (let j = 1; j <= n; j++) {
      if (pStr[j - 1] === "*") {
        dpTable[0][j] = dpTable[0][j - 2];
        steps.push({
          phase: "firstRow",
          i: 0,
          j,
          dp: dpTable.map((row) => [...row]),
          message: `First row: pattern "${pStr.slice(
            0,
            j
          )}" with '*' can match empty string → dp[0][${j}] = dp[0][${j - 2}]`,
        });
      } else {
        steps.push({
          phase: "firstRow",
          i: 0,
          j,
          dp: dpTable.map((row) => [...row]),
          message: `First row: pattern "${pStr.slice(
            0,
            j
          )}" cannot match empty string unless shaped like x*`,
        });
      }
    }

    // Fill rest of table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const sChar = sStr[i - 1];
        const pChar = pStr[j - 1];

        if (pChar === "." || pChar === sChar) {
          dpTable[i][j] = dpTable[i - 1][j - 1];
          steps.push({
            phase: "fill",
            i,
            j,
            dp: dpTable.map((row) => [...row]),
            message: `Direct/ '.' match at s[${i - 1}]='${sChar}' and p[${
              j - 1
            }]='${pChar}': dp[${i}][${j}] = dp[${i - 1}][${j - 1}]`,
          });
        } else if (pChar === "*") {
          // Zero occurrence
          let val = dpTable[i][j - 2];
          let msg = `'*' at p[${j - 1}] with prev '${
            pStr[j - 2]
          }': zero occurrence → dp[${i}][${j}] = dp[${i}][${j - 2}]`;

          // One or more occurrence
          if (pStr[j - 2] === "." || pStr[j - 2] === sChar) {
            val = val || dpTable[i - 1][j];
            msg += `; char '${sChar}' matches '${
              pStr[j - 2]
            }' → dp[${i}][${j}] = dp[${i}][${j}] OR dp[${i - 1}][${j}]`;
          }

          dpTable[i][j] = val;
          steps.push({
            phase: "fill",
            i,
            j,
            dp: dpTable.map((row) => [...row]),
            message: msg,
          });
        } else {
          // No match
          dpTable[i][j] = false;
          steps.push({
            phase: "fill",
            i,
            j,
            dp: dpTable.map((row) => [...row]),
            message: `No match at s[${i - 1}]='${sChar}' and p[${
              j - 1
            }]='${pChar}': dp[${i}][${j}] = false`,
          });
        }
      }
    }

    // Final result
    steps.push({
      phase: "done",
      i: m,
      j: n,
      dp: dpTable.map((row) => [...row]),
      message: `Final answer: dp[${m}][${n}] = ${dpTable[m][n]} → "${sStr}" ${
        dpTable[m][n] ? "matches" : "does NOT match"
      } "${pStr}"`,
    });

    return steps;
  }, []);

  const start = useCallback(() => {
    if (!s && !p) {
      setStatus("Please provide string and pattern");
      return;
    }
    setRunning(true);
    const steps = buildSteps(s, p);
    let idx = 0;

    const run = () => {
      const stepData = steps[idx];
      setDp(stepData.dp);
      setCurrentCell({ i: stepData.i, j: stepData.j });
      setPhase(stepData.phase);
      setStep(idx);
      setStatus(stepData.message);
      if (stepData.phase === "done") {
        setFinalResult(stepData.dp[s.length][p.length]);
      }

      idx++;
      if (idx < steps.length) {
        timerRef.current = setTimeout(run, 900);
      } else {
        setRunning(false);
      }
    };

    run();
  }, [s, p, buildSteps]);

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
  };

  const reset = () => {
    stop();
    setDp([]);
    setCurrentCell({ i: 0, j: 0 });
    setPhase("init");
    setStep(0);
    setStatus('Click "Start" to build DP table');
    setFinalResult(null);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const m = s.length;
  const n = p.length;

  const cellColor = (i, j, val) => {
    if (i === currentCell.i && j === currentCell.j)
      return val ? "bg-green-400 font-bold text-white" : "bg-orange-400 text-white";
    if (val) return "bg-green-400/25 text-green-500 font-bold";
    return "bg-surfaceContainer";
  };

  return (
    <div className="flex flex-col gap-2 w-full text-onSurface **:ease-in **:duration-150 ease-in duration-150">
       

      {/* Controls */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col items-center gap-2 w-full">
          <FilledTextField
            type="text"
            value={s}
            onChange={(e) => setS(e.target.value)}
            label={s}
            disabled={running}
            className="w-full"
            placeholder="s (string)"
            supportingText={false}
          />
          <FilledTextField
            type="text"
            value={p}
            onChange={(e) => setP(e.target.value)}
            label={p}
            disabled={running}
            className="w-full"
            placeholder="p (pattern)"
            supportingText={false}
          />
        </div>
        <div className="flex items-center gap-2">
          <StandardButtonS
            text={running ? "Running..." : "Start"}
            onClick={start}
            disabled={running}
            className="grow"
          />
          <TonalButton
            text="Stop"
            disabled={!running}
            onClick={stop}
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

      {/* Status */}
      <div className="p-2 bg-surfaceContainer text-label-large rounded-md">
        Step {step}: {status}
      </div>

      {/* DP table + labels */}
      <div
        className={`gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col relative overflow-hidden`}
      >
        <table className="my-0 mx-auto border-separate">
          <tbody>
            {/* top header row: pattern chars */}
            <tr>
              <td />
              <td />
              {Array.from({ length: n + 1 }).map((_, j) => (
                <td
                  key={`ph-${j}`}
                  className="text-label-large text-center p-1 text-onSurfaceVarient"
                >
                  {j === 0 ? "ε" : p[j - 1]}
                </td>
              ))}
            </tr>

            {Array.from({ length: m + 1 }).map((_, i) => (
              <tr key={`row-${i}`}>
                {/* left header: s char */}
                <td className="text-label-large text-center p-1 text-onSurfaceVarient">
                  {i === 0 ? "ε" : s[i - 1]}
                </td>
                <td className="text-label-small p-1 text-onSurface">i={i}</td>
                {Array.from({ length: n + 1 }).map((_, j) => {
                  const val = dp[i]?.[j] ?? false;
                  return (
                    <td
                      key={`cell-${i}-${j}`}
                      className={`w-10 h-10 text-center rounded-sm border-0 ${cellColor(
                        i,
                        j,
                        val
                      )}`}
                    >
                      {val ? "T" : "F"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Explanation */}
      <div className="flex flex-col p-4 text-onSecondary bg-secondary rounded-sm">
        <h3 className="text-title-large mb-4">DP Rules</h3>
        <ul className="text-body-large">
          <li>
            <strong>State:</strong> dp[i][j] = whether s[0..i-1] matches
            p[0..j-1][web:134][web:137].
          </li>
          <li>
            <strong>Base:</strong> dp[0][0] = true (empty string vs empty
            pattern)[web:131][web:134].
          </li>
          <li>
            <strong>First row:</strong> dp[0][j] is true only for patterns like
            "a*", "a*b*", using dp[0][j] = dp[0][j-2] when p[j-1] is '*'
            [web:131][web:137].
          </li>
          <li>
            <strong>Direct or '.' match:</strong> if p[j-1] == s[i-1] or p[j-1]
            == '.', then dp[i][j] = dp[i-1][j-1][web:134][web:137].
          </li>
          <li>
            <strong>'*' wildcard:</strong>
            <ul>
              <li>
                Zero occurrence: dp[i][j] |= dp[i][j-2] (drop "x*")[web:137].
              </li>
              <li>
                One or more: if p[j-2] matches s[i-1], then dp[i][j] |=
                dp[i-1][j] (consume one char from s, keep
                pattern)[web:137][web:134].
              </li>
            </ul>
          </li>
          <li>
            <strong>Answer:</strong> dp[m][n] tells whether full string and
            pattern match[web:131][web:134].
          </li>
        </ul>
      </div>
    </div>
  );
}

export default RegexDPVisualizer;
