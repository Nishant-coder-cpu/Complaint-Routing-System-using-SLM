const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const aiService = require('../services/ai.service');
const slaPred = require('../services/sla-predictor.service');
const { verifyAuth, requireRole } = require('../middleware/auth');

// POST /api/complaints - Submit a complaint (public or authenticated)
router.post('/', async (req, res) => {
    try {
        const { complaint_text, anonymous } = req.body;

        if (!complaint_text || complaint_text.trim().length === 0) {
            return res.status(400).json({ error: 'Complaint text is required' });
        }

        // Get AI classification
        const classification = await aiService.classifyComplaint(complaint_text);
        console.log('AI Classification Result:', JSON.stringify(classification, null, 2));

        // Get SLA prediction
        const slaPrediction = await slaPred.predictSLA(classification);

        // Calculate SLA deadline
        const sla_deadline = new Date();
        sla_deadline.setHours(sla_deadline.getHours() + classification.sla_hours);

        // Prepare complaint data
        const complaintData = {
            complaint_text,
            categories: classification.categories,
            severity: classification.severity,
            anonymous: anonymous || false,
            anonymous_recommended: classification.anonymous_recommended,
            escalation_required: classification.escalation_required,
            route_to: classification.route_to,
            sla_hours: classification.sla_hours,
            sla_deadline: sla_deadline.toISOString(),
            status: 'pending',
            predicted_resolution_days: slaPrediction.predicted_days,
            visibility: anonymous ? 'private' : 'public'
        };

        // Add user_id if authenticated - SAVE IT EVEN IF ANONYMOUS so user can track it
        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.substring(7);
                const { data: { user } } = await supabase.auth.getUser(token);
                if (user) {
                    complaintData.user_id = user.id;
                    console.log(`Linking complaint to user: ${user.id}`);
                }
            } catch (error) {
                console.error('Auth token parsing failed during complaint creation:', error);
            }
        }

        console.log('Inserting complaint data:', JSON.stringify(complaintData, null, 2));

        // Insert complaint
        const { data, error } = await supabase
            .from('complaints')
            .insert([complaintData])
            .select()
            .single();

        if (error) {
            console.error('Database insertion error:', error);
            return res.status(500).json({ error: 'Failed to create complaint' });
        }

        console.log('Complaint created successfully:', data.id);

        // Log action
        try {
            await supabase.from('actions_log').insert([{
                complaint_id: data.id,
                action_type: 'created',
                notes: 'Complaint submitted'
            }]);
        } catch (logError) {
            console.error('Failed to create action log:', logError);
            // Don't fail the request if logging fails
        }


        res.status(201).json({
            id: data.id,
            status: data.status,
            severity: data.severity,
            route_to: data.route_to,
            sla_hours: data.sla_hours,
            anonymous: data.anonymous
        });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ error: 'Failed to process complaint' });
    }
});


// POST /api/complaints/analyze - Get AI analysis without submitting
router.post('/analyze', async (req, res) => {
    try {
        const { complaint_text } = req.body;

        if (!complaint_text || complaint_text.trim().length === 0) {
            return res.status(400).json({ error: 'Complaint text is required' });
        }

        console.log('Analyzing complaint text...');

        // Get AI classification
        const classification = await aiService.classifyComplaint(complaint_text);

        // Get SLA prediction
        const slaPrediction = await slaPred.predictSLA(classification);

        res.json({
            categories: classification.categories,
            severity: classification.severity,
            route_to: classification.route_to,
            sla_hours: classification.sla_hours,
            anonymous_recommended: classification.anonymous_recommended,
            predicted_resolution_days: slaPrediction.predicted_days
        });
    } catch (error) {
        console.error('Error analyzing complaint:', error);
        res.status(500).json({ error: 'Failed to analyze complaint' });
    }
});

