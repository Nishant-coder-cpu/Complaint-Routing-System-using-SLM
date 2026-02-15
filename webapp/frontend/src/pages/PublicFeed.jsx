import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGlobe, FiFilter, FiTrendingUp, FiMapPin, FiClock, FiMessageSquare, FiActivity } from 'react-icons/fi';
import api from '../lib/api';
import EngagementWidget from '../components/EngagementWidget';

export default function PublicFeed() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, high, normal, low

    useEffect(() => {
        fetchPublicComplaints();
    }, [filter]);

    const fetchPublicComplaints = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/complaints');

            // Filter public complaints only
            let filtered = data.filter(c => c.visibility === 'public');

            // Apply severity filter
            if (filter !== 'all') {
                filtered = filtered.filter(c => c.severity.toLowerCase() === filter);
            }

            // Sort by engagement score (desc) then created_at (desc)
            filtered.sort((a, b) => {
                const scoreA = a.engagement_score || 0;
                const scoreB = b.engagement_score || 0;
                if (scoreB !== scoreA) return scoreB - scoreA;
                return new Date(b.created_at) - new Date(a.created_at);
            });

            setComplaints(filtered);
        } catch (error) {
            console.error('Error fetching public feed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            {/* Background Decoration */}
            <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }}></div>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '3rem', textAlign: 'center' }}
            >
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    <FiGlobe /> Public Grievance Feed
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Community-driven transparency. Engaging with issues helps prioritize resolution and keeps authorities accountable.
                </p>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '3rem', flexWrap: 'wrap' }}
            >
                {['all', 'high', 'normal', 'low'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`btn ${filter === f ? 'btn-primary glass-card' : 'btn-ghost glass-card'}`}
                        style={{
                            textTransform: 'capitalize',
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            border: filter === f ? '1px solid var(--primary-500)' : '1px solid rgba(255,255,255,0.1)',
                            background: filter === f ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                        }}
                    >
                        {f}
                    </button>
                ))}
            </motion.div>

            {/* Loading State */}
            {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                    Loading community feed...
                </div>
            ) : complaints.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <p style={{ fontSize: '1.2rem' }}>No public complaints found matching your filters.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {complaints.map((complaint, idx) => (
                        <motion.div
                            key={complaint.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="gradient-border-card"
                            style={{ padding: '2rem', position: 'relative' }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span className={`badge badge-${complaint.severity.toLowerCase()}`}>
                                        {complaint.severity}
                                    </span>
                                    {complaint.engagement_score > 0.5 && (
                                        <span className="badge badge-high" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255, 107, 107, 0.2)', color: '#FF6B6B', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                                            <FiTrendingUp /> Trending
                                        </span>
                                    )}
                                </div>
                                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FiActivity color="var(--primary-400)" /> {new Date(complaint.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Categories */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                                {complaint.categories?.map((cat, i) => (
                                    <span key={i} style={{
                                        fontSize: '0.75rem',
                                        padding: '0.3rem 0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'var(--color-text-muted)',
                                        borderRadius: '20px',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        #{cat}
                                    </span>
                                ))}
                            </div>

                            {/* Complaint Text */}
                            <p style={{ color: 'var(--color-text)', lineHeight: '1.7', marginBottom: '1.75rem', fontSize: '1.1rem' }}>
                                "{complaint.complaint_text}"
                            </p>

                            {/* Meta Info */}
                            <div style={{
                                display: 'flex',
                                gap: '1.5rem',
                                fontSize: '0.9rem',
                                color: 'var(--color-text-muted)',
                                paddingBottom: '1.25rem',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                marginBottom: '1.25rem'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <FiMapPin color="var(--primary-400)" /> {complaint.route_to}
                                </span>
                                {complaint.predicted_resolution_days && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <FiClock color="var(--secondary-400)" /> Est. {complaint.predicted_resolution_days} days to resolve
                                    </span>
                                )}
                            </div>

                            {/* Engagement Widget */}
                            <EngagementWidget complaintId={complaint.id} />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
