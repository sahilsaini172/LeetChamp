import React, { useState, useCallback, useRef, useEffect } from "react";
import FilledTextField from "../components/textFields/FilledTextField";
import StandardButtonS from "../components/buttons/StandardButton";
import TonalButton from "../components/buttons/TonalButton";

function ZigzagConversionVisualizer() {
  const [inputString, setInputString] = useState("PAYPALISHIRING");
  const [numRows, setNumRows] = useState(3);
  const [running, setRunning] = useState(false);
  const [currentCharIndex, setCurrentCharIndex] = useState(-1);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [rows, setRows] = useState([]);
  const [result, setResult] = useState("");
  const [stepNumber, setStepNumber] = useState(0);
  const [status, setStatus] = useState('Click "Start" to convert string');
  const [finalResult, setFinalResult] = useState(null);
  const [zigzagGrid, setZigzagGrid] = useState([]);

  const animationRef = useRef(null);

  const width = 1100;
  const height = 900;

  // Zigzag conversion algorithm generator
  function* zigzagGenerator(s, numRows) {
    let step = 0;

    // Handle edge cases
    if (numRows === 1 || numRows >= s.length) {
      yield {
        charIndex: -1,
        rowIndex: 0,
        direction: 1,
        rows: [s.split("")],
        result: s,
        step: step++,
        status: `Edge case: numRows=${numRows}, returning original string "${s}"`,
        zigzagGrid: [[...s]],
        done: true,
      };
      return s;
    }

    let idx = 0;
    let d = 1;
    const rowsArray = new Array(numRows).fill().map(() => []);
    const grid = [];

    yield {
      charIndex: -1,
      rowIndex: 0,
      direction: d,
      rows: rowsArray.map((r) => [...r]),
      result: "",
      step: step++,
      status: `Initializing ${numRows} rows, direction=1 (going down)`,
      zigzagGrid: [],
      done: false,
    };

    let colIndex = 0;
    for (let i = 0; i < s.length; i++) {
      const char = s[i];

      yield {
        charIndex: i,
        rowIndex: idx,
        direction: d,
        rows: rowsArray.map((r) => [...r]),
        result: "",
        step: step++,
        status: `Processing '${char}' at position ${i}`,
        zigzagGrid: [...grid],
        done: false,
      };

      // Add character to current row
      rowsArray[idx].push(char);

      // Add to grid for visualization
      grid.push({ char, row: idx, col: colIndex, charIndex: i });

      yield {
        charIndex: i,
        rowIndex: idx,
        direction: d,
        rows: rowsArray.map((r) => [...r]),
        result: "",
        step: step++,
        status: `Added '${char}' to row ${idx}`,
        zigzagGrid: [...grid],
        done: false,
      };

      // Change direction at boundaries
      if (idx === 0) {
        d = 1;
        yield {
          charIndex: i,
          rowIndex: idx,
          direction: d,
          rows: rowsArray.map((r) => [...r]),
          result: "",
          step: step++,
          status: `At top boundary (row 0), changing direction to DOWN (d=1)`,
          zigzagGrid: [...grid],
          done: false,
        };
      } else if (idx === numRows - 1) {
        d = -1;
        yield {
          charIndex: i,
          rowIndex: idx,
          direction: d,
          rows: rowsArray.map((r) => [...r]),
          result: "",
          step: step++,
          status: `At bottom boundary (row ${
            numRows - 1
          }), changing direction to UP (d=-1)`,
          zigzagGrid: [...grid],
          done: false,
        };
      }

      // Move to next row
      idx += d;

      // Update column for diagonal movement
      if (d === -1 && idx >= 0) {
        colIndex++;
      } else if (d === 1 && idx < numRows) {
        colIndex = colIndex; // stay in same column when going down
      }
    }

    yield {
      charIndex: -1,
      rowIndex: idx - d,
      direction: d,
      rows: rowsArray.map((r) => [...r]),
      result: "",
      step: step++,
      status: "All characters placed. Now joining rows...",
      zigzagGrid: [...grid],
      done: false,
    };

    // Join rows
    const resultRows = [];
    for (let i = 0; i < numRows; i++) {
      resultRows.push(rowsArray[i].join(""));

      yield {
        charIndex: -1,
        rowIndex: i,
        direction: d,
        rows: rowsArray.map((r) => [...r]),
        result: resultRows.join(""),
        step: step++,
        status: `Joining row ${i}: "${rowsArray[i].join("")}"`,
        zigzagGrid: [...grid],
        done: false,
      };
    }

    const finalResult = resultRows.join("");

    yield {
      charIndex: -1,
      rowIndex: -1,
      direction: d,
      rows: rowsArray.map((r) => [...r]),
      result: finalResult,
      step: step++,
      status: `✓ Conversion complete! Result: "${finalResult}"`,
      zigzagGrid: [...grid],
      done: true,
    };

    return finalResult;
  }

  // Run visualization
  const runVisualization = useCallback(() => {
    if (!inputString || inputString.length === 0) {
      setStatus("❌ Please enter a valid string");
      return;
    }

    if (numRows < 1) {
      setStatus("❌ Number of rows must be at least 1");
      return;
    }

    setRunning(true);
    setFinalResult(null);
    setStepNumber(0);

    const generator = zigzagGenerator(inputString, numRows);

    const animate = () => {
      const { value, done } = generator.next();

      if (value) {
        setCurrentCharIndex(value.charIndex);
        setCurrentRowIndex(value.rowIndex);
        setDirection(value.direction);
        setRows(value.rows);
        setResult(value.result);
        setStepNumber(value.step);
        setStatus(value.status);
        setZigzagGrid(value.zigzagGrid);

        if (value.done) {
          setFinalResult(value.result);
          setTimeout(() => {
            setRunning(false);
          }, 2000);
        } else {
          animationRef.current = setTimeout(animate, 700);
        }
      } else {
        setRunning(false);
      }
    };

    animate();
  }, [inputString, numRows]);

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
    setCurrentCharIndex(-1);
    setCurrentRowIndex(0);
    setDirection(1);
    setRows([]);
    setResult("");
    setZigzagGrid([]);
    setStatus('Click "Start" to convert string');
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
      <h2 className="text-headline-medium">Zigzag Conversion Visualizer</h2>

      {/* Controls */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2 w-full">
          <FilledTextField
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            label={"String:"}
            disabled={running}
            className="w-full"
            placeholder="Enter String"
            supportingText={false}
          />
          <FilledTextField
            type="number"
            min={1}
            max={10}
            onChange={(e) =>
              setNumRows(Math.max(1, parseInt(e.target.value) || 1))
            }
            label={"Rows:"}
            disabled={running}
            className="w-full"
            placeholder="Enter Rows"
            supportingText={false}
          />
        </div>
        <div className="flex items-center gap-2">
          <StandardButtonS
            text={running ? "Converting..." : "Start Conversion"}
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

      {/* Status */}
      <div className="p-2 bg-surfaceContainer text-label-large rounded-md">
        Step {stepNumber}: {status}
      </div>

      {/* SVG Visualization */}
      <div
        className={`gap-2 p-4 rounded-lg bg-surfaceContainer-highest flex flex-col`}
      >
        {/* Title */}
        <p className="text-center text-label-medium">
          Zigzag Pattern Formation
        </p>

        {/* Zigzag Grid Visualization */}
        <div className="h-[300px] bg-surfaceContainer-highest flex flex-col overflow-scroll relative">
          <p className="text-title-medium">Visual Zigzag Pattern:</p>
          {/* Current character indicator */}
          {currentCharIndex >= 0 && currentCharIndex < inputString.length && (
            <div className="absolute bottom-0 right-0 text-label-medium">
              Processing:{" "}
              <span className="text-orange-400 font-bold">
                '{inputString[currentCharIndex]}' (index {currentCharIndex})
              </span>
            </div>
          )}

          {/* Calculate dimensions based on grid */}
          {(() => {
            const maxCol = Math.max(...zigzagGrid.map((item) => item.col));
            const maxRow = Math.max(...zigzagGrid.map((item) => item.row));
            const svgWidth = (maxCol + 1) * 50 + 32; // +32 for box size
            const svgHeight = (maxRow + 1) * 60 + 48; // +48 for box size

            {
              /* SVG for connecting lines */
            }
            return (
              <svg
                className="absolute top-0 left-0 pointer-events-none"
                width={svgWidth}
                height={svgHeight}
              >
                {zigzagGrid.map((item, index) => {
                  if (index === 0) return null;

                  const x1 = zigzagGrid[index - 1].col * 50 + 16;
                  const y1 = zigzagGrid[index - 1].row * 60 + 50;
                  const x2 = item.col * 50 + 16;
                  const y2 = item.row * 60 + 40;

                  return (
                    <line
                      key={`line-${index}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      className="stroke-onSurface stroke-2"
                      strokeDasharray="4,2"
                    />
                  );
                })}
              </svg>
            );
          })()}

          {/* Draw grid */}
          {zigzagGrid.map((item, index) => {
            const x = item.col * 50;
            const y = item.row * 60 + 8;
            const isCurrent = item.charIndex === currentCharIndex;

            return (
              <div key={index} className="relative flex">
                <div
                  className={`absolute flex ${
                    isCurrent ? "bg-orange-400" : "bg-blue-400"
                  } rounded-lg items-center justify-center size-8  text-white`}
                  style={{ translate: `${x}px ${y}px` }}
                >
                  <span className={isCurrent ? "text-white" : "text-white"}>
                    {item.char}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 h-max grow">
          {/* Direction indicator */}
          <div className="p-2 bg-surfaceContainer-high h-full flex w-1/2 flex-col rounded-md text-center gap-2">
            <span className="text-title-small">Direction</span>

            <span
              className={direction === 1 ? "text-red-400" : "text-green-400"}
            >
              {direction === 1 ? "↓ DOWN" : "↑ UP"}
            </span>
            <span className="text-onSurface text-label-small">
              d = {direction}
            </span>
          </div>

          {/* Current row indicator */}
          <div className="p-2 bg-surfaceContainer-high flex h-full w-1/2 flex-col rounded-md text-center gap-2">
            <span className="text-title-small">Current Row</span>
            <span className="text-indigo-400 font-bold">
              {currentRowIndex >= 0 ? currentRowIndex : "-"}
            </span>
          </div>
        </div>

        {/* Row arrays */}
        <div className="p-2 bg-surfaceContainer-high h-[190px] flex flex-col rounded-md gap-2 overflow-y-scroll">
          <span className="text-title-medium">
            Row Arrays (Read Left to Right):
          </span>

          {rows.map((row, rowIdx) => {
            const isCurrentRow = rowIdx === currentRowIndex;
            return (
              <div key={rowIdx} className="flex items-center text-title-medium">
                <div
                  className={`flex items-center gap-2 w-full  ${
                    isCurrentRow ? "text-red-400" : ""
                  }`}
                >
                  Row {rowIdx}:
                  <div
                    className={`p-2  ${
                      isCurrentRow
                        ? "bg-red-500/25 text-red-400"
                        : "text-onSurface"
                    } h-10 flex-1 rounded-sm`}
                  >
                    {row.map((char, charIdx) => (
                      <span key={charIdx}>{char}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final result */}
        <div className="p-2 bg-surfaceContainer-high flex flex-col items-center rounded-md gap-2">
          <span className="text-title-medium">Final Result (Rows Joined)</span>

          <span className={result ? "text-green-400" : ""}>
            {result ? `"${result}"` : "(processing...)"}
          </span>
        </div>
      </div>

      {/* Algorithm explanation */}
      <div className="flex flex-col p-4 text-onSecondary bg-secondary rounded-sm">
        <h3 className="text-title-large mb-4">Zigzag Conversion Algorithm:</h3>
        <ol className="text-body-large">
          <li>
            <strong>Edge cases:</strong> If numRows=1 or numRows≥string length,
            return original string
          </li>
          <li>
            <strong>Initialize:</strong> Create numRows empty arrays, set idx=0
            (current row), d=1 (direction)
          </li>
          <li>
            <strong>Iterate through string:</strong> For each character:
            <ul style={{ marginLeft: "20px", marginTop: "5px" }}>
              <li>Add character to row[idx]</li>
              <li>If at row 0 (top), set direction d=1 (go down)</li>
              <li>If at row numRows-1 (bottom), set direction d=-1 (go up)</li>
              <li>Move to next row: idx += d</li>
            </ul>
          </li>
          <li>
            <strong>Join rows:</strong> Concatenate all row strings in order
            (row 0 + row 1 + ... + row n-1)
          </li>
          <li>
            <strong>Return result:</strong> The joined string is the zigzag
            conversion
          </li>
        </ol>
        <p className="text-body-small mt-4 text-onError">
          <strong>Time Complexity:</strong> O(n) where n is the string length
          <br />
          <strong>Space Complexity:</strong> O(n) for storing the row arrays
          <br />
          <strong>Pattern:</strong> The direction bounces like a ball between
          top and bottom rows
        </p>
      </div>
    </div>
  );
}

export default ZigzagConversionVisualizer;
