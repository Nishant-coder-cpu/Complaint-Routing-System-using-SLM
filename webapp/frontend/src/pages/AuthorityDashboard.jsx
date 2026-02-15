import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBriefcase, FiClock, FiCheckCircle, FiAlertTriangle, FiFilter, FiSearch, FiMoreHorizontal, FiX, FiCheckSquare } from 'react-icons/fi';
import api from '../lib/api';

export default function AuthorityDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [filter, setFilter] = useState('all'); // all, active, critical

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const { data } = await api.get('/complaints/department');
            // Sort by severity (Critical first)
            const severityOrder = { Critical: 0, High: 1, Normal: 2 };
            const sorted = data.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
            setComplaints(sorted);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        setUpdating(true);

        try {
            await api.patch(`/complaints/${selectedComplaint.id}/status`, {
                status: newStatus,
                resolution_notes: resolutionNotes
            });

            alert('Case updated successfully');
            setSelectedComplaint(null);
            setNewStatus('');
            setResolutionNotes('');
            fetchComplaints();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this case? This action cannot be undone.')) return;
        setUpdating(true);
        try {
            await api.delete(`/complaints/${selectedComplaint.id}`);
            alert('Case deleted successfully');
            setSelectedComplaint(null);
            fetchComplaints();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to delete case');
        } finally {
            setUpdating(false);
        }
    };

    const getSLAStatus = (deadline, status) => {
        if (status === 'resolved') return { text: 'Resolved', className: 'badge badge-resolved' };

        const now = new Date();
        const slaDate = new Date(deadline);
        const hoursLeft = (slaDate - now) / (1000 * 60 * 60);

        if (hoursLeft < 0) return { text: 'Overdue', className: 'badge badge-critical' };
        if (hoursLeft < 24) return { text: `${Math.floor(hoursLeft)}h left`, className: 'badge badge-high' };
        return { text: `${Math.floor(hoursLeft)}h left`, className: 'badge badge-normal' };
    };

    const filteredComplaints = complaints.filter(c => {
        if (filter === 'active') return c.status !== 'resolved';
        if (filter === 'critical') return c.severity === 'Critical' && c.status !== 'resolved';
        return true;
    });

    const stats = {
        total: complaints.length,
        active: complaints.filter(c => c.status !== 'resolved').length,
        critical: complaints.filter(c => c.severity === 'Critical' && c.status !== 'resolved').length,
        overdue: complaints.filter(c => c.status !== 'resolved' && new Date(c.sla_deadline) < new Date()).length
    };

    if (loading) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            Loading case data...
        </div>
    );

    return (
        <div className="container" style={{ padding: '2rem 1rem', position: 'relative' }}>
            {/* Header & Metrics */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'inline-block' }}>Case Management</h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Overview of assigned grievances and their resolution status.</p>
                    </div>
                    <button onClick={fetchComplaints} className="btn btn-secondary glass-card" style={{ backdropFilter: 'blur(5px)' }}>
                        Refresh Data
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <MetricCard
                        title="Active Cases"
                        value={stats.active}
                        icon={<FiBriefcase size={24} />}
                        color="var(--primary-400)"
                        bg="rgba(139, 92, 246, 0.1)"
                        delay={0.1}
                    />
                    <MetricCard
                        title="Critical"
                        value={stats.critical}
                        icon={<FiAlertTriangle size={24} />}
                        color="#DC2626"
                        bg="rgba(220, 38, 38, 0.1)"
                        delay={0.2}
                        onClick={() => setFilter('critical')}
                        isClickable={true}
                    />
                    <MetricCard
                        title="Overdue"
                        value={stats.overdue}
                        icon={<FiClock size={24} />}
                        color="#EA580C"
                        bg="rgba(234, 88, 12, 0.1)"
                        delay={0.3}
                    />
                    <MetricCard
                        title="Total Processed"
                        value={stats.total}
                        icon={<FiCheckCircle size={24} />}
                        color="#10B981"
                        bg="rgba(16, 185, 129, 0.1)"
                        delay={0.4}
                    />
                </div>
            </motion.div>

            {/* List View */}
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ padding: 0, overflow: 'hidden', minHeight: '400px' }}
            >
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <FiFilter color="var(--color-text-muted)" />
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                        onClick={() => setFilter('all')}
                    >All</button>
                    <button
                        className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                        onClick={() => setFilter('active')}
                    >Active</button>
                    <button
                        className={`btn ${filter === 'critical' ? 'btn-danger' : 'btn-ghost'}`}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                        onClick={() => setFilter('critical')}
                    >Critical</button>

                    <div style={{ marginLeft: 'auto', position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search cases..."
                            style={{
                                paddingLeft: '2.25rem',
                                height: '36px',
                                fontSize: '0.875rem',
                                width: '240px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '6px',
                                color: 'white'
                            }}
                        />
                    </div>
                </div>

                {filteredComplaints.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <p>No cases match your filters.</p>
                    </div>
                ) : (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {filteredComplaints.map((complaint, index) => {
                            const sla = getSLAStatus(complaint.sla_deadline, complaint.status);
                            const isSelected = selectedComplaint?.id === complaint.id;
                            return (
                                <motion.div
                                    key={complaint.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => {
                                        setSelectedComplaint(complaint);
                                        setNewStatus(complaint.status);
                                        setResolutionNotes(complaint.resolution_notes || '');
                                    }}
                                    style={{
                                        padding: '1rem 1.5rem',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                        borderLeft: isSelected ? '4px solid var(--primary-500)' : '4px solid transparent',
                                        display: 'grid', gridTemplateColumns: '80px 100px 1fr 120px 120px', gap: '1rem', alignItems: 'center'
                                    }}
                                    className="hover-lift-sm"
                                >
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                        #{complaint.id.substring(0, 6)}
                                    </div>
                                    <div>
                                        <span className={`badge badge-${complaint.severity.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                                            {complaint.severity}
                                        </span>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '500', color: 'white', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                                            {complaint.complaint_text ? (
                                                complaint.complaint_text.substring(0, 60) + (complaint.complaint_text.length > 60 ? '...' : '')
                                            ) : (
                                                <em style={{ color: 'var(--color-text-muted)' }}>Redacted (Anonymous)</em>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            {complaint.categories?.join(', ')} • {new Date(complaint.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`badge badge-${complaint.status}`}>
                                            {complaint.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={sla.className} style={{ fontSize: '0.7rem' }}>
                                            {sla.text}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* Side Panel for Case Details - Premium Drawer */}
            <AnimatePresence>
                {selectedComplaint && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 40 }}
                            onClick={() => setSelectedComplaint(null)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            style={{
                                position: 'fixed', top: 0, right: 0, bottom: 0, width: '500px', maxWidth: '100vw',
                                background: 'var(--surface-dark)', borderLeft: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', flexDirection: 'column'
                            }}
                        >
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'white' }}>Case Details</h2>
                                    <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>#{selectedComplaint.id}</span>
                                </div>
                                <button onClick={() => setSelectedComplaint(null)} className="btn btn-ghost" style={{ padding: '0.5rem', color: 'white' }}>
                                    <FiX size={24} />
                                </button>
                            </div>

                            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                                {/* Metadata - Glass Card within Drawer */}
                                <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs text-muted uppercase font-bold" style={{ color: 'var(--primary-300)' }}>Severity</label>
                                            <div className={`badge badge-${selectedComplaint.severity.toLowerCase()}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>{selectedComplaint.severity}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted uppercase font-bold" style={{ color: 'var(--primary-300)' }}>Reporter</label>
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'white' }}>
                                                {selectedComplaint.anonymous ? '🔒 Anonymous' : '👤 Verified User'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted uppercase font-bold" style={{ color: 'var(--primary-300)' }}>Category</label>
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'white' }}>{selectedComplaint.categories?.join(', ')}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted uppercase font-bold" style={{ color: 'var(--primary-300)' }}>Deadline</label>
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--danger-text)', fontWeight: 'bold' }}>
                                                {new Date(selectedComplaint.sla_deadline).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Complaint Text */}
                                <div style={{ marginBottom: '2.5rem' }}>
                                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Full Grievance Report</h3>
                                    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '1rem', lineHeight: '1.7', color: 'var(--color-text)' }}>
                                        {selectedComplaint.complaint_text || <em style={{ color: 'var(--color-text-muted)' }}>Content hidden due to anonymity settings.</em>}
                                    </div>
                                </div>

                                {/* Status Update Form */}
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FiCheckSquare color="var(--primary-400)" /> Resolution Actions
                                    </h3>
                                    <form onSubmit={handleUpdateStatus}>
                                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                            <label className="form-label">Update Status</label>
                                            <select
                                                className="form-control"
                                                value={newStatus}
                                                onChange={(e) => setNewStatus(e.target.value)}
                                                required
                                                style={{ background: 'rgba(0,0,0,0.4)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}
                                            >
                                                <option value="pending">Pending Review</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Resolution Notes</label>
                                            <textarea
                                                className="form-control"
                                                rows="5"
                                                value={resolutionNotes}
                                                onChange={(e) => setResolutionNotes(e.target.value)}
                                                placeholder="Document actions taken, meetings held, or final resolution details..."
                                                style={{ fontSize: '0.95rem', background: 'rgba(0,0,0,0.4)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                            <button type="button" className="btn btn-secondary" style={{ padding: '0.75rem', borderColor: 'var(--danger-text)', color: 'var(--danger-text)' }} onClick={handleDelete} disabled={updating}>
                                                Delete Case
                                            </button>
                                            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }} disabled={updating}>
                                                {updating ? 'Saving...' : 'Save & Update Case'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}


function MetricCard({ title, value, icon, color, bg, delay, onClick, isClickable }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay }}
            className={`glass-card ${isClickable ? 'hover-lift' : ''}`}
            onClick={onClick}
            style={{
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                cursor: isClickable ? 'pointer' : 'default'
            }}
        >
            <div style={{
                padding: '0.85rem',
                background: bg,
                borderRadius: '12px',
                color: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', lineHeight: 1.2 }}>{value}</div>
            </div>
        </motion.div>
    );
}
