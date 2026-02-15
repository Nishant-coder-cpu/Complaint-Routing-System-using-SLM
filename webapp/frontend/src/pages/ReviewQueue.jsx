import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiEdit2, FiAlertTriangle, FiCheckCircle, FiCpu, FiAlertOctagon } from 'react-icons/fi';
import api from '../lib/api';

const ReviewQueue = () => {
    const [pendingComplaints, setPendingComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    useEffect(() => {
        fetchPendingReview();
    }, []);

    const fetchPendingReview = async () => {
        try {
            const response = await api.get('/admin/pending-review');
            setPendingComplaints(response.data);
        } catch (error) {
            console.error('Error fetching pending review:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async (complaintId, validated) => {
        try {
            await api.post(`/feedback/complaints/${complaintId}/validate-ai`, {
                confirmed: validated
            });
            // Refresh list
            fetchPendingReview();
            setSelectedComplaint(null);
        } catch (error) {
            console.error('Error validating complaint:', error);
        }
    };

    const getConfidenceColor = (score) => {
        if (score >= 0.85) return 'var(--success-text)';
        if (score >= 0.70) return 'var(--warning-text)';
        return 'var(--danger-text)';
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--color-text-muted)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '3rem', textAlign: 'center' }}
            >
                <div style={{
                    width: '64px', height: '64px', margin: '0 auto 1.5rem',
                    background: 'var(--gradient-accent)', borderRadius: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'var(--shadow-glow)'
                }}>
                    <FiCpu size={32} color="white" />
                </div>
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>AI Review Queue</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    {pendingComplaints.length} complaints flagged for human review due to low AI confidence. Your inputs retain the model.
                </p>
            </motion.div>

            {pendingComplaints.length === 0 ? (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card"
                    style={{ padding: '4rem', textAlign: 'center' }}
                >
                    <div style={{ fontSize: '5rem', marginBottom: '1.5rem', color: '#10B981' }}>
                        <FiCheckCircle style={{ margin: '0 auto' }} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>All Caught Up!</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>No complaints currently require manual review.</p>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    {pendingComplaints.map((complaint, index) => {
                        const avgConfidence = (
                            (complaint.ai_confidence?.category || 0) +
                            (complaint.ai_confidence?.severity || 0) +
                            (complaint.ai_confidence?.department || 0)
                        ) / 3;

                        return (
                            <motion.div
                                key={complaint.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="gradient-border-card"
                                style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                    <div style={{ flex: 1, paddingRight: '2rem' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <span className="badge badge-neutral" style={{ fontFamily: 'monospace' }}>ID: {complaint.id.substring(0, 8)}</span>
                                            <span className={`badge badge-${complaint.severity.toLowerCase()}`}>
                                                {complaint.severity}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--color-text)', lineHeight: '1.7', fontSize: '1.1rem' }}>"{complaint.complaint_text}"</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: getConfidenceColor(avgConfidence) }}>
                                            {(avgConfidence * 100).toFixed(0)}%
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Confidence Score</div>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    marginBottom: '2rem',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '1rem', letterSpacing: '0.05em', fontWeight: '600' }}>AI Prediction Breakdown</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '4px', height: '40px', background: 'var(--primary-500)', borderRadius: '2px' }}></div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Category</div>
                                                <div style={{ color: 'white', fontWeight: '500' }}>
                                                    {complaint.categories?.[0]}
                                                    <span style={{ fontSize: '0.8rem', color: getConfidenceColor(complaint.ai_confidence?.category), marginLeft: '0.5rem' }}>
                                                        ({((complaint.ai_confidence?.category || 0) * 100).toFixed(0)}%)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '4px', height: '40px', background: 'var(--secondary-500)', borderRadius: '2px' }}></div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Severity</div>
                                                <div style={{ color: 'white', fontWeight: '500' }}>
                                                    {complaint.severity}
                                                    <span style={{ fontSize: '0.8rem', color: getConfidenceColor(complaint.ai_confidence?.severity), marginLeft: '0.5rem' }}>
                                                        ({((complaint.ai_confidence?.severity || 0) * 100).toFixed(0)}%)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '4px', height: '40px', background: 'var(--accent-500)', borderRadius: '2px' }}></div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Routing</div>
                                                <div style={{ color: 'white', fontWeight: '500' }}>
                                                    {complaint.route_to}
                                                    <span style={{ fontSize: '0.8rem', color: getConfidenceColor(complaint.ai_confidence?.department), marginLeft: '0.5rem' }}>
                                                        ({((complaint.ai_confidence?.department || 0) * 100).toFixed(0)}%)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => handleValidate(complaint.id, true)}
                                        className="btn btn-primary hover-lift"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: 'none' }}
                                    >
                                        <FiCheckCircle size={20} /> Confirm AI Prediction
                                    </button>
                                    <button
                                        onClick={() => setSelectedComplaint(complaint)}
                                        className="btn btn-secondary hover-lift"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <FiEdit2 size={20} /> Correct & Train
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Correction Modal */}
            <AnimatePresence>
                {selectedComplaint && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                backdropFilter: 'blur(8px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '1rem',
                                zIndex: 100
                            }}
                            onClick={() => setSelectedComplaint(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass-card"
                            style={{ maxWidth: '32rem', width: '100%', padding: '2rem', zIndex: 101, position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', margin: 0 }}
                        >
                            <div style={{ width: '48px', height: '48px', background: 'var(--danger-text)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'white' }}>
                                <FiAlertOctagon size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>Correct AI Prediction</h3>
                            <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                                This feature helps retrain the model. By correcting this entry, you are providing ground-truth data for future improvements.
                            </p>

                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', fontStyle: 'italic' }}>
                                    "Confirming correction implies that the AI's current classification (Category, Severity, or Routing) was inaccurate."
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => setSelectedComplaint(null)}
                                    className="btn btn-secondary"
                                    style={{ flex: 1, padding: '0.75rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleValidate(selectedComplaint.id, false)}
                                    className="btn btn-primary"
                                    style={{ flex: 1, padding: '0.75rem', background: 'var(--danger-text)', border: 'none' }}
                                >
                                    Save Correction
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReviewQueue;
