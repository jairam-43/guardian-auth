const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../services/supabase');

const router = express.Router();

router.post('/register-app', async (req, res) => {
  try {
    const { appName, ownerEmail, allowedDomains } = req.body;
    
    if (!appName || !ownerEmail || !allowedDomains || allowedDomains.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'App name, owner email, and allowed domains are required' 
      });
    }
    
    const appId = `guardian_app_${uuidv4().replace(/-/g, '').substring(0, 8)}`;
    const apiKey = `guardian_key_${uuidv4().replace(/-/g, '')}`;
    
    const { data: app, error } = await supabaseAdmin
      .from('connected_apps')
      .insert({
        app_name: appName,
        app_id: appId,
        owner_email: ownerEmail,
        api_key: apiKey,
        allowed_domains: JSON.stringify(allowedDomains),
        theme_config: JSON.stringify({
          primaryColor: '#4f8ef7',
          borderRadius: '8px',
          fontFamily: 'Inter'
        }),
        is_active: true,
        total_logins: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to register app' });
    }
    
    const integrationCode = `
<!-- Guardian Auth Integration -->
<script src="https://guardian-auth.vercel.app/widget.js"></script>
<guardian-login app-id="${appId}"></guardian-login>
    `.trim();
    
    res.json({
      success: true,
      appId,
      apiKey,
      integrationCode
    });
    
  } catch (error) {
    console.error('Register app error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/config/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    
    const { data: app, error } = await supabaseAdmin
      .from('connected_apps')
      .select('theme_config')
      .eq('app_id', appId)
      .eq('is_active', true)
      .single();
    
    if (error || !app) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }
    
    res.json({
      success: true,
      config: JSON.parse(app.theme_config)
    });
    
  } catch (error) {
    console.error('Get app config error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/stats/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    
    const { data: app, error } = await supabaseAdmin
      .from('connected_apps')
      .select('total_logins')
      .eq('app_id', appId)
      .eq('is_active', true)
      .single();
    
    if (error || !app) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }
    
    res.json({
      success: true,
      stats: {
        totalLogins: app.total_logins || 0
      }
    });
    
  } catch (error) {
    console.error('Get app stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/increment-login/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    
    const { data: app, error: fetchError } = await supabaseAdmin
      .from('connected_apps')
      .select('total_logins')
      .eq('app_id', appId)
      .eq('is_active', true)
      .single();
    
    if (fetchError || !app) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }
    
    const { error: updateError } = await supabaseAdmin
      .from('connected_apps')
      .update({ total_logins: (app.total_logins || 0) + 1 })
      .eq('app_id', appId);
    
    if (updateError) {
      return res.status(500).json({ success: false, error: 'Failed to update login count' });
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Increment login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
