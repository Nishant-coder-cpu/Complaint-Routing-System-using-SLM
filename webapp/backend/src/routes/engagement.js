const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../middleware/auth');
const engagementService = require('../services/engagement.service');

// POST /api/engagement/:id/like - Toggle like on a complaint
router.post('/:id/like', verifyAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await engagementService.toggleLike(id, userId);
        res.json(result);
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
});

// POST /api/engagement/:id/comment - Add comment to a complaint
router.post('/:id/comment', verifyAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { comment_text } = req.body;

        if (!comment_text || !comment_text.trim()) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const result = await engagementService.addComment(id, userId, comment_text);
        res.json(result);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// GET /api/engagement/:id - Get engagement stats for a complaint
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const stats = await engagementService.getEngagementStats(id);
        res.json(stats);
    } catch (error) {
        console.error('Error getting engagement stats:', error);
        res.status(500).json({ error: 'Failed to get engagement stats' });
    }
});

// GET /api/engagement/:id/user-status - Check if current user liked this complaint
router.get('/:id/user-status', verifyAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const liked = await engagementService.hasUserLiked(id, userId);
        res.json({ liked });
    } catch (error) {
        console.error('Error checking user like status:', error);
        res.status(500).json({ error: 'Failed to check like status' });
    }
});

module.exports = router;
