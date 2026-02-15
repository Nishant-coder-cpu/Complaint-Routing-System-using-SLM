import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMessageSquare, FiSend } from 'react-icons/fi';
import api from '../lib/api';
import { supabase } from '../lib/supabase';

const EngagementWidget = ({ complaintId }) => {
    const [stats, setStats] = useState({ like_count: 0, comment_count: 0, comments: [] });
    const [hasLiked, setHasLiked] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEngagement();
        checkLikeStatus();
    }, [complaintId]);

    const fetchEngagement = async () => {
        try {
            const response = await api.get(`/engagement/${complaintId}`);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching engagement:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkLikeStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // In a real app, backend should return user_has_liked
                // but for now we just show false or store locally if needed
                setHasLiked(false);
            }
        } catch (error) {
            console.error('Error checking like status:', error);
        }
    };

    const handleLike = async () => {
        try {
            const response = await api.post(`/engagement/${complaintId}/like`);
            setHasLiked(response.data.liked);
            fetchEngagement();
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await api.post(`/engagement/${complaintId}/comment`, {
                comment: newComment
            });
            setNewComment('');
            fetchEngagement();
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ height: '32px', width: '64px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-md)' }}></div>
                <div style={{ height: '32px', width: '64px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-md)' }}></div>
            </div>
        );
    }

    return (
        <div style={{ borderTop: '1px solid var(--neutral-200)', paddingTop: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <button
                    onClick={handleLike}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                        transition: 'all 0.2s',
                        background: hasLiked ? 'var(--danger-bg)' : 'var(--neutral-100)',
                        color: hasLiked ? 'var(--danger-text)' : 'var(--neutral-700)',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500
                    }}
                >
                    <FiHeart fill={hasLiked ? 'currentColor' : 'none'} size={18} />
                    <span>{stats.like_count}</span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                        background: 'var(--neutral-100)',
                        color: 'var(--neutral-700)',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                >
                    <FiMessageSquare size={18} />
                    <span>{stats.comment_count}</span>
                </button>
            </div>

            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem', maxHeight: '16rem', overflowY: 'auto' }}>
                            {stats.comments.map((comment, idx) => (
                                <div key={idx} style={{ background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--neutral-800)', marginBottom: '0.25rem' }}>{comment.comment_text}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                style={{
                                    flex: 1,
                                    padding: '0.5rem 0.75rem',
                                    border: '1px solid var(--neutral-300)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    background: 'white',
                                    color: 'var(--neutral-900)'
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'var(--primary-600)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <FiSend />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EngagementWidget;
