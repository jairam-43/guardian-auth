const crypto = require('crypto');
const { supabaseAdmin } = require('./supabase');

function generateFingerprint(req) {
  const data = [
    req.ip || 'unknown',
    req.headers['user-agent'] || 'unknown',
    req.headers['accept-language'] || 'unknown'
  ].join('|');
  
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function checkDevice(userId, fingerprint) {
  const { data, error } = await supabaseAdmin
    .from('device_fingerprints')
    .select('*')
    .eq('user_id', userId)
    .eq('device_hash', fingerprint)
    .single();
  
  if (error || !data) {
    return { isKnown: false, deviceData: null };
  }
  
  return { isKnown: true, deviceData: data };
}

async function saveDevice(userId, fingerprint, req) {
  const deviceData = {
    user_id: userId,
    device_hash: fingerprint,
    browser: req.headers['user-agent'] || 'Unknown',
    os: extractOS(req.headers['user-agent']),
    screen_size: req.headers['sec-ch-viewport-width'] || 'Unknown',
    timezone: req.headers['timezone'] || 'Unknown',
    ip_address: req.ip || 'Unknown',
    is_trusted: false,
    first_seen: new Date().toISOString(),
    last_seen: new Date().toISOString()
  };
  
  const { data, error } = await supabaseAdmin
    .from('device_fingerprints')
    .insert(deviceData)
    .select()
    .single();
  
  if (error) {
    console.error('Error saving device:', error);
    return null;
  }
  
  return data;
}

function extractOS(userAgent) {
  if (!userAgent) return 'Unknown';
  
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  
  return 'Unknown';
}

module.exports = {
  generateFingerprint,
  checkDevice,
  saveDevice
};
