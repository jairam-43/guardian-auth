const express = require('express');
const { supabaseAdmin } = require('../services/supabase');

const router = express.Router();

router.get('/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: sessions, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to fetch active sessions' });
    }
    
    res.json({ success: true, sessions });
    
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.delete('/invalidate/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const { error } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('id', sessionId);
    
    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to invalidate session' });
    }
    
    res.json({ success: true, message: 'Session invalidated successfully' });
    
  } catch (error) {
    console.error('Invalidate session error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: auditLogs, error } = await supabaseAdmin
      .from('login_audit')
      .select('*')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
      .limit(20);
    
    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to fetch session history' });
    }
    
    res.json({ success: true, history: auditLogs });
    
  } catch (error) {
    console.error('Get session history error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
