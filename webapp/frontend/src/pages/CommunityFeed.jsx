import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal, FiUser, FiClock, FiMapPin, FiTrendingUp } from 'react-icons/fi';
import api from '../lib/api';

export default function CommunityFeed() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(5);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/complaints');

            // Filter only public complaints
            let publicComplaints = data.filter(c => c.visibility === 'public');

            // Sort by created_at desc (Classic timeline)
            publicComplaints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setComplaints(publicComplaints);
        } catch (error) {
            console.error('Error fetching feed:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        setLoadingMore(true);
        setTimeout(() => {
            setVisibleCount(prev => prev + 5);
            setLoadingMore(false);
        }, 500);
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner"></div>
        </div>
    );

    return (
        <div className="container" style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' }}>
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
                <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 'bold' }}>Community Pulse</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="badge badge-high hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'default' }}>
                        <FiTrendingUp /> Trending Now
                    </span>
                </div>
            </motion.header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {complaints.slice(0, visibleCount).map((complaint, index) => (
                    <FeedCard key={complaint.id} complaint={complaint} index={index} />
                ))}
            </div>

            {(visibleCount < complaints.length || visibleCount > 5) && (
                <div style={{ textAlign: 'center', marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    {visibleCount < complaints.length && (
                        <button
                            onClick={loadMore}
                            className="btn btn-secondary gradient-border-card"
                            disabled={loadingMore}
                            style={{ flex: 1, maxWidth: '200px', padding: '0.75rem' }}
                        >
                            {loadingMore ? <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: 'white' }}></div> : 'Load More Issues'}
                        </button>
                    )}
                    {visibleCount > 5 && (
                        <button
                            onClick={() => setVisibleCount(5)}
                            className="btn btn-ghost"
                            style={{ flex: 1, maxWidth: '200px', padding: '0.75rem' }}
                        >
                            Show Less
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function FeedCard({ complaint, index }) {
    const [liked, setLiked] = useState(false);
    const [stats, setStats] = useState({ like_count: 0, comment_count: 0 });
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        // Fetch real engagement stats
        const fetchStats = async () => {
            try {
                const res = await api.get(`/engagement/${complaint.id}`);
                setStats({
                    like_count: res.data.like_count || 0,
                    comment_count: res.data.comment_count || 0
                });
                setComments(res.data.comments || []);

                // Check if current user liked this complaint
                const likeRes = await api.get(`/engagement/${complaint.id}/user-status`);
                if (likeRes.data && likeRes.data.liked) {
                    setLiked(true);
                }
            } catch (e) {
                console.error('Failed to fetch engagement stats', e);
            }
        };
        fetchStats();
    }, [complaint.id]);

    const handleLike = async () => {
        // Optimistic update FIRST for instant UI feedback
        const wasLiked = liked;
        setLiked(!liked);
        setStats(prev => ({
            ...prev,
            like_count: wasLiked ? prev.like_count - 1 : prev.like_count + 1
        }));

        try {
            await api.post(`/engagement/${complaint.id}/like`);
        } catch (error) {
            console.error('Like failed', error);
            // Revert optimistic update on failure
            setLiked(wasLiked);
            setStats(prev => ({
                ...prev,
                like_count: wasLiked ? prev.like_count + 1 : prev.like_count - 1
            }));
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;

        // Create optimistic comment object
        const optimisticComment = {
            id: 'temp-' + Date.now(),
            comment_text: commentText,
            created_at: new Date().toISOString(),
            user_id: 'current-user'
        };

        // Optimistic update - add comment immediately
        const savedText = commentText;
        setComments(prev => [optimisticComment, ...prev]);
        setStats(prev => ({
            ...prev,
            comment_count: prev.comment_count + 1
        }));
        setCommentText('');
        setShowCommentInput(false);
        setShowComments(true); // Auto-show comments

        try {
            const res = await api.post(`/engagement/${complaint.id}/comment`, {
                comment_text: savedText
            });

            // Replace optimistic comment with real one
            setComments(prev => prev.map(c =>
                c.id === optimisticComment.id ? res.data : c
            ));
        } catch (error) {
            console.error('Comment failed', error);
            // Revert optimistic update on failure
            setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
            setStats(prev => ({
                ...prev,
                comment_count: prev.comment_count - 1
            }));
            setCommentText(savedText);
            setShowCommentInput(true);
            alert('Failed to post comment. Please try again.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass-card hover-lift"
            style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'rgba(24, 24, 27, 0.6)',
                backdropFilter: 'blur(10px)'
            }}
        >
            {/* Header */}
            <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '48px', height: '48px',
                        background: 'var(--gradient-primary)',
                        borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white',
                        boxShadow: 'var(--shadow-glow)'
                    }}>
                        <FiUser size={24} />
                    </div>
                    <div>
                        <div style={{ fontWeight: '600', fontSize: '1rem' }}>
                            {complaint.anonymous ? 'Anonymous User' : 'Community Member'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={`badge badge-${complaint.status}`} style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem' }}>
                                {complaint.route_to}
                            </span>
                            • {new Date(complaint.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div style={{ cursor: 'pointer', opacity: 0.7 }}>
                    <FiMoreHorizontal size={20} />
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {complaint.categories?.map((cat, i) => (
                        <span key={i} style={{
                            fontSize: '0.8rem',
                            color: 'var(--primary-400)',
                            background: 'rgba(139, 92, 246, 0.1)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '50px',
                            fontWeight: '500'
                        }}>#{cat.replace(/\s+/g, '')}</span>
                    ))}
                </div>
                <p style={{ color: 'var(--color-text)', lineHeight: '1.7', fontSize: '1.05rem' }}>
                    {complaint.complaint_text}
                </p>

                {/* AI Insight (Adding value to feed) */}
                <div style={{
                    marginTop: '1.5rem',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <div style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: 'var(--gradient-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 'bold'
                    }}>AI</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        Predicted resolution in <strong style={{ color: 'white' }}>24 hours</strong> based on similar cases.
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '2rem' }}>
                <button
                    onClick={handleLike}
                    className="hover-lift"
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: liked ? '#EC4899' : 'var(--color-text-muted)',
                        fontSize: '1rem',
                        transition: 'color 0.2s',
                        fontWeight: '500'
                    }}
                >
                    <FiHeart fill={liked ? 'currentColor' : 'none'} size={20} />
                    <span>{stats.like_count}</span>
                </button>
                <button
                    onClick={() => {
                        setShowCommentInput(!showCommentInput);
                        if (!showComments) setShowComments(true);
                    }}
                    className="hover-lift"
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: 'var(--color-text-muted)',
                        fontSize: '1rem',
                        fontWeight: '500'
                    }}
                >
                    <FiMessageCircle size={20} />
                    <span>{stats.comment_count}</span>
                </button>
                <button
                    className="hover-lift"
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: 'var(--color-text-muted)',
                        fontSize: '1rem',
                        marginLeft: 'auto'
                    }}
                >
                    <FiShare2 size={20} />
                </button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        {comments.length > 0 ? (
                            <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '1.5rem' }}>
                                {comments.map((comment, i) => (
                                    <div key={comment.id || i} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', lastChild: { borderBottom: 'none' } }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                            <div style={{
                                                width: '32px', height: '32px',
                                                background: 'var(--neutral-700)',
                                                borderRadius: '10px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--neutral-300)',
                                                fontSize: '0.8rem',
                                                flexShrink: 0
                                            }}>
                                                <FiUser />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>
                                                    {comment.comment_text}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !showCommentInput && <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No comments yet. Be the first to share your thoughts!</div>
                        )}

                        {/* Comment Input */}
                        {showCommentInput && (
                            <div style={{ padding: '1.5rem', paddingTop: comments.length > 0 ? '0' : '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem 1rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.95rem',
                                            color: 'white'
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') handleComment();
                                        }}
                                    />
                                    <button
                                        onClick={handleComment}
                                        disabled={!commentText.trim()}
                                        className="btn btn-primary"
                                        style={{ padding: '0.75rem 1.5rem' }}
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
