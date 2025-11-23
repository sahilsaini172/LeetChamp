import React, { useState, useCallback, useRef, useEffect } from 'react';

function RomanToIntVisualizer() {
  const [inputRoman, setInputRoman] = useState('MCMXCIV');
  const [running, setRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [result, setResult] = useState(0);
  const [comparison, setComparison] = useState(null);
  const [operation, setOperation] = useState('');
  const [stepNumber, setStepNumber] = useState(0);
  const [status, setStatus] = useState('Click "Start" to convert Roman numeral');
  const [finalResult, setFinalResult] = useState(null);
  const [history, setHistory] = useState([]);
  
  const animationRef = useRef(null);

  const width = 1000;
  const height = 700;

  const roman = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
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
      operation: '',
      step: step++,
      status: `Starting conversion of "${s}"`,
      history: [],
      done: false
    };

    for (let i = 0; i < s.length - 1; i++) {
      const currentVal = roman[s[i]];
      const nextVal = roman[s[i + 1]];
      
      yield {
        index: i,
        result: res,
        comparison: { current: s[i], next: s[i + 1], currentVal, nextVal },
        operation: 'comparing',
        step: step++,
        status: `Compare: ${s[i]} (${currentVal}) vs ${s[i + 1]} (${nextVal})`,
        history: [...historyLog],
        done: false
      };

      if (currentVal < nextVal) {
        res -= currentVal;
        historyLog.push({
          index: i,
          char: s[i],
          value: currentVal,
          operation: 'subtract',
          result: res
        });
        
        yield {
          index: i,
          result: res,
          comparison: { current: s[i], next: s[i + 1], currentVal, nextVal },
          operation: 'subtract',
          step: step++,
          status: `${currentVal} < ${nextVal} → Subtract: ${res + currentVal} - ${currentVal} = ${res}`,
          history: [...historyLog],
          done: false
        };
      } else {
        res += currentVal;
        historyLog.push({
          index: i,
          char: s[i],
          value: currentVal,
          operation: 'add',
          result: res
        });
        
        yield {
          index: i,
          result: res,
          comparison: { current: s[i], next: s[i + 1], currentVal, nextVal },
          operation: 'add',
          step: step++,
          status: `${currentVal} >= ${nextVal} → Add: ${res - currentVal} + ${currentVal} = ${res}`,
          history: [...historyLog],
          done: false
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
      operation: 'last',
      step: step++,
      status: `Processing last character: ${lastChar} (${lastVal})`,
      history: [...historyLog],
      done: false
    };

    res += lastVal;
    historyLog.push({
      index: s.length - 1,
      char: lastChar,
      value: lastVal,
      operation: 'add',
      result: res
    });

    yield {
      index: s.length - 1,
      result: res,
      comparison: null,
      operation: 'add',
      step: step++,
      status: `Add last character: ${res - lastVal} + ${lastVal} = ${res}`,
      history: [...historyLog],
      done: false
    };

    yield {
      index: -1,
      result: res,
      comparison: null,
      operation: 'complete',
      step: step++,
      status: `✓ Conversion complete! "${s}" = ${res}`,
      history: historyLog,
      done: true
    };

    return { result: res };
  }

  // Run visualization
  const runVisualization = useCallback(() => {
    if (!inputRoman || !/^[IVXLCDM]+$/.test(inputRoman)) {
      setStatus('❌ Please enter a valid Roman numeral (I, V, X, L, C, D, M)');
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
    setOperation('');
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

  // Sample Romans
  const samples = ['IX', 'LVIII', 'MCMXCIV', 'CDXLIV', 'MMMCMXCIX'];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', fontSize: '32px', marginBottom: '10px' }}>
        Roman to Integer Visualizer
      </h2>
      <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '20px' }}>
        Watch the subtraction rule: if current &lt; next, subtract; otherwise add
      </p>

      {/* Controls */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          value={inputRoman}
          onChange={(e) => setInputRoman(e.target.value.toUpperCase())}
          disabled={running}
          style={{
            padding: '12px 20px',
            fontSize: '20px',
            width: '250px',
            borderRadius: '5px',
            border: '2px solid #3498db',
            marginRight: '10px',
            textAlign: 'center',
            fontWeight: 'bold',
            letterSpacing: '2px'
          }}
          placeholder="Enter Roman"
        />
        
        <button
          onClick={runVisualization}
          disabled={running}
          style={{
            padding: '12px 30px',
            marginRight: '10px',
            fontSize: '16px',
            backgroundColor: running ? '#95a5a6' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: running ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {running ? 'Converting...' : 'Start Conversion'}
        </button>
        
        <button
          onClick={stopVisualization}
          disabled={!running}
          style={{
            padding: '12px 30px',
            marginRight: '10px',
            fontSize: '16px',
            backgroundColor: !running ? '#95a5a6' : '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: !running ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          Stop
        </button>
        
        <button
          onClick={reset}
          disabled={running}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            backgroundColor: running ? '#95a5a6' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: running ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          Reset
        </button>
      </div>

      {/* Sample buttons */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ marginRight: '10px', color: '#7f8c8d', fontWeight: 'bold' }}>Try samples:</span>
        {samples.map(sample => (
          <button
            key={sample}
            onClick={() => setInputRoman(sample)}
            disabled={running}
            style={{
              padding: '8px 16px',
              margin: '0 5px',
              fontSize: '14px',
              backgroundColor: running ? '#ecf0f1' : 'white',
              color: '#3498db',
              border: '2px solid #3498db',
              borderRadius: '5px',
              cursor: running ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {sample}
          </button>
        ))}
      </div>

      {/* Status */}
      <div style={{
        padding: '20px',
        backgroundColor: finalResult !== null ? '#d5f4e6' : '#ecf0f1',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#2c3e50',
        border: finalResult !== null ? '3px solid #27ae60' : 'none'
      }}>
        Step {stepNumber}: {status}
      </div>

      {/* SVG Visualization */}
      <svg width={width} height={height} style={{ 
        border: '3px solid #bdc3c7', 
        borderRadius: '10px',
        backgroundColor: 'white',
        display: 'block',
        margin: '0 auto'
      }}>
        
        {/* Title */}
        <text x={width / 2} y={40} textAnchor="middle" fontSize="24" fontWeight="bold" fill="#2c3e50">
          Roman Numeral Conversion Process
        </text>

        {/* Roman characters display */}
        <g transform="translate(50, 80)">
          <text x={0} y={0} fontSize="18" fontWeight="bold" fill="#2c3e50">
            Input String:
          </text>
          
          {inputRoman.split('').map((char, index) => {
            const x = index * 70 + 50;
            const y = 20;
            const isCurrent = index === currentIndex;
            const isNext = comparison && index === currentIndex + 1;
            const isPast = index < currentIndex;
            
            let bgColor = '#ecf0f1';
            let textColor = '#2c3e50';
            
            if (isCurrent) {
              bgColor = operation === 'subtract' ? '#e74c3c' : '#27ae60';
              textColor = 'white';
            } else if (isNext) {
              bgColor = '#f39c12';
              textColor = 'white';
            } else if (isPast) {
              bgColor = '#bdc3c7';
            }
            
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={60}
                  height={70}
                  fill={bgColor}
                  stroke="#2c3e50"
                  strokeWidth="3"
                  rx="8"
                />
                <text
                  x={x + 30}
                  y={y + 48}
                  textAnchor="middle"
                  fontSize="32"
                  fontWeight="bold"
                  fill={textColor}
                >
                  {char}
                </text>
                <text
                  x={x + 30}
                  y={y + 95}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#7f8c8d"
                  fontWeight="bold"
                >
                  {roman[char]}
                </text>
              </g>
            );
          })}
        </g>

        {/* Comparison display */}
        {comparison && (
          <g transform="translate(50, 240)">
            <rect width={900} height={120} fill="#f8f9fa" stroke="#34495e" strokeWidth="2" rx="8" />
            
            <text x={450} y={35} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#2c3e50">
              Comparison Logic
            </text>
            
            {/* Current character */}
            <circle cx={200} cy={75} r={35} fill="#e74c3c" />
            <text x={200} y={85} textAnchor="middle" fontSize="28" fontWeight="bold" fill="white">
              {comparison.current}
            </text>
            <text x={200} y={125} textAnchor="middle" fontSize="16" fill="#2c3e50">
              Value: {comparison.currentVal}
            </text>
            
            {/* Comparison symbol */}
            <text x={330} y={85} textAnchor="middle" fontSize="32" fontWeight="bold" fill="#34495e">
              {comparison.currentVal < comparison.nextVal ? '<' : '≥'}
            </text>
            
            {/* Next character */}
            <circle cx={460} cy={75} r={35} fill="#f39c12" />
            <text x={460} y={85} textAnchor="middle" fontSize="28" fontWeight="bold" fill="white">
              {comparison.next}
            </text>
            <text x={460} y={125} textAnchor="middle" fontSize="16" fill="#2c3e50">
              Value: {comparison.nextVal}
            </text>
            
            {/* Arrow and operation */}
            <text x={630} y={75} fontSize="32" fill="#34495e">→</text>
            <rect x={700} y={45} width={150} height={60} fill={operation === 'subtract' ? '#e74c3c' : '#27ae60'} rx="8" />
            <text x={775} y={85} textAnchor="middle" fontSize="24" fontWeight="bold" fill="white">
              {operation === 'subtract' ? 'SUBTRACT' : 'ADD'}
            </text>
          </g>
        )}

        {/* Running total */}
        <g transform="translate(50, 390)">
          <rect width={900} height={80} fill="#3498db" stroke="#2c3e50" strokeWidth="3" rx="8" />
          <text x={450} y={30} textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">
            Running Total
          </text>
          <text x={450} y={60} textAnchor="middle" fontSize="36" fontWeight="bold" fill="white">
            {result}
          </text>
        </g>

        {/* Operation history */}
        <g transform="translate(50, 500)">
          <text x={0} y={0} fontSize="18" fontWeight="bold" fill="#2c3e50">
            Operation History:
          </text>
          
          <rect x={0} y={10} width={900} height={140} fill="#f8f9fa" stroke="#34495e" strokeWidth="2" rx="8" />
          
          {history.slice(-5).map((item, index) => {
            const y = 35 + index * 25;
            return (
              <text key={index} x={20} y={y} fontSize="15" fill="#2c3e50">
                <tspan fontWeight="bold">[{item.index}]</tspan> {item.char} ({item.value}) → 
                <tspan fill={item.operation === 'subtract' ? '#e74c3c' : '#27ae60'} fontWeight="bold">
                  {' '}{item.operation === 'subtract' ? 'SUBTRACT' : 'ADD'}{' '}
                </tspan>
                → Result: {item.result}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '30px', height: '30px', backgroundColor: '#ecf0f1', marginRight: '10px', borderRadius: '5px', border: '2px solid #2c3e50' }}></div>
          <span>Not Processed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '30px', height: '30px', backgroundColor: '#e74c3c', marginRight: '10px', borderRadius: '5px' }}></div>
          <span>Current (Subtract)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '30px', height: '30px', backgroundColor: '#27ae60', marginRight: '10px', borderRadius: '5px' }}></div>
          <span>Current (Add)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '30px', height: '30px', backgroundColor: '#f39c12', marginRight: '10px', borderRadius: '5px' }}></div>
          <span>Next Character</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '30px', height: '30px', backgroundColor: '#bdc3c7', marginRight: '10px', borderRadius: '5px' }}></div>
          <span>Already Processed</span>
        </div>
      </div>

      {/* Algorithm explanation */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: 'white', 
        borderRadius: '8px',
        border: '2px solid #bdc3c7',
        maxWidth: '1000px',
        margin: '30px auto 0'
      }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Roman to Integer Algorithm:</h3>
        <ol style={{ color: '#34495e', fontSize: '16px', lineHeight: '1.8' }}>
          <li><strong>Create value map:</strong> Map each Roman symbol to its integer value (I=1, V=5, X=10, etc.)</li>
          <li><strong>Initialize result:</strong> Start with res = 0</li>
          <li><strong>Loop through string:</strong> For each character (except the last)</li>
          <li><strong>Compare values:</strong> Check if current value &lt; next value</li>
          <li><strong>Subtract rule:</strong> If current &lt; next, subtract current from result (e.g., IV → 5-1=4)</li>
          <li><strong>Add rule:</strong> Otherwise, add current to result</li>
          <li><strong>Add last character:</strong> Always add the last character's value</li>
          <li><strong>Return result:</strong> The accumulated sum is the integer value</li>
        </ol>
        <p style={{ marginTop: '15px', color: '#7f8c8d', fontSize: '14px' }}>
          <strong>Example:</strong> "MCMXCIV" = 1000 + (1000-100) + (100-10) + (5-1) = 1994
        </p>
      </div>
    </div>
  );
}

export default RomanToIntVisualizer;
