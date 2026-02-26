const express = require('express');
const { supabaseAdmin } = require('../services/supabase');

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: totalUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' });
    
    const { data: todayLogins, error: loginsError } = await supabaseAdmin
      .from('login_audit')
      .select('*', { count: 'exact' })
      .gte('attempted_at', today);
    
    const { data: successLogins, error: successError } = await supabaseAdmin
      .from('login_audit')
      .select('*', { count: 'exact' })
      .gte('attempted_at', today)
      .eq('status', 'success');
    
    const { data: failedLogins, error: failedError } = await supabaseAdmin
      .from('login_audit')
      .select('*', { count: 'exact' })
      .gte('attempted_at', today)
      .eq('status', 'failed');
    
    const { data: suspiciousLogins, error: suspiciousError } = await supabaseAdmin
      .from('login_audit')
      .select('*', { count: 'exact' })
      .gte('attempted_at', today)
      .or('status.eq.blocked,risk_score.gte.60');
    
    if (usersError || loginsError || successError || failedError || suspiciousError) {
      return res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
    
    const totalLogins = todayLogins?.length || 0;
    const successCount = successLogins?.length || 0;
    const failedCount = failedLogins?.length || 0;
    const suspiciousCount = suspiciousLogins?.length || 0;
    const successRate = totalLogins > 0 ? Math.round((successCount / totalLogins) * 100) : 0;
    
    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers?.length || 0,
        totalLogins,
        successCount,
        failedCount,
        suspiciousCount,
        successRate
      }
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/audit-log', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const offset = (page - 1) * limit;
    
    let query = supabaseAdmin
      .from('login_audit')
      .select(`
        *,
        users(email, full_name)
      `)
      .order('attempted_at', { ascending: false });
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    
    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to fetch audit log' });
    }
    
    res.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/risk-breakdown', async (req, res) => {
  try {
    const { data: lowRisk, error: lowError } = await supabaseAdmin
      .from('login_audit')
      .select('*', { count: 'exact' })
      .lt('risk_score', 31);
    
    const { data: mediumRisk, error: mediumError } = await supabaseAdmin
      .from('login_audit')
      .select('*', { count: 'exact' })
      .gte('risk_score', 31)
      .lt('risk_score', 61);
    
    const { data: highRisk, error: highError } = await supabaseAdmin
      .from('login_audit')
      .select('*', { count: 'exact' })
      .gte('risk_score', 61);
    
    if (lowError || mediumError || highError) {
      return res.status(500).json({ success: false, error: 'Failed to fetch risk breakdown' });
    }
    
    res.json({
      success: true,
      breakdown: {
        low: lowRisk?.length || 0,
        medium: mediumRisk?.length || 0,
        high: highRisk?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Get risk breakdown error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/geo-map', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('login_audit')
      .select('country')
      .not('country', 'is', null);
    
    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to fetch geo data' });
    }
    
    const countryCounts = {};
    (data || []).forEach(item => {
      const country = item.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    
    res.json({
      success: true,
      geoData: countryCounts
    });
    
  } catch (error) {
    console.error('Get geo map error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/hourly-stats', async (req, res) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const { data, error } = await supabaseAdmin
      .from('login_audit')
      .select('attempted_at, status')
      .gte('attempted_at', twentyFourHoursAgo.toISOString())
      .order('attempted_at', { ascending: true });
    
    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to fetch hourly stats' });
    }
    
    const hourlyStats = [];
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const hourStart = new Date(hour.getFullYear(), hour.getMonth(), hour.getDate(), hour.getHours(), 0, 0);
      const hourEnd = new Date(hour.getFullYear(), hour.getMonth(), hour.getDate(), hour.getHours(), 59, 59);
      
      const hourData = (data || []).filter(item => {
        const itemTime = new Date(item.attempted_at);
        return itemTime >= hourStart && itemTime <= hourEnd;
      });
      
      hourlyStats.push({
        hour: hour.getHours().toString().padStart(2, '0') + ':00',
        count: hourData.length,
        success: hourData.filter(item => item.status === 'success').length,
        failed: hourData.filter(item => item.status === 'failed').length
      });
    }
    
    res.json({
      success: true,
      hourlyStats
    });
    
  } catch (error) {
    console.error('Get hourly stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/export-audit', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('login_audit')
      .select(`
        *,
        users(email, full_name)
      `)
      .order('attempted_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to export audit data' });
    }
    
    const csv = [
      'ID,Email,Time,Status,Country,City,Device,RiskScore,Reason',
      ...(data || []).map(item => [
        item.id,
        item.users?.email || 'Unknown',
        new Date(item.attempted_at).toISOString(),
        item.status,
        item.country || 'Unknown',
        item.city || 'Unknown',
        item.device_hash?.substring(0, 8) + '...' || 'Unknown',
        item.risk_score || 0,
        item.failure_reason || ''
      ].join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=guardian-auth-audit.csv');
    res.send(csv);
    
  } catch (error) {
    console.error('Export audit error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
