const express = require('express');
const { supabaseAdmin } = require('../services/supabase');
const { sendOTPEmail } = require('../services/emailAlert');

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { sessionToken, email } = req.body;
    
    if (!sessionToken || !email) {
      return res.status(400).json({ success: false, error: 'Session token and email are required' });
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
    
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 60 * 1000);
    
    const { error: updateError } = await supabaseAdmin
      .from('sessions')
      .update({
        otp_code: otpCode,
        otp_expires_at: otpExpiresAt.toISOString()
      })
      .eq('id', session.id);
    
    if (updateError) {
      return res.status(500).json({ success: false, error: 'Failed to save OTP' });
    }
    
    const emailResult = await sendOTPEmail(email, otpCode);
    
    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      return res.status(500).json({ success: false, error: 'Failed to send OTP email' });
    }
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      otpCode: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
      expiresAt: otpExpiresAt.toISOString()
    });
    
  } catch (error) {
    console.error('Generate OTP error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/verify', async (req, res) => {
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
      return res.json({ valid: false, expired: false, error: 'Invalid session' });
    }
    
    const isExpired = new Date(session.otp_expires_at) < new Date();
    const isValid = session.otp_code === otpCode && !isExpired;
    
    res.json({ 
      valid: isValid, 
      expired: isExpired,
      error: !isValid ? (isExpired ? 'OTP expired' : 'Invalid OTP') : null
    });
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ valid: false, expired: false, error: 'Internal server error' });
  }
});

router.post('/resend', async (req, res) => {
  try {
    const { sessionToken, email } = req.body;
    
    if (!sessionToken || !email) {
      return res.status(400).json({ success: false, error: 'Session token and email are required' });
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
    
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 60 * 1000);
    
    const { error: updateError } = await supabaseAdmin
      .from('sessions')
      .update({
        otp_code: otpCode,
        otp_expires_at: otpExpiresAt.toISOString()
      })
      .eq('id', session.id);
    
    if (updateError) {
      return res.status(500).json({ success: false, error: 'Failed to regenerate OTP' });
    }
    
    const emailResult = await sendOTPEmail(email, otpCode);
    
    if (!emailResult.success) {
      console.error('Failed to resend OTP email:', emailResult.error);
      return res.status(500).json({ success: false, error: 'Failed to resend OTP email' });
    }
    
    res.json({ success: true, message: 'OTP resent successfully' });
    
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
