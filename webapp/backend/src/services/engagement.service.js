const supabase = require('../config/supabase');

/**
 * Engagement Service
 * Handles social features: likes, comments, and dynamic priority adjustment
 */

class EngagementService {
    /**
     * Calculate engagement score for a complaint
     */
    async calculateEngagementScore(complaintId) {
        try {
            // Get like count
            const { count: likeCount } = await supabase
                .from('complaint_engagement')
                .select('*', { count: 'exact', head: true })
                .eq('complaint_id', complaintId)
                .eq('action_type', 'like');

            // Get comment count
            const { count: commentCount } = await supabase
                .from('complaint_engagement')
                .select('*', { count: 'exact', head: true })
                .eq('complaint_id', complaintId)
                .eq('action_type', 'comment');

            // Get complaint age in days
            const { data: complaint } = await supabase
                .from('complaints')
                .select('created_at')
                .eq('id', complaintId)
                .single();

            if (!complaint) return 0;

            const daysSinceCreation = (Date.now() - new Date(complaint.created_at)) / (1000 * 60 * 60 * 24);
            const recency = Math.max(daysSinceCreation, 1); // Avoid division by zero

            // Calculate velocity (engagement per day)
            // Likes are weighted heavily (3x) as they're clear signals of support
            // Comments have minimal weight (0.5x) since they can be anything (questions, spam, etc.)
            const velocity = ((likeCount || 0) * 3 + (commentCount || 0) * 0.5) / recency;

            // Normalize to 0-1 scale (cap at 10 for normalization)
            const normalizedScore = Math.min(velocity / 10, 1.0);

            return normalizedScore;
        } catch (error) {
            console.error('Error calculating engagement score:', error);
            return 0;
        }
    }

    /**
     * Calculate final urgency score and auto-escalate if needed
     */
    async calculateFinalUrgency(complaintId) {
        try {
            // Get complaint
            const { data: complaint, error } = await supabase
                .from('complaints')
                .select('*')
                .eq('id', complaintId)
                .single();

            if (error || !complaint) {
                console.error('Error fetching complaint for urgency calc:', error);
                return null;
            }

            // AI severity score
            const severityScores = { 'High': 3, 'Normal': 2, 'Low': 1 };
            const aiSeverity = severityScores[complaint.severity] || 2;

            // Get engagement score
            const engagementScore = await this.calculateEngagementScore(complaintId);
            const engagementWeight = engagementScore * 3; // Max +3 boost (allows Low(1) + 3 = 4 -> High)

            const finalUrgency = aiSeverity + engagementWeight;

            // Auto-escalate if urgency >= 4 and not already High
            let shouldEscalate = false;
            if (finalUrgency >= 4 && complaint.severity !== 'High') {
                shouldEscalate = true;

                // Update complaint severity
                await supabase
                    .from('complaints')
                    .update({
                        severity: 'High',
                        engagement_score: engagementScore
                    })
                    .eq('id', complaintId);

                console.log(`Auto-escalated complaint ${complaintId} due to engagement (score: ${engagementScore.toFixed(2)})`);
            } else {
                // Just update engagement score
                await supabase
                    .from('complaints')
                    .update({ engagement_score: engagementScore })
                    .eq('id', complaintId);
            }

            return {
                urgency_score: finalUrgency,
                ai_severity: aiSeverity,
                engagement_contribution: engagementWeight,
                engagement_score: engagementScore,
                escalated: shouldEscalate
            };
        } catch (error) {
            console.error('Error calculating final urgency:', error);
            return null;
        }
    }

    /**
     * Add like to a complaint
     */
    async toggleLike(complaintId, userId) {
        try {
            // Check if already liked
            const { data: existing } = await supabase
                .from('complaint_engagement')
                .select('id')
                .eq('complaint_id', complaintId)
                .eq('user_id', userId)
                .eq('action_type', 'like')
                .single();

            if (existing) {
                // Unlike
                await supabase
                    .from('complaint_engagement')
                    .delete()
                    .eq('id', existing.id);

                // Recalculate urgency
                await this.calculateFinalUrgency(complaintId);

                return { liked: false };
            } else {
                // Like
                await supabase
                    .from('complaint_engagement')
                    .insert({
                        complaint_id: complaintId,
                        user_id: userId,
                        action_type: 'like'
                    });

                // Recalculate urgency
                await this.calculateFinalUrgency(complaintId);

                return { liked: true };
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    }

    /**
     * Add comment to a complaint
     */
    async addComment(complaintId, userId, commentText) {
        try {
            const { data, error } = await supabase
                .from('complaint_engagement')
                .insert({
                    complaint_id: complaintId,
                    user_id: userId,
                    action_type: 'comment',
                    comment_text: commentText
                })
                .select()
                .single();

            if (error) throw error;

            // Recalculate urgency
            await this.calculateFinalUrgency(complaintId);

            return data;
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    }

    /**
     * Get engagement stats for a complaint
     */
    async getEngagementStats(complaintId) {
        try {
            const { count: likeCount } = await supabase
                .from('complaint_engagement')
                .select('*', { count: 'exact', head: true })
                .eq('complaint_id', complaintId)
                .eq('action_type', 'like');

            const { data: comments } = await supabase
                .from('complaint_engagement')
                .select('comment_text, created_at, user_id')
                .eq('complaint_id', complaintId)
                .eq('action_type', 'comment')
                .order('created_at', { ascending: false });

            return {
                like_count: likeCount || 0,
                comment_count: comments?.length || 0,
                comments: comments || []
            };
        } catch (error) {
            console.error('Error getting engagement stats:', error);
            return { like_count: 0, comment_count: 0, comments: [] };
        }
    }

    /**
     * Check if a user has liked a complaint
     */
    async hasUserLiked(complaintId, userId) {
        try {
            const { data, error } = await supabase
                .from('complaint_engagement')
                .select('id')
                .eq('complaint_id', complaintId)
                .eq('user_id', userId)
                .eq('action_type', 'like')
                .maybeSingle();

            if (error) throw error;
            return !!data;
        } catch (error) {
            console.error('Error checking user like:', error);
            return false;
        }
    }
}

module.exports = new EngagementService();
