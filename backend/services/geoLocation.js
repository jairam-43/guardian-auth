const axios = require('axios');
const { supabaseAdmin } = require('./supabase');

async function getLocationFromIP(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return {
      country: 'Local',
      city: 'Development',
      lat: null,
      lon: null,
      isp: 'Local Development'
    };
  }
  
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    const data = response.data;
    
    return {
      country: data.country || 'Unknown',
      city: data.city || 'Unknown',
      lat: data.lat || null,
      lon: data.lon || null,
      isp: data.isp || 'Unknown'
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return {
      country: 'Unknown',
      city: 'Unknown',
      lat: null,
      lon: null,
      isp: 'Unknown'
    };
  }
}

async function checkLocationAnomaly(userId, currentCountry) {
  const { data, error } = await supabaseAdmin
    .from('login_audit')
    .select('country')
    .eq('user_id', userId)
    .eq('status', 'success')
    .order('attempted_at', { ascending: false })
    .limit(5);
  
  if (error || !data || data.length === 0) {
    return false;
  }
  
  const usualCountries = [...new Set(data.map(item => item.country))];
  
  return !usualCountries.includes(currentCountry);
}

module.exports = {
  getLocationFromIP,
  checkLocationAnomaly
};
