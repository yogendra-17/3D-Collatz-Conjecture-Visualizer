/**
 * Collatz Conjecture Math Core
 * Handles calculation of Collatz sequences, stopping times, peak values,
 * tree structure generation, and dataset analysis.
 */

export const PRESETS = [
  { value: 27, label: "27 (111 steps, Peak 9,232)", desc: "Famous for climbing high and taking 111 steps before hitting 1." },
  { value: 97, label: "97 (118 steps, Peak 9,232)", desc: "Smallest number under 100 with 118 total steps." },
  { value: 871, label: "871 (178 steps, Peak 190,996)", desc: "Record holder for numbers under 1,000." },
  { value: 6171, label: "6171 (261 steps, Peak 25,602,576)", desc: "Record holder for numbers under 10,000." },
  { value: 77031, label: "77031 (350 steps, Peak 21,807,172)", desc: "Record holder for numbers under 100,000." },
  { value: 837799, label: "837799 (524 steps)", desc: "Record holder for numbers under 1,000,000." },
  { value: 12, label: "12 (9 steps)", desc: "Simple sequence: 12 -> 6 -> 3 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1" },
  { value: 19, label: "19 (20 steps, Peak 88)", desc: "Moderate climber." },
  { value: 255, label: "255 (47 steps, Peak 13,120)", desc: "High peak relative to starting value." },
  { value: 1024, label: "1024 (10 steps - Power of 2)", desc: "Direct descent with 0 odd steps!" }
];

/**
 * Calculates full Collatz sequence for starting number n
 * @param {number|string|bigint} n 
 * @param {boolean} shortcut - whether to use (3n+1)/2 shortcut
 * @returns {Object} sequence statistics and detailed step array
 */
export function calculateCollatzSequence(nInput, shortcut = false) {
  let val;
  try {
    val = BigInt(nInput);
    if (val < 1n) val = 1n;
  } catch (e) {
    val = 1n;
  }

  const steps = [];
  let current = val;
  let stepIndex = 0;
  let maxVal = current;
  let maxValStep = 0;
  let oddCount = 0;
  let evenCount = 0;

  // Record initial step 0
  const isOdd0 = current % 2n !== 0n;
  if (isOdd0) oddCount++; else evenCount++;

  steps.push({
    step: 0,
    value: Number(current),
    bigValue: current,
    isOdd: isOdd0,
    operation: "Start",
    formula: `n = ${current.toString()}`
  });

  const MAX_STEPS = 10000; // Safety guard

  while (current > 1n && stepIndex < MAX_STEPS) {
    stepIndex++;
    const isOdd = current % 2n !== 0n;
    let nextVal;
    let opStr;
    let formulaStr;

    if (isOdd) {
      oddCount++;
      if (shortcut) {
        nextVal = (3n * current + 1n) / 2n;
        opStr = "3n + 1 / 2";
        formulaStr = `(3 × ${current} + 1) / 2 = ${nextVal}`;
      } else {
        nextVal = 3n * current + 1n;
        opStr = "3n + 1";
        formulaStr = `3 × ${current} + 1 = ${nextVal}`;
      }
    } else {
      evenCount++;
      nextVal = current / 2n;
      opStr = "n / 2";
      formulaStr = `${current} / 2 = ${nextVal}`;
    }

    if (nextVal > maxVal) {
      maxVal = nextVal;
      maxValStep = stepIndex;
    }

    current = nextVal;

    steps.push({
      step: stepIndex,
      value: Number(current),
      bigValue: current,
      isOdd: current % 2n !== 0n,
      prevIsOdd: isOdd,
      operation: opStr,
      formula: formulaStr
    });
  }

  const totalStoppingTime = stepIndex;
  const startNum = Number(val);
  const peakNum = Number(maxVal);

  return {
    startNumber: startNum,
    bigStartNumber: val,
    totalStoppingTime,
    maxVal: peakNum,
    bigMaxVal: maxVal,
    maxValStep,
    peakRatio: startNum > 0 ? (peakNum / startNum).toFixed(2) : "1",
    oddCount,
    evenCount,
    oddPercentage: totalStoppingTime > 0 ? ((oddCount / totalStoppingTime) * 100).toFixed(1) : "0",
    evenPercentage: totalStoppingTime > 0 ? ((evenCount / totalStoppingTime) * 100).toFixed(1) : "0",
    steps
  };
}

/**
 * Generates reverse Collatz tree up to a given depth
 * @param {number} maxDepth 
 * @param {Set<number>} highlightPathSet - set of numbers in active sequence
 */
export function generateCollatzTree(maxDepth = 7, highlightPathSet = new Set()) {
  const nodes = [];
  const edges = [];
  const visited = new Set();

  function buildBranch(val, depth, x, y, z, parentId = null) {
    if (depth > maxDepth || visited.has(val) || val > 100000) return;
    visited.add(val);

    const id = `node_${val}`;
    const isHighlighted = highlightPathSet.has(val);

    nodes.push({
      id,
      value: val,
      depth,
      x, y, z,
      isHighlighted,
      isEven: val % 2 === 0
    });

    if (parentId) {
      edges.push({
        from: parentId,
        to: id,
        fromVal: parseInt(parentId.replace('node_', '')),
        toVal: val,
        isHighlighted: isHighlighted && highlightPathSet.has(parseInt(parentId.replace('node_', '')))
      });
    }

    // Children in reverse: 2n is always valid
    const child1 = val * 2;
    // (n-1)/3 is valid if (val - 1) % 3 === 0 and (val - 1) / 3 is odd and > 1
    let child2 = null;
    if ((val - 1) % 3 === 0) {
      const candidate = (val - 1) / 3;
      if (candidate > 1 && candidate % 2 !== 0) {
        child2 = candidate;
      }
    }

    const angleSpread = Math.PI * 0.45 / (depth + 1);
    const radius = 4 + depth * 2.5;

    // Child 1 (2n)
    const angle1 = (nodes.length * 0.6) + angleSpread;
    const nx1 = x + Math.cos(angle1) * (radius * 0.4);
    const ny1 = y + 2.5;
    const nz1 = z + Math.sin(angle1) * (radius * 0.4);
    buildBranch(child1, depth + 1, nx1, ny1, nz1, id);

    // Child 2 ((n-1)/3)
    if (child2) {
      const angle2 = angle1 + Math.PI * 0.75;
      const nx2 = x + Math.cos(angle2) * (radius * 0.5);
      const ny2 = y + 3.2;
      const nz2 = z + Math.sin(angle2) * (radius * 0.5);
      buildBranch(child2, depth + 1, nx2, ny2, nz2, id);
    }
  }

  buildBranch(1, 0, 0, 0, 0, null);

  return { nodes, edges };
}

/**
 * Calculates statistics for a range of starting numbers [1..count]
 */
export function generateRangeData(count = 200) {
  const data = [];
  for (let i = 1; i <= count; i++) {
    const seq = calculateCollatzSequence(i);
    data.push({
      n: i,
      stoppingTime: seq.totalStoppingTime,
      maxVal: seq.maxVal,
      oddCount: seq.oddCount,
      evenCount: seq.evenCount
    });
  }
  return data;
}
