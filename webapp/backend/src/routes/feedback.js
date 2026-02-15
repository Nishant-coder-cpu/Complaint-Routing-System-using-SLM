const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { verifyAuth, requireRole } = require('../middleware/auth');

// POST /api/admin/complaints/:id/validate-ai - Validate or correct AI predictions
router.post('/complaints/:id/validate-ai', verifyAuth, requireRole('admin', 'authority'), async (req, res) => {
    try {
        const { id } = req.params;
        const { confirmed, corrected_category, corrected_severity, corrected_department } = req.body;

        // Get the original complaint
        const { data: complaint, error: fetchError } = await supabase
            .from('complaints')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        // Create AI feedback record
        const feedbackData = {
            complaint_id: id,
            original_text: complaint.complaint_text,
            ai_prediction: {
                category: complaint.categories,
                severity: complaint.severity,
                department: complaint.route_to
            },
            corrected_by: req.user.id
        };

        // If corrections provided, add them
        if (!confirmed) {
            feedbackData.human_correction = {
                category: corrected_category || complaint.categories,
                severity: corrected_severity || complaint.severity,
                department: corrected_department || complaint.route_to
            };

            // Update the complaint with corrected values
            const updateData = {};
            if (corrected_category) updateData.categories = [corrected_category];
            if (corrected_severity) updateData.severity = corrected_severity;
            if (corrected_department) updateData.route_to = corrected_department;
            updateData.requires_review = false; // Clear the review flag

            await supabase
                .from('complaints')
                .update(updateData)
                .eq('id', id);
        } else {
            // Just clear the review flag if confirmed
            await supabase
                .from('complaints')
                .update({ requires_review: false })
                .eq('id', id);
        }

        // Store feedback
        const { error: insertError } = await supabase
            .from('ai_feedback')
            .insert([feedbackData]);

        if (insertError) {
            console.error('Error inserting AI feedback:', insertError);
            return res.status(500).json({ error: 'Failed to save feedback' });
        }

        res.json({ success: true, message: confirmed ? 'AI prediction confirmed' : 'Corrections saved' });
    } catch (error) {
        console.error('Error in validate-ai endpoint:', error);
        res.status(500).json({ error: 'Failed to process validation' });
    }
});

// GET /api/admin/training-data - Export AI training data (CSV)
router.get('/training-data', verifyAuth, requireRole('admin'), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('ai_feedback')
            .select('original_text, ai_prediction, human_correction, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch training data' });
        }

        // Convert to CSV
        const csv = [
            'text,predicted_category,actual_category,predicted_severity,actual_severity,predicted_department,actual_department,created_at'
        ];

        data.forEach(row => {
            const pred = row.ai_prediction;
            const actual = row.human_correction || pred; // Use correction if exists, else use prediction

            csv.push([
                `"${row.original_text.replace(/"/g, '""')}"`,
                `"${Array.isArray(pred.category) ? pred.category.join(';') : pred.category}"`,
                `"${Array.isArray(actual.category) ? actual.category.join(';') : actual.category}"`,
                pred.severity,
                actual.severity,
                pred.department,
                actual.department,
                row.created_at
            ].join(','));
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=training_data.csv');
        res.send(csv.join('\n'));
    } catch (error) {
        console.error('Error exporting training data:', error);
        res.status(500).json({ error: 'Failed to export training data' });
    }
});

module.exports = router;
