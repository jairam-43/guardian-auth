require('dotenv').config();
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

async function sendOTPEmail(email, otpCode) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Guardian Auth <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Guardian Auth OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f8ef7;">Guardian Auth Verification</h2>
          <p>Your OTP code is:</p>
          <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">${otpCode}</span>
          </div>
          <p>This code expires in 60 seconds.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    });
    
    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

async function sendSecurityAlert(email, alertData) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Guardian Auth <security@resend.dev>',
      to: [email],
      subject: '⚠️ Suspicious Login Attempt - Guardian Auth',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">⚠️ Suspicious Login Attempt Detected</h2>
          <p>We detected a suspicious login attempt to your Guardian Auth account:</p>
          
          <div style="background: #f8f8f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Time:</strong> ${new Date(alertData.timestamp).toLocaleString()}</p>
            <p><strong>Location:</strong> ${alertData.city}, ${alertData.country}</p>
            <p><strong>Device:</strong> ${alertData.device}</p>
            <p><strong>IP Address:</strong> ${alertData.ip}</p>
            <p><strong>Risk Score:</strong> <span style="color: ${alertData.riskScore >= 60 ? '#ef4444' : alertData.riskScore >= 30 ? '#eab308' : '#22c55e'}">${alertData.riskScore}/100</span></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px;">This was me</a>
            <a href="#" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Block this login</a>
          </div>
          
          <p style="color: #666; font-size: 14px;">If you don't recognize this activity, please secure your account immediately.</p>
        </div>
      `
    });
    
    if (error) {
      console.error('Security alert email error:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Security alert service error:', error);
    return { success: false, error };
  }
}

module.exports = {
  sendOTPEmail,
  sendSecurityAlert
};
