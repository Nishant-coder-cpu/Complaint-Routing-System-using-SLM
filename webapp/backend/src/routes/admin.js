const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { verifyAuth, requireRole } = require('../middleware/auth');
const chatbotService = require('../services/chatbot.service');

// GET /api/admin/complaints/archived - Get all resolved/archived complaints with filtering
router.get('/complaints/archived', verifyAuth, requireRole('admin'), async (req, res) => {
    try {
        const { search, severity, department, startDate, endDate, limit = 50 } = req.query;

        let query = supabase
            .from('complaints')
            .select('*')
            .eq('status', 'resolved')
            .order('updated_at', { ascending: false });

        // Apply filters
        if (search) {
            query = query.or(`complaint_text.ilike.%${search}%,id.ilike.%${search}%`);
        }
        if (severity) {
            query = query.eq('severity', severity);
        }
        if (department) {
            query = query.eq('route_to', department);
        }
        if (startDate) {
            query = query.gte('updated_at', startDate);
        }
        if (endDate) {
            query = query.lte('updated_at', endDate);
        }

        query = query.limit(parseInt(limit));

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching archived complaints:', error);
            return res.status(500).json({ error: 'Failed to fetch archived complaints' });
        }

        res.json(data || []);
    } catch (error) {
        console.error('Error in archived complaints route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// All admin routes require admin role
router.use(verifyAuth, requireRole('admin'));

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req, res) => {
    console.log('GET /api/admin/stats: calculating statistics...');
    try {
        // Total complaints
        const { count: totalComplaints, error: totalError } = await supabase
            .from('complaints')
            .select('*', { count: 'exact', head: true });

        if (totalError) console.error('Stats: Total complaints error:', totalError);

        // Critical complaints
        const { count: criticalComplaints, error: criticalError } = await supabase
            .from('complaints')
            .select('*', { count: 'exact', head: true })
            .eq('severity', 'High'); // Changed from 'Critical' to match AI output often being 'High'

        if (criticalError) console.error('Stats: Critical complaints error:', criticalError);

        // Unresolved complaints
        const { count: unresolvedComplaints } = await supabase
            .from('complaints')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'resolved');

        // Pending complaints (explicitly status='pending')
        const { count: pendingComplaints } = await supabase
            .from('complaints')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        // Pending review (low confidence)
        const { count: pendingReview } = await supabase
            .from('complaints')
            .select('*', { count: 'exact', head: true })
            .eq('requires_review', true);

        // SLA breaches
        const now = new Date().toISOString();
        const { count: slaBreaches } = await supabase
            .from('complaints')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'resolved')
            .lt('sla_deadline', now);

        console.log({
            total: totalComplaints,
            critical: criticalComplaints,
            unresolved: unresolvedComplaints,
            breaches: slaBreaches
        });

        // Severity distribution
        const { data: severityData } = await supabase
            .from('complaints')
            .select('severity');

        const severityDistribution = severityData ? severityData.reduce((acc, item) => {
            acc[item.severity] = (acc[item.severity] || 0) + 1;
            return acc;
        }, {}) : {};

        // Department distribution
        const { data: deptData } = await supabase
            .from('complaints')
            .select('route_to');

        const departmentDistribution = deptData ? deptData.reduce((acc, item) => {
            acc[item.route_to] = (acc[item.route_to] || 0) + 1;
            return acc;
        }, {}) : {};

        const responseData = {
            total_complaints: totalComplaints || 0,
            critical_complaints: criticalComplaints || 0,
            pending_complaints: pendingComplaints || 0,
            unresolved_complaints: unresolvedComplaints || 0,
            pending_review: pendingReview || 0,
            resolved_complaints: (totalComplaints || 0) - (unresolvedComplaints || 0),
            sla_breach_count: slaBreaches || 0,
            severity_breakdown: severityDistribution,
            department_breakdown: departmentDistribution
        };
        console.log('Sending stats response:', responseData);
        res.json(responseData);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// GET /api/admin/pending-review - Get complaints flagged for review
router.get('/pending-review', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('complaints')
            .select('id, complaint_text, categories, severity, route_to, ai_confidence, created_at, status')
            .eq('requires_review', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pending review complaints:', error);
            return res.status(500).json({ error: 'Failed to fetch pending review complaints' });
        }

        res.json(data || []);
    } catch (error) {
        console.error('Error in pending-review endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch pending review complaints' });
    }
});

// GET /api/admin/sla-breaches - Get SLA breach details
router.get('/sla-breaches', async (req, res) => {
    try {
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('complaints')
            .select('id, categories, severity, status, route_to, sla_deadline, created_at')
            .neq('status', 'resolved')
            .lt('sla_deadline', now)
            .order('sla_deadline', { ascending: true });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch SLA breaches' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching SLA breaches:', error);
        res.status(500).json({ error: 'Failed to fetch SLA breaches' });
    }
});

// GET /api/admin/complaints - Get all complaints
router.get('/complaints', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch complaints' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching all complaints:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

// POST /api/admin/chat - Chatbot endpoint
router.post('/chat', async (req, res) => {
    try {
        console.log('Chatbot Request Headers:', req.headers);
        console.log('Chatbot Request Body:', req.body);
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            console.error('Invalid message format:', { message, type: typeof message });
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = await chatbotService.chat(message);
        res.json(response);
    } catch (error) {
        console.error('Error in chatbot endpoint:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

// POST /api/admin/chat - Chatbot endpoint
router.post('/chat', async (req, res) => {
    try {
        console.log('Chatbot Request Headers:', req.headers);
        console.log('Chatbot Request Body:', req.body);
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            console.error('Invalid message format:', { message, type: typeof message });
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = await chatbotService.chat(message);
        res.json(response);
    } catch (error) {
        console.error('Error in chatbot endpoint:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

// GET /api/admin/users - Get all users with their roles and departments
router.get('/users', async (req, res) => {
    try {
        const { data, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }

        // Fetch user metadata from public.users table if it exists
        const userIds = data.users.map(u => u.id);
        const { data: userMetadata } = await supabase
            .from('users')
            .select('id, role, department')
            .in('id', userIds);

        // Merge auth users with metadata
        const enrichedUsers = data.users.map(user => {
            const metadata = userMetadata?.find(m => m.id === user.id);
            return {
                id: user.id,
                email: user.email,
                role: metadata?.role || user.user_metadata?.role || 'complainant',
                department: metadata?.department || user.user_metadata?.department || null,
                created_at: user.created_at,
                last_sign_in_at: user.last_sign_in_at
            };
        });

        res.json(enrichedUsers);
    } catch (error) {
        console.error('Error in users route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/admin/users/:id - Update user role and department
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { role, department } = req.body;

        // Validate role
        const validRoles = ['complainant', 'authority', 'admin'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Validate that authority users have a department
        if (role === 'authority' && !department) {
            return res.status(400).json({ error: 'Authority users must have a department' });
        }

        // Update user metadata in auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(id, {
            user_metadata: { role, department }
        });

        if (authError) {
            console.error('Error updating auth user:', authError);
            return res.status(500).json({ error: 'Failed to update user' });
        }

        // Update or insert into public.users table
        const { error: dbError } = await supabase
            .from('users')
            .upsert({
                id,
                role,
                department
            }, {
                onConflict: 'id'
            });

        if (dbError) {
            console.error('Error updating users table:', dbError);
            return res.status(500).json({ error: 'Failed to update user metadata' });
        }

        res.json({
            message: 'User updated successfully',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                role,
                department
            }
        });
    } catch (error) {
        console.error('Error in update user route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
