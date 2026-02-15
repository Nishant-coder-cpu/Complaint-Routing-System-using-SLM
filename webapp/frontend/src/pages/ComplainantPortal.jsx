import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../lib/api';
import ComplaintSubmissionWizard from '../components/ComplaintSubmissionWizard';
import { FiClock, FiCheckCircle, FiAlertCircle, FiMessageSquare, FiTrendingUp, FiCopy, FiActivity, FiTrash2 } from 'react-icons/fi';

export default function ComplainantPortal() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(2);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const { data } = await api.get('/complaints/my');
            if (Array.isArray(data)) {
                setComplaints(data);
            } else {
                setComplaints([]);
            }
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'var(--primary-400)';
            case 'in_progress': return '#F59E0B';
            case 'resolved': return '#10B981';
            default: return 'var(--neutral-500)';
        }
    };

    const getStatusStep = (status) => {
        switch (status) {
            case 'pending': return 33;
            case 'in_progress': return 66;
            case 'resolved': return 100;
            default: return 0;
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) return;

        try {
            await api.delete(`/complaints/${id}`);
            setComplaints(prev => prev.filter(c => c.id !== id));
            alert('Complaint deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete complaint');
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: '2.5rem' }}
            >
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'inline-block' }}>My Dashboard</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Manage your grievance reports and track their resolution status.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Submission Wizard */}
                <motion.div
                    className="md:col-span-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="glass-card" style={{ height: '100%', padding: '2rem', borderTop: '4px solid var(--primary-500)' }}>
                        <ComplaintSubmissionWizard onComplaintSubmitted={fetchComplaints} />
                    </div>
                </motion.div>

                {/* Right Column: Recent Activity / History */}
                <motion.div
                    className="md:col-span-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
                            <FiActivity size={20} color="var(--primary-400)" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Case History</h2>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                            Loading cases...
                        </div>
                    ) : complaints.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', borderStyle: 'dashed' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                                <FiMessageSquare color="var(--neutral-400)" size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No cases found</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Your submitted complaints will appear here.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {complaints.slice(0, visibleCount).map((complaint, index) => (
                                <motion.div
                                    key={complaint.id}
                                    className="card hover-lift"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    style={{
                                        padding: '1.25rem',
                                        cursor: 'pointer',
                                        background: 'rgba(24, 24, 27, 0.4)',
                                        borderLeft: `4px solid ${getStatusColor(complaint.status)}`
                                    }}
                                >

                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                        <span className={`badge badge-${complaint.status}`}>
                                            {complaint.status.replace('_', ' ')}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            {new Date(complaint.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Category & ID */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h4 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                                            {complaint.categories?.[0] || 'Uncategorized Grievance'}
                                        </h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                                ID: #{complaint.id.substring(0, 8)}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(complaint.id);
                                                }}
                                                title="Copy ID"
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '0.25rem',
                                                    color: 'var(--primary-400)',
                                                    fontSize: '0.9rem',
                                                    display: 'flex', alignItems: 'center'
                                                }}
                                            >
                                                <FiCopy />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Timeline Visual */}
                                    <div style={{ marginTop: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                                            <span>Received</span>
                                            <span>In Progress</span>
                                            <span>Resolved</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${getStatusStep(complaint.status)}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                style={{
                                                    position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: '3px',
                                                    background: complaint.status === 'resolved' ? 'var(--success-text)' : 'var(--gradient-primary)',
                                                }}
                                            ></motion.div>
                                        </div>
                                    </div>

                                    {complaint.visibility === 'public' && (
                                        <div style={{
                                            marginTop: '1rem',
                                            paddingTop: '0.75rem',
                                            borderTop: '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.8rem',
                                            color: 'var(--primary-300)',
                                            justifyContent: 'space-between'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FiTrendingUp />
                                                <span>Community Tracking active</span>
                                            </div>
                                            <button
                                                onClick={(e) => handleDelete(e, complaint.id)}
                                                className="btn btn-ghost"
                                                style={{ padding: '0.25rem 0.5rem', color: '#EF4444', fontSize: '0.8rem', display: 'flex', gap: '0.25rem' }}
                                            >
                                                <FiTrash2 /> Delete
                                            </button>
                                        </div>
                                    )}
                                    {complaint.visibility !== 'public' && (
                                        <div style={{
                                            marginTop: '1rem',
                                            paddingTop: '0.75rem',
                                            borderTop: '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end'
                                        }}>
                                            <button
                                                onClick={(e) => handleDelete(e, complaint.id)}
                                                className="btn btn-ghost"
                                                style={{ padding: '0.25rem 0.5rem', color: '#EF4444', fontSize: '0.8rem', display: 'flex', gap: '0.25rem' }}
                                            >
                                                <FiTrash2 /> Delete
                                            </button>
                                        </div>
                                    )}

                                </motion.div>
                            ))}

                            {complaints.length > 2 && (
                                <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                    {visibleCount < complaints.length && (
                                        <button
                                            onClick={() => setVisibleCount(prev => prev + 2)}
                                            className="btn btn-secondary"
                                            style={{ flex: 1, fontSize: '0.9rem' }}
                                        >
                                            View More
                                        </button>
                                    )}
                                    {visibleCount > 2 && (
                                        <button
                                            onClick={() => setVisibleCount(2)}
                                            className="btn btn-ghost"
                                            style={{ flex: 1, fontSize: '0.9rem' }}
                                        >
                                            Show Less
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
