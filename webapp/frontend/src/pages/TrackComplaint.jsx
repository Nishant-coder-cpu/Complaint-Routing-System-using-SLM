import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiAlertCircle, FiClock, FiMapPin, FiCheckCircle, FiActivity } from 'react-icons/fi';
import api from '../lib/api';

export default function TrackComplaint() {
    const [searchParams] = useSearchParams();
    const [complaintId, setComplaintId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const idFromUrl = searchParams.get('id');
        if (idFromUrl) {
            setComplaintId(idFromUrl);
            trackComplaint(idFromUrl);
        }
    }, [searchParams]);

    const trackComplaint = async (id) => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const { data } = await api.get(`/complaints/${id}`);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Complaint not found');
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        trackComplaint(complaintId);
    };

    const getSLAStatus = (deadline, status) => {
        if (status === 'resolved') return { text: 'Resolved', className: 'badge badge-resolved', icon: FiCheckCircle };

        const now = new Date();
        const slaDate = new Date(deadline);
        const hoursLeft = (slaDate - now) / (1000 * 60 * 60);

        if (hoursLeft < 0) return { text: 'Breached', className: 'badge badge-critical', icon: FiAlertCircle };
        if (hoursLeft < 24) return { text: `${Math.floor(hoursLeft)}h left`, className: 'badge badge-high', icon: FiClock };
        return { text: `${Math.floor(hoursLeft)}h left`, className: 'badge badge-normal', icon: FiClock };
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem 1rem' }}>
            <div style={{ width: '100%', maxWidth: '600px', marginTop: '3rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                >
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                        <FiSearch /> Track Status
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>Enter your Complaint ID to see real-time progress</p>
                </motion.div>

                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ marginBottom: '2rem', padding: '2rem' }}
                >
                    <form onSubmit={handleTrack} style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                        <label className="text-xs text-muted uppercase font-bold" style={{ marginLeft: '0.5rem' }}>Complaint Reference ID</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="text"
                                style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    padding: '0.85rem 1rem',
                                    color: 'white',
                                    fontSize: '1rem'
                                }}
                                value={complaintId}
                                onChange={(e) => setComplaintId(e.target.value)}
                                placeholder="e.g. 550e8400-e29b..."
                                required
                            />
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0 2rem' }}>
                                {loading ? 'Searching...' : 'Track'}
                            </button>
                        </div>
                    </form>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                color: '#EF4444',
                                marginTop: '1.5rem',
                                textAlign: 'center',
                                fontWeight: 500,
                                padding: '1rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '12px',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FiAlertCircle /> {error}
                        </motion.div>
                    )}
                </motion.div>

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="gradient-border-card"
                        style={{ padding: 0, overflow: 'hidden' }}
                    >
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'white' }}>Complaint Details</h2>
                                <div style={{ fontSize: '0.9rem', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>#{result.id.substring(0, 13)}...</div>
                            </div>
                            <span className={`badge badge-${result.status}`}>
                                {result.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div style={{ padding: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                                <div>
                                    <label className="text-xs text-muted uppercase font-bold" style={{ marginBottom: '0.5rem', display: 'block' }}>Severity</label>
                                    <span className={`badge badge-${result.severity.toLowerCase()}`}>
                                        {result.severity}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-xs text-muted uppercase font-bold" style={{ marginBottom: '0.5rem', display: 'block' }}>SLA Status</label>
                                    <span className={getSLAStatus(result.sla_deadline, result.status).className} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                        {(() => {
                                            const StatusIcon = getSLAStatus(result.sla_deadline, result.status).icon;
                                            return <StatusIcon size={14} />;
                                        })()}
                                        {getSLAStatus(result.sla_deadline, result.status).text}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-xs text-muted uppercase font-bold" style={{ marginBottom: '0.5rem', display: 'block' }}>Category</label>
                                    <div style={{ fontWeight: '500', color: 'white' }}>{result.categories?.join(', ')}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-muted uppercase font-bold" style={{ marginBottom: '0.5rem', display: 'block' }}>Routed To</label>
                                    <div style={{ fontWeight: '500', color: 'white', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <FiMapPin size={14} color="var(--primary-400)" /> {result.route_to}
                                    </div>
                                </div>
                            </div>

                            {result.resolution_notes && (
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '2rem' }}>
                                    <h4 style={{ color: '#34D399', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FiCheckCircle /> Resolution Notes
                                    </h4>
                                    <p style={{ fontSize: '1rem', color: '#D1FAE5', margin: 0, lineHeight: '1.6' }}>{result.resolution_notes}</p>
                                </div>
                            )}

                            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                Submitted on {new Date(result.created_at).toLocaleString()}
                            </div>
                        </div>
                    </motion.div>
                )}

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Link to="/login" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', background: 'transparent', border: 'none', color: 'var(--color-text-muted)' }}>
                        <FiArrowLeft /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
