import { ArrowUp, ChevronDown, ChevronUp } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";

function MaxAreaVisualizer() {
  const [input, setInput] = useState("1,8,6,2,5,4,8,3,7");
  const [heights, setHeights] = useState([1, 8, 6, 2, 5, 4, 8, 3, 7]);

  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(heights.length - 1);
  const [currArea, setCurrArea] = useState(0);
  const [bestArea, setBestArea] = useState(0);
  const [bestPair, setBestPair] = useState({ l: 0, r: heights.length - 1 });
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('Click "Start" to run two pointers');

  const timerRef = useRef(null);

  const W = 1100;
  const H = 700;
  const margin = { top: 60, right: 40, bottom: 120, left: 60 };

  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;

  const parseHeights = (text) => {
    try {
      const arr = text
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x.length > 0)
        .map((x) => Number(x));

      if (arr.some((v) => Number.isNaN(v) || v < 0)) return null;
      if (arr.length < 2) return null;
      return arr;
    } catch {
      return null;
    }
  };

  const maxH = useMemo(() => Math.max(1, ...heights), [heights]);
  const barGap = 8;
  const barW = Math.max(
    12,
    (innerW - barGap - 64 * heights.length) / heights.length
  );

  const xOf = (i) => margin.left + i * (barW + barGap);
  const yOfTop = (val) => margin.top + (innerH - (val / maxH) * innerH);

  function* stepsGenerator(arr) {
    let l = 0;
    let r = arr.length - 1;
    let best = 0;
    let bestPair = { l, r };
    let stepNo = 0;

    yield {
      l,
      r,
      currArea: 0,
      bestArea: 0,
      bestPair,
      step: stepNo++,
      msg: "Initialize left=0, right=n-1, bestArea=0",
      done: false,
    };

    while (l < r) {
      const width = r - l;
      const h = Math.min(arr[l], arr[r]);
      const area = width * h;

      if (area > best) {
        best = area;
        bestPair = { l, r };
      }

      yield {
        l,
        r,
        currArea: area,
        bestArea: best,
        bestPair,
        step: stepNo++,
        msg: `Compute area = (right-left) * min(h[left], h[right]) = ${width} * ${h} = ${area}. bestArea=${best}`,
        done: false,
      };

      if (arr[l] < arr[r]) {
        yield {
          l,
          r,
          currArea: area,
          bestArea: best,
          bestPair,
          step: stepNo++,
          msg: `height[left]=${arr[l]} < height[right]=${arr[r]} → move left++`,
          done: false,
        };
        l++;
      } else {
        yield {
          l,
          r,
          currArea: area,
          bestArea: best,
          bestPair,
          step: stepNo++,
          msg: `height[left]=${arr[l]} ≥ height[right]=${arr[r]} → move right--`,
          done: false,
        };
        r--;
      }
    }

    yield {
      l,
      r,
      currArea: 0,
      bestArea: best,
      bestPair,
      step: stepNo++,
      msg: `Done. left met right. Answer = bestArea = ${best}`,
      done: true,
    };
  }

  const applyInput = () => {
    const arr = parseHeights(input);
    if (!arr) {
      setStatus("❌ Enter at least 2 non-negative integers, comma-separated.");
      return;
    }
    setHeights(arr);
    setLeft(0);
    setRight(arr.length - 1);
    setCurrArea(0);
    setBestArea(0);
    setBestPair({ l: 0, r: arr.length - 1 });
    setStep(0);
    setStatus('Ready. Click "Start".');
  };

  const start = useCallback(() => {
    setRunning(true);

    const gen = stepsGenerator(heights);

    const tick = () => {
      const { value, done } = gen.next();
      if (!value) {
        setRunning(false);
        return;
      }

      setLeft(value.l);
      setRight(value.r);
      setCurrArea(value.currArea);
      setBestArea(value.bestArea);
      setBestPair(value.bestPair);
      setStep(value.step);
      setStatus(value.msg);

      if (value.done || done) {
        setRunning(false);
        return;
      }
      timerRef.current = setTimeout(tick, 800);
    };

    tick();
  }, [heights]);

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
  };

  const reset = () => {
    stop();
    setLeft(0);
    setRight(heights.length - 1);
    setCurrArea(0);
    setBestArea(0);
    setBestPair({ l: 0, r: heights.length - 1 });
    setStep(0);
    setStatus('Click "Start" to run two pointers');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const waterHeight = Math.min(heights[left] ?? 0, heights[right] ?? 0);
  const waterY = yOfTop(waterHeight);
  const waterX = xOf(left) + barW;
  const waterW = xOf(right) - (xOf(left) + barW);

  return (
    <div className="flex flex-col gap-2 text-onSurface **:ease-in **:duration-150 ease-in duration-150">


      {/*Status*/}
      <div
        className={`p-2 bg-surfaceContainer line-clamp-3 text-label-large rounded-md flex-1`}
      >
        Step {step}: {status} : left={left}, right={right}, currArea={currArea},
        bestArea={bestArea},bestPair=({bestPair.l},{bestPair.r})
      </div>

      {/* SVG Visualization */}
      <div
        className={`gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col relative h-[780px] justify-between overflow-x-scroll`}
      >
        {/* Title */}
        <p className="text-center text-label-medium">
          Heights + Current Container + Best Container
        </p>

        {/* axis line
        <line
          className="h-2 bg-red-300"
          x1={margin.left - 10}
          y1={margin.top + innerH}
          x2={W - margin.right + 10}
          y2={margin.top + innerH}
          stroke="#bdc3c7"
          strokeWidth="2"
        />
        <div
          className={`bg-white ${"h-[" + margin.top + innerH - waterY + "px]"}`}
          style={{ translate: `${waterX}px ${waterY}px` }}
        ></div> */}

        {/* water (current container) */}
        {left < right && waterW > 0 && (
          <div
            className="absolute rounded-md border-2 border-blue-400 bg-blue-400/25"
            style={{
              left: waterX + 24 - 68,
              top: waterY + 16,
              width: waterW,
              height: margin.top + innerH - waterY,
            }}
          />
        )}

        {/* bars */}
        {heights.map((h, i) => {
          const x = xOf(i) - 68;
          const y = yOfTop(h);
          const hh = margin.top + innerH - y;

          const isL = i === left;
          const isR = i === right;
          const isBestL = i === bestPair.l;
          const isBestR = i === bestPair.r;

          let fill = "bg-inverseSurface/50";
          let stroke = "inverseSurface";
          let sw = 2;

          if (isBestL || isBestR) {
            fill = "bg-green-400";
            stroke = "#27ae60";
            sw = 3;
          }
          if (isL || isR) {
            fill = "bg-orange-400";
            stroke = "#e74c3c";
            sw = 4;
          }

          return (
            <div key={i} className="mx-2 absolute">
              <div
                className={`${fill} border text-inverseOnSurface rounded-lg absolute flex justify-center items-center w-24`}
                style={{ width: barW, height: hh, translate: `${x}px ${y}px` }}
              >
                <span
                  className={`-top-6 text-onSurface text-label-large absolute`}
                >
                  {h}
                </span>
                <span
                  className={`-bottom-6 text-onSurface text-label-large absolute`}
                >
                  {i}
                </span>
                {isR && (
                  <span className="flex flex-col -top-16 absolute items-center text-orange-400">
                    <span>R</span>
                    <ChevronDown size={16} />
                  </span>
                )}
                {isL && (
                  <span className="flex absolute flex-col -bottom-16 items-center text-orange-400">
                    <ChevronUp size={16} />
                    <span>L</span>
                  </span>
                )}

                {(isBestL || isBestR) && (
                  <span className="flex flex-col text-sm items-center text-white font-bold tracking-widest">
                    <span>BEST</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* current formula */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col rounded-md text-center">
          <span className="text-title-small mb-4">
            currentArea = (right-left) * min(height[left], height[right]) = (
            {right}-{left}) * min({heights[left] ?? 0}, {heights[right] ?? 0})
          </span>
          <span className="font-bold text-blue-400">= {currArea}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 w-full flex-wrap">
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-orange-400 rounded-full"></div>
          <span>Current left/right pointers</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-green-400 rounded-full"></div>
          <span>Best pair so far</span>
        </div>
        <div className="flex items-center px-2 py-1 grow flex-wrap justify-center rounded-sm bg-surfaceContainer-highest gap-1 text-label-small">
          <div className="size-4 bg-blue-400 rounded-full"></div>
          <span>Current container water</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap">
        <FilledTextField
          type="text"
          placeholder="Enter Array"
          label={true}
          value={input}
          disabled={running}
          onChange={(e) => setInput(e.target.value)}
          supportingText={false}
        />
        <StandardButtonS text="Apply" onClick={applyInput} disabled={running} />
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

      {/*Algoritm Explanation */}
      <div className="flex flex-col p-4 text-onSecondary bg-secondary rounded-sm">
        <h3 className="text-title-large mb-4">
          Container With Most Water (Two Pointers)
        </h3>

        <ol className="text-body-large">
          <li>
            <strong>Initialize:</strong> left = 0, right = n - 1, maxArea = 0.
            [web:146]
          </li>
          <li>
            <strong>Compute area:</strong> area = (right - left) ×
            min(height[left], height[right]). [web:146]
          </li>
          <li>
            <strong>Update best:</strong> maxArea = max(maxArea, area).
            [web:146]
          </li>
          <li>
            <strong>Move pointer:</strong>
            If height[left] &lt; height[right], do left++; else do right--.
            [web:143][web:146]
          </li>
          <li>
            <strong>Repeat</strong> until left &gt;= right, then return maxArea.
            [web:146]
          </li>
        </ol>

        <p className="text-body-small mt-4 text-onError">
          <strong>Why move the shorter side?</strong> The container height is
          limited by the shorter line; moving the taller side reduces width but
          cannot increase the limiting height, so it can’t produce a better area
          for that shorter line. [web:143][web:146]
        </p>

        <p className="text-body-small mt-4 text-onError">
          <strong>Time Complexity:</strong> O(n).{" "}
          <strong>Space Complexity:</strong> O(1). [web:146]
        </p>
      </div>
    </div>
  );
}

export default MaxAreaVisualizer;
