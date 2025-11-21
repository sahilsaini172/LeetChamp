import React, { useState, useCallback, useRef, useEffect } from 'react';

function PalindromeVisualizer() {
  const [inputNumber, setInputNumber] = useState(121);
  const [running, setRunning] = useState(false);
  const [currentX, setCurrentX] = useState(0);
  const [reverse, setReverse] = useState(0);
  const [xcopy, setXcopy] = useState(0);
  const [digits, setDigits] = useState([]);
  const [currentDigit, setCurrentDigit] = useState(null);
  const [stepNumber, setStepNumber] = useState(0);
  const [status, setStatus] = useState('Click "Start" to check if number is palindrome');
  const [result, setResult] = useState(null);
  
  const animationRef = useRef(null);

  const width = 900;
  const height = 600;

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
        done: true
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
      done: false
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
        done: false
      };

      reverse = (reverse * 10) + digit;
      
      yield {
        x: x,
        reverse: reverse,
        xcopy: xcopy,
        step: step++,
        digit: digit,
        digits: [...extractedDigits],
        status: `Build reverse: (${reverse - digit} × 10) + ${digit} = ${reverse}`,
        result: null,
        done: false
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
        done: false
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
      status: `Compare: reverse (${reverse}) ${isPalindrome ? '===' : '!=='} original (${xcopy}) → ${isPalindrome ? '✓ PALINDROME!' : '✗ NOT a palindrome'}`,
      result: isPalindrome,
      done: true
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
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', fontSize: '32px', marginBottom: '10px' }}>
        Palindrome Number Visualizer
      </h2>
      <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '20px' }}>
        Watch how the algorithm builds the reversed number digit by digit
      </p>

      {/* Controls */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="number"
          value={inputNumber}
          onChange={(e) => setInputNumber(Number(e.target.value))}
          disabled={running}
          style={{
            padding: '12px 20px',
            fontSize: '18px',
            width: '200px',
            borderRadius: '5px',
            border: '2px solid #3498db',
            marginRight: '10px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
          placeholder="Enter number"
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
          {running ? 'Running...' : 'Start Check'}
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

      {/* Status */}
      <div style={{
        padding: '20px',
        backgroundColor: result === null ? '#ecf0f1' : result ? '#d5f4e6' : '#fadbd8',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#2c3e50',
        border: result !== null ? (result ? '3px solid #27ae60' : '3px solid #e74c3c') : 'none'
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
          Algorithm Visualization
        </text>

        {/* Variables Box */}
        <g transform="translate(50, 80)">
          <rect width={800} height={120} fill="#ecf0f1" stroke="#34495e" strokeWidth="2" rx="8" />
          
          {/* Original Number */}
          <text x={20} y={35} fontSize="18" fontWeight="bold" fill="#2c3e50">
            Original (xcopy):
          </text>
          <text x={200} y={35} fontSize="24" fontWeight="bold" fill="#3498db">
            {xcopy || inputNumber}
          </text>

          {/* Current X */}
          <text x={20} y={70} fontSize="18" fontWeight="bold" fill="#2c3e50">
            Current x:
          </text>
          <text x={200} y={70} fontSize="24" fontWeight="bold" fill="#e67e22">
            {currentX}
          </text>

          {/* Reverse */}
          <text x={20} y={105} fontSize="18" fontWeight="bold" fill="#2c3e50">
            Reverse:
          </text>
          <text x={200} y={105} fontSize="24" fontWeight="bold" fill="#9b59b6">
            {reverse}
          </text>

          {/* Current Digit Highlight */}
          {currentDigit !== null && (
            <>
              <text x={450} y={60} fontSize="18" fontWeight="bold" fill="#e74c3c">
                Current Digit:
              </text>
              <circle cx={620} cy={55} r={35} fill="#e74c3c" />
              <text x={620} y={65} textAnchor="middle" fontSize="32" fontWeight="bold" fill="white">
                {currentDigit}
              </text>
            </>
          )}
        </g>

        {/* Digit Flow Visualization */}
        <g transform="translate(50, 250)">
          <text x={0} y={0} fontSize="20" fontWeight="bold" fill="#2c3e50">
            Extracted Digits (right to left):
          </text>
          
          {digits.map((digit, index) => {
            const x = index * 80 + 20;
            const y = 30;
            const isCurrentDigit = index === digits.length - 1 && currentDigit === digit;
            
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={70}
                  height={70}
                  fill={isCurrentDigit ? '#e74c3c' : '#3498db'}
                  stroke="#2c3e50"
                  strokeWidth="3"
                  rx="8"
                />
                <text
                  x={x + 35}
                  y={y + 48}
                  textAnchor="middle"
                  fontSize="32"
                  fontWeight="bold"
                  fill="white"
                >
                  {digit}
                </text>
                <text
                  x={x + 35}
                  y={y + 95}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#7f8c8d"
                >
                  [{digits.length - 1 - index}]
                </text>
              </g>
            );
          })}
        </g>

        {/* Reverse Building Animation */}
        <g transform="translate(50, 420)">
          <text x={0} y={0} fontSize="20" fontWeight="bold" fill="#2c3e50">
            Building Reversed Number:
          </text>
          
          <rect
            x={20}
            y={20}
            width={760}
            height={100}
            fill="#f8f9fa"
            stroke="#9b59b6"
            strokeWidth="4"
            rx="8"
          />
          
          <text
            x={400}
            y={85}
            textAnchor="middle"
            fontSize={reverse.toString().length > 6 ? '36' : '48'}
            fontWeight="bold"
            fill="#9b59b6"
          >
            {reverse}
          </text>
        </g>

        {/* Result indicator */}
        {result !== null && (
          <g transform="translate(50, 540)">
            <rect
              width={800}
              height={50}
              fill={result ? '#27ae60' : '#e74c3c'}
              rx="8"
            />
            <text
              x={400}
              y={33}
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              fill="white"
            >
              {result ? '✓ IS PALINDROME!' : '✗ NOT A PALINDROME'}
            </text>
          </g>
        )}
      </svg>

      {/* Algorithm Explanation */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: 'white', 
        borderRadius: '8px',
        border: '2px solid #bdc3c7',
        maxWidth: '900px',
        margin: '30px auto 0'
      }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Algorithm Steps:</h3>
        <ol style={{ color: '#34495e', fontSize: '16px', lineHeight: '1.8' }}>
          <li><strong>Check negative:</strong> If x &lt; 0, return false immediately</li>
          <li><strong>Initialize:</strong> Set reverse = 0, save original as xcopy</li>
          <li><strong>Extract digit:</strong> Get last digit using x % 10</li>
          <li><strong>Build reverse:</strong> Multiply current reverse by 10 and add the digit</li>
          <li><strong>Remove digit:</strong> Divide x by 10 (integer division)</li>
          <li><strong>Repeat:</strong> Continue steps 3-5 while x &gt; 0</li>
          <li><strong>Compare:</strong> Check if reverse === xcopy</li>
        </ol>
      </div>
    </div>
  );
}

export default PalindromeVisualizer;
