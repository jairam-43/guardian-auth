const express = require('express');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../services/supabase');
const { getRandomRule, applyRule, getRuleInstruction } = require('../services/dppg');
const { generateGrid } = require('../services/imageGrid');
const { calculateRiskScore } = require('../services/riskScore');
const { generateFingerprint, checkDevice, saveDevice } = require('../services/deviceFingerprint');
const { getLocationFromIP, checkLocationAnomaly } = require('../services/geoLocation');
const { analyzeClickPattern } = require('../services/behavioralBiometrics');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    console.log('Supabase URL:', process.env.SUPABASE_URL);
    const { email, fullName, secretEmojis } = req.body;
    
    if (!email || !fullName || !secretEmojis || secretEmojis.length !== 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, full name, and exactly 5 secret emojis are required' 
      });
    }
    
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.log('Registration check error:', checkError);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }
    
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        full_name: fullName,
        is_active: true,
        is_locked: false,
        failed_attempts: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (userError) {
      console.log('User creation error:', userError);
      return res.status(500).json({ success: false, error: 'Failed to create user' });
    }
    
    for (let i = 0; i < secretEmojis.length; i++) {
      const iconLabel = secretEmojis[i]; // This is now an icon label like 'dog', 'apple', etc.
      const hash = crypto.createHash('sha256').update(iconLabel).digest('hex');
      
      const { error: imageError } = await supabaseAdmin
        .from('secret_images')
        .insert({
          user_id: user.id,
          emoji_char: iconLabel,     // store icon label
          image_hash: hash,          // store hash too
          position_index: i,
          created_at: new Date().toISOString()
        });
      
      if (imageError) {
        console.error('Error saving secret image:', imageError);
      }
    }
    
    res.json({ 
      success: true, 
      userId: user.id, 
      message: 'Registration successful' 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/start-session', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (userError || !user) {
      return res.status(400).json({ success: false, error: 'User not found' });
    }
    
    if (user.is_locked) {
      return res.status(400).json({ success: false, error: 'Account locked' });
    }
    
    const rule = await getRandomRule();
    
    const { data: secretImages, error: imagesError } = await supabaseAdmin
      .from('secret_images')
      .select('*')
      .eq('user_id', user.id)
      .order('position_index');
    
    if (imagesError || !secretImages) {
      return res.status(500).json({ success: false, error: 'Failed to load secret images' });
    }
    
    const secretEmojis = secretImages.map(img => img.image_hash);
    const grid = generateGrid(secretEmojis);
    
    const sessionToken = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    const fingerprint = generateFingerprint(req);
    const deviceCheck = await checkDevice(user.id, fingerprint);
    const isNewDevice = !deviceCheck.isKnown;
    
    if (!deviceCheck.isKnown) {
      await saveDevice(user.id, fingerprint, req);
    }
    
    const location = await getLocationFromIP(req.ip);
    const isNewLocation = await checkLocationAnomaly(user.id, location.country);
    
    const currentHour = new Date().getHours();
    const riskScore = calculateRiskScore({
      isNewDevice,
      isNewLocation,
      failedAttempts: user.failed_attempts,
      loginHour: currentHour,
      previousAttempts: 0
    });
    
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        rule_id: rule.id,
        grid_layout: JSON.stringify(grid),
        risk_score: riskScore.score,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();
    
    if (sessionError) {
      return res.status(500).json({ success: false, error: 'Failed to create session' });
    }
    
    res.json({
      success: true,
      sessionToken,
      grid,
      ruleInstruction: getRuleInstruction(rule.rule_pattern),
      rulePattern: rule.rule_pattern,
      riskScore,
      isNewDevice,
      location
    });
    
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/verify-images', async (req, res) => {
  try {
    const { sessionToken, selectedEmojis, clickTimings } = req.body;
    
    if (!sessionToken || !selectedEmojis || selectedEmojis.length === 0) {
      return res.status(400).json({ success: false, error: 'Session token and selected emojis are required' });
    }
    
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();
    
    if (sessionError || !session) {
      return res.status(400).json({ success: false, error: 'Invalid session' });
    }
    
    if (new Date(session.expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: 'Session expired' });
    }
    
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user_id)
      .single();
    
    if (userError || !user) {
      return res.status(400).json({ success: false, error: 'User not found' });
    }
    
    const { data: secretImages, error: imagesError } = await supabaseAdmin
      .from('secret_images')
      .select('*')
      .eq('user_id', user.id)
      .order('position_index');
    
    if (imagesError || !secretImages) {
      return res.status(500).json({ success: false, error: 'Failed to load secret images' });
    }
    
    const { data: rule, error: ruleError } = await supabaseAdmin
      .from('dppg_rules')
      .select('*')
      .eq('id', session.rule_id)
      .single();
    
    if (ruleError || !rule) {
      return res.status(500).json({ success: false, error: 'Failed to load rule' });
    }
    
    const secretEmojis = secretImages.map(img => img.image_hash);
    const { expected } = applyRule(rule.rule_pattern, secretEmojis);
    
    const selectedHashes = selectedEmojis.map(emoji => 
      crypto.createHash('sha256').update(emoji).digest('hex')
    );
    
    const behavioralAnalysis = analyzeClickPattern(clickTimings);
    
    if (behavioralAnalysis.isSuspicious) {
      await supabaseAdmin
        .from('login_audit')
        .insert({
          user_id: user.id,
          session_id: session.id,
          status: 'blocked',
          ip_address: req.ip,
          country: 'Unknown',
          city: 'Unknown',
          device_hash: 'Unknown',
          risk_score: 100,
          failure_reason: behavioralAnalysis.reason,
          attempted_at: new Date().toISOString()
        });
      
      return res.status(400).json({ 
        success: false, 
        error: 'Suspicious activity detected',
        reason: behavioralAnalysis.reason 
      });
    }
    
    const isCorrect = expected.length === selectedHashes.length &&
      expected.every(hash => selectedHashes.includes(hash));
    
    if (isCorrect) {
      await supabaseAdmin
        .from('sessions')
        .update({ is_verified: true })
        .eq('id', session.id);
      
      return res.json({ 
        success: true, 
        nextStep: 'otp',
        riskScore: { score: session.risk_score, level: 'low' }
      });
    } else {
      const newFailedAttempts = user.failed_attempts + 1;
      const isLocked = newFailedAttempts >= 3;
      
      await supabaseAdmin
        .from('users')
        .update({ 
          failed_attempts: newFailedAttempts,
          is_locked: isLocked
        })
        .eq('id', user.id);
      
      await supabaseAdmin
        .from('login_audit')
        .insert({
          user_id: user.id,
          session_id: session.id,
          status: isLocked ? 'blocked' : 'failed',
          ip_address: req.ip,
          country: 'Unknown',
          city: 'Unknown',
          device_hash: 'Unknown',
          risk_score: session.risk_score,
          failure_reason: 'Incorrect image selection',
          attempted_at: new Date().toISOString()
        });
      
      return res.status(400).json({ 
        success: false, 
        error: 'Incorrect image selection',
        attemptsRemaining: Math.max(0, 3 - newFailedAttempts),
        isLocked
      });
    }
    
  } catch (error) {
    console.error('Verify images error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { sessionToken, otpCode } = req.body;
    
    if (!sessionToken || !otpCode) {
      return res.status(400).json({ success: false, error: 'Session token and OTP code are required' });
    }
    
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();
    
    if (sessionError || !session) {
      return res.status(400).json({ success: false, error: 'Invalid session' });
    }
    
    if (!session.is_verified) {
      return res.status(400).json({ success: false, error: 'Images not verified yet' });
    }
    
    if (session.otp_code !== otpCode) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }
    
    if (new Date(session.otp_expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: 'OTP expired' });
    }
    
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user_id)
      .single();
    
    if (userError || !user) {
      return res.status(400).json({ success: false, error: 'User not found' });
    }
    
    await supabaseAdmin
      .from('users')
      .update({ 
        failed_attempts: 0,
        last_login: new Date().toISOString()
      })
      .eq('id', user.id);
    
    await supabaseAdmin
      .from('login_audit')
      .insert({
        user_id: user.id,
        session_id: session.id,
        status: 'success',
        ip_address: req.ip,
        country: 'Unknown',
        city: 'Unknown',
        device_hash: 'Unknown',
        risk_score: session.risk_score,
        attempted_at: new Date().toISOString()
      });
    
    res.json({ 
      success: true, 
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      }
    });
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { sessionToken } = req.body;
    
    if (!sessionToken) {
      return res.status(400).json({ success: false, error: 'Session token is required' });
    }
    
    const { error } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('session_token', sessionToken);
    
    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to logout' });
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, is_active, is_locked, failed_attempts, created_at, last_login')
      .eq('id', id)
      .single();
    
    if (error || !user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, user });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
