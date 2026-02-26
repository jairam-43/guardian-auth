function analyzeClickPattern(clickTimings) {
  if (!clickTimings || clickTimings.length < 2) {
    return {
      isSuspicious: false,
      reason: 'Insufficient data',
      averageClickTime: 0,
      pattern: 'normal'
    };
  }
  
  const timeGaps = [];
  for (let i = 1; i < clickTimings.length; i++) {
    timeGaps.push(clickTimings[i] - clickTimings[i - 1]);
  }
  
  const averageTime = timeGaps.reduce((sum, gap) => sum + gap, 0) / timeGaps.length;
  const totalTime = clickTimings[clickTimings.length - 1] - clickTimings[0];
  
  const tooFastGaps = timeGaps.filter(gap => gap < 300);
  const identicalGaps = timeGaps.filter(gap => 
    Math.abs(gap - averageTime) < 50
  );
  
  if (totalTime < 1000 && clickTimings.length >= 3) {
    return {
      isSuspicious: true,
      reason: 'Clicks too fast - possible bot',
      averageClickTime: averageTime,
      pattern: 'instant'
    };
  }
  
  if (tooFastGaps.length > 0) {
    return {
      isSuspicious: true,
      reason: 'Some clicks too fast - possible bot',
      averageClickTime: averageTime,
      pattern: 'too_fast'
    };
  }
  
  if (identicalGaps.length === timeGaps.length && timeGaps.length > 2) {
    return {
      isSuspicious: true,
      reason: 'Robotic clicking pattern detected',
      averageClickTime: averageTime,
      pattern: 'robotic'
    };
  }
  
  return {
    isSuspicious: false,
    reason: 'Normal clicking pattern',
    averageClickTime: averageTime,
    pattern: 'normal'
  };
}

module.exports = { analyzeClickPattern };
