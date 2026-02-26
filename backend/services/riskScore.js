function calculateRiskScore(params) {
  const { 
    isNewDevice, 
    isNewLocation, 
    failedAttempts, 
    loginHour, 
    previousAttempts 
  } = params;
  
  let score = 0;
  const reasons = [];
  
  if (isNewDevice) {
    score += 20;
    reasons.push('New device detected');
  }
  
  if (isNewLocation) {
    score += 20;
    reasons.push('New location detected');
  }
  
  score += failedAttempts * 15;
  if (failedAttempts > 0) {
    reasons.push(`${failedAttempts} failed attempt(s)`);
  }
  
  if (loginHour < 6 || loginHour > 23) {
    score += 15;
    reasons.push('Unusual login time');
  }
  
  if (previousAttempts > 3) {
    score += 10;
    reasons.push('Multiple recent attempts');
  }
  
  let level = 'low';
  let action = 'allow';
  
  if (score >= 61) {
    level = 'high';
    action = 'block';
  } else if (score >= 31) {
    level = 'medium';
    action = 'require_otp';
  }
  
  return {
    score: Math.min(score, 100),
    level,
    action,
    reasons
  };
}

module.exports = { calculateRiskScore };