// GET /api/complaints - Get all public complaints (for community feed)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .eq('visibility', 'public')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('GET /: Database error:', error);
            return res.status(500).json({ error: 'Failed to fetch complaints' });
        }

        res.json(data || []);
    } catch (error) {
        console.error('Error fetching public complaints:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

// GET /api/complaints/my - Get user's own complaints (authenticated)
router.get('/my', verifyAuth, async (req, res) => {
    console.log(`GET /my: Fetching for user ${req.user.id}`);
    try {
        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('GET /my: Database error:', error);
            return res.status(500).json({ error: 'Failed to fetch complaints' });
        }

        console.log(`GET /my: Found ${data.length} complaints for user ${req.user.id}`);
        res.json(data);
    } catch (error) {
        console.error('Error fetching user complaints:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

// GET /api/complaints/department - Get department complaints (authority only)
router.get('/department', verifyAuth, requireRole('authority', 'admin'), async (req, res) => {
    try {
        let query = supabase
            .from('complaints')
            .select('id, complaint_text, categories, severity, status, route_to, sla_hours, sla_deadline, created_at, updated_at, anonymous, escalation_required');

        // Filter by department for authority users
        if (req.user.role === 'authority') {
            console.log(`Fetching complaints for authority: ${req.user.id}, Department: ${req.user.department}`);
            query = query.eq('route_to', req.user.department);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch complaints' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching department complaints:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

// GET /api/complaints/:id - Get complaint by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if ID is a valid UUID to prevent database errors if random strings are passed
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({ error: 'Invalid complaint ID format' });
        }

        const { data, error } = await supabase
            .from('complaints')
            .select('id, complaint_text, categories, severity, status, route_to, sla_hours, sla_deadline, resolution_notes, created_at, updated_at, anonymous')
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        // Don't expose complaint_text if anonymous
        if (data.anonymous) {
            delete data.complaint_text;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({ error: 'Failed to fetch complaint' });
    }
});

// PATCH /api/complaints/:id/status - Update complaint status (authority/admin)
router.patch('/:id/status', verifyAuth, requireRole('authority', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolution_notes } = req.body;

        if (!['pending', 'in_progress', 'resolved'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Verify complaint exists and user has permission
        const { data: complaint } = await supabase
            .from('complaints')
            .select('route_to')
            .eq('id', id)
            .single();

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        // Check department permission for authority users
        if (req.user.role === 'authority' && complaint.route_to !== req.user.department) {
            return res.status(403).json({ error: 'Not authorized for this complaint' });
        }

        // Update complaint
        const updateData = { status };
        if (resolution_notes) {
            updateData.resolution_notes = resolution_notes;
        }

        const { data, error } = await supabase
            .from('complaints')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to update complaint' });
        }

        // Log action
        await supabase.from('actions_log').insert([{
            complaint_id: id,
            action_type: 'status_updated',
            performed_by: req.user.id,
            notes: `Status changed to ${status}`
        }]);

        res.json(data);
    } catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({ error: 'Failed to update complaint' });
    }
});

// DELETE /api/complaints/:id - Delete a complaint
router.delete('/:id', verifyAuth, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify complaint exists
        const { data: complaint, error: fetchError } = await supabase
            .from('complaints')
            .select('user_id, route_to')
            .eq('id', id)
            .single();

        if (fetchError || !complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        // Authorization check
        let authorized = false;

        if (req.user.role === 'admin') {
            authorized = true;
        } else if (req.user.role === 'authority') {
            if (complaint.route_to === req.user.department) authorized = true;
        } else if (req.user.id === complaint.user_id) {
            authorized = true;
        }

        if (!authorized) {
            return res.status(403).json({ error: 'Not authorized to delete this complaint' });
        }

        // Delete complaint
        const { error: deleteError } = await supabase
            .from('complaints')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Delete error:', deleteError);
            return res.status(500).json({ error: 'Failed to delete complaint' });
        }

        // Log action (if possible, though complaint ID is gone, maybe just log generally or skip)
        // Since complaint is deleted, foreign key on actions_log might fail if we try to insert with deleted ID.
        // Assuming cascade delete handles logs cleanup.

        res.json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        console.error('Error deleting complaint:', error);
        res.status(500).json({ error: 'Failed to delete complaint' });
    }
});

module.exports = router;
