import React, { useCallback, useEffect, useRef, useState } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";

export default function ValidParenthesesVisualizer() {
  const [input, setInput] = useState("()[]{}");
  const [running, setRunning] = useState(false);

  // Visual state
  const [chars, setChars] = useState([]);
  const [idx, setIdx] = useState(-1);
  const [stack, setStack] = useState([]);
  const [action, setAction] = useState("idle"); // push | pop | mismatch | ignore | done
  const [status, setStatus] = useState('Click "Start"');
  const [final, setFinal] = useState(null); // true/false/null

  const timerRef = useRef(null);

  const mapping = {
    ")": "(",
    "}": "{",
    "]": "[",
  };
  const openSet = new Set(Object.values(mapping));

  function* steps(s) {
    let stepNo = 0;
    const st = [];

    const arr = [...s];
    yield {
      stepNo: stepNo++,
      chars: arr,
      idx: -1,
      stack: [...st],
      action: "init",
      status: `Initialize stack = []`,
      done: false,
      final: null,
    };

    for (let i = 0; i < arr.length; i++) {
      const c = arr[i];

      yield {
        stepNo: stepNo++,
        chars: arr,
        idx: i,
        stack: [...st],
        action: "read",
        status: `Read s[${i}] = "${c}"`,
        done: false,
        final: null,
      };

      if (openSet.has(c)) {
        st.push(c);
        yield {
          stepNo: stepNo++,
          chars: arr,
          idx: i,
          stack: [...st],
          action: "push",
          status: `Opening bracket → push "${c}"`,
          done: false,
          final: null,
        };
      } else if (Object.prototype.hasOwnProperty.call(mapping, c)) {
        if (st.length === 0) {
          yield {
            stepNo: stepNo++,
            chars: arr,
            idx: i,
            stack: [...st],
            action: "mismatch",
            status: `Closing "${c}" but stack is empty → invalid`,
            done: true,
            final: false,
          };
          return;
        }

        const top = st[st.length - 1];
        const expected = mapping[c];

        yield {
          stepNo: stepNo++,
          chars: arr,
          idx: i,
          stack: [...st],
          action: "compare",
          status: `Closing "${c}" expects "${expected}", stack top is "${top}"`,
          done: false,
          final: null,
        };

        const popped = st.pop();
        yield {
          stepNo: stepNo++,
          chars: arr,
          idx: i,
          stack: [...st],
          action: "pop",
          status: `Pop "${popped}"`,
          done: false,
          final: null,
        };

        if (popped !== expected) {
          yield {
            stepNo: stepNo++,
            chars: arr,
            idx: i,
            stack: [...st],
            action: "mismatch",
            status: `Mismatch → invalid`,
            done: true,
            final: false,
          };
          return;
        }

        yield {
          stepNo: stepNo++,
          chars: arr,
          idx: i,
          stack: [...st],
          action: "matched",
          status: `Match ✓ continue`,
          done: false,
          final: null,
        };
      } else {
        // Optional: ignore non-bracket characters
        yield {
          stepNo: stepNo++,
          chars: arr,
          idx: i,
          stack: [...st],
          action: "ignore",
          status: `Non-bracket "${c}" → ignore`,
          done: false,
          final: null,
        };
      }
    }

    const ok = st.length === 0;
    yield {
      stepNo: stepNo++,
      chars: arr,
      idx: arr.length - 1,
      stack: [...st],
      action: "done",
      status: ok ? `Stack empty → valid ✓` : `Stack not empty → invalid`,
      done: true,
      final: ok,
    };
  }

  const start = useCallback(() => {
    const s = input ?? "";
    setRunning(true);
    setFinal(null);
    setStatus("Starting...");
    setIdx(-1);
    setStack([]);
    setChars([...s]);
    setAction("init");

    const gen = steps(s);

    const tick = () => {
      const { value } = gen.next();
      if (!value) {
        setRunning(false);
        return;
      }

      setChars(value.chars);
      setIdx(value.idx);
      setStack(value.stack);
      setAction(value.action);
      setStatus(`Step ${value.stepNo}: ${value.status}`);

      if (value.done) {
        setFinal(value.final);
        setTimeout(() => setRunning(false), 600);
        return;
      }

      timerRef.current = setTimeout(tick, 700);
    };

    tick();
  }, [input]);

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
  };

  const reset = () => {
    stop();
    setChars([]);
    setIdx(-1);
    setStack([]);
    setAction("idle");
    setStatus('Click "Start"');
    setFinal(null);
  };

  useEffect(() => {
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, []);

  const cellClass = (i) => {
    const base =
      "size-10 flex items-center justify-center grow rounded-sm text-label-medium";
    if (i === idx) return `${base} bg-green-500 text-white`;
    return `${base} bg-inverseSurface  text-inverseOnSurface`;
  };

  const stackCellClass = (isTop) => {
    const base =
      "size-10 flex items-center justify-center grow rounded-sm text-label-medium";
    return isTop
      ? `${base} bg-blue-500 text-white`
      : `${base} bg-inverseSurface  text-inverseOnSurface`;
  };

  return (
    <div className="flex flex-col gap-2 text-onSurface **:ease-in **:duration-150 ease-in duration-150">
      {/* Controls */}
      <div className="flex  flex-col gap-2 flex-wrap">
        <FilledTextField
          type="text"
          placeholder={`e.g. "()[]{}"`}
          label={true}
          value={input}
          disabled={running}
          onChange={(e) => setInput(e.target.value)}
          supportingText={false}
        />
        <div className="flex items-center gap-2">
          <StandardButtonS
            text={running ? "Running..." : "Start"}
            onClick={start}
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

      {/* Status */}
      <div className={`p-2 bg-surfaceContainer text-label-large rounded-md `}>
        {status}
      </div>

      <div
        className={`gap-2 p-2 rounded-lg bg-surfaceContainer-highest flex flex-col relative `}
      >
        {/* Input string */}
        <div className="bg-surfaceContainer-high p-2 rounded-md">
          <p className="text-center text-label-medium mb-2">Input</p>
          <div className="flex flex-wrap gap-2">
            {chars.map((c, i) => (
              <span key={i} className={cellClass(i)}>
                {c}
              </span>
            ))}
            {chars.length === 0 && (
              <span className="text-onSurface italic">(empty)</span>
            )}
          </div>
          <div className="mt-3 text-label-small">
            Current index: <span className="font-bold">{idx}</span>
          </div>
        </div>

        {/* Stack */}
        <div className="bg-surfaceContainer-high p-2 rounded-md">
          <p className="text-center text-label-medium mb-2">
            Stack (top at bottom)
          </p>
          <div className="flex flex-wrap gap-2">
            {stack.length === 0 ? (
              <span className="text-onSurface italic">(empty)</span>
            ) : (
              stack.map((v, i) => {
                const isTop = i === stack.length - 1;
                return (
                  <div key={i} className={stackCellClass(isTop)}>
                    {v}
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-3 text-label-small">
            Action: <span className="font-bold">{action}</span>
          </div>
        </div>

        {/* Mapping */}
        <div className="bg-surfaceContainer-high p-2 rounded-md">
          <p className="text-center text-label-large mb-2">Mapping</p>
          <div className="grid grid-cols-3 gap-2 text-label-medium bg-surfaceContainer p-2 rounded-md">
            {Object.entries(mapping).map(([close, open]) => (
              <div key={close} className="rounded-sm ">
                <div className="font-bold">{close}</div>
                <div className="text-onSurfaceVarient">expects {open}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-label-small">
            Tip: push openings; on closing, pop and compare.
          </div>
        </div>
      </div>
      {/* Algorithm Explanation */}
      <div className="flex flex-col p-4 text-onSecondary bg-secondary rounded-sm">
        <h3 className="text-title-large mb-4">
          Algorithm: Stack Data Structure
        </h3>
        <ol className="text-body-large">
          <li>
            <strong>Initialize:</strong> Create an empty <code>stack</code> to
            keep track of opening brackets and a <code>mapping</code> object for
            closing-to-opening pairs.{" "}
          </li>
          <li>
            <strong>Iterate:</strong> Loop through every character{" "}
            <code>c</code> in the input string.{" "}
          </li>
          <li>
            <strong>Open Brackets:</strong> If <code>c</code> is an opening
            bracket (part of the map's values), push it onto the stack. This
            signifies we are waiting for a corresponding closer.{" "}
          </li>
          <li>
            <strong>Close Brackets:</strong> If <code>c</code> is a closing
            bracket:
            <ul className="list-disc list-inside ml-6 mt-1 text-slate-600">
              <li>
                Check if the stack is empty. If yes, return <code>false</code>{" "}
                (no matching opener).
              </li>
              <li>Pop the top element from the stack.</li>
              <li>
                Compare the popped element with the expected opener (
                <code>mapping[c]</code>). If they don't match, return{" "}
                <code>false</code>.
              </li>
            </ul>
          </li>
          <li>
            <strong>Final Check:</strong> After the loop, return{" "}
            <code>true</code> only if the stack is completely empty. If elements
            remain, it means there are unclosed brackets.{" "}
          </li>
        </ol>

        <p className="text-body-small mt-4 text-onError">
          <p>
            <strong>Time Complexity:</strong> O(n) — We traverse the string
            once, and push/pop operations are O(1).
          </p>
          <p>
            <strong>Space Complexity:</strong> O(n) — In the worst case (e.g.,
            "((((("), the stack grows to the size of the input string.
          </p>
        </p>
      </div>
    </div>
  );
}
