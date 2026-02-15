import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch, FiFilter, FiDownload, FiCalendar } from 'react-icons/fi';
import api from '../../lib/api';

export default function ArchiveModal({ isOpen, onClose }) {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        severity: '',
        department: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchArchived();
        }
    }, [isOpen, filters]);

    const fetchArchived = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const { data } = await api.get(`/admin/complaints/archived?${params.toString()}`);
            setComplaints(data || []);
        } catch (error) {
            console.error('Error fetching archived complaints:', error);
            alert('Failed to load archived complaints');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    };

    const handleExport = () => {
        const csv = [
            ['ID', 'Text', 'Severity', 'Department', 'Resolved Date'],
            ...complaints.map(c => [
                c.id,
                `"${c.complaint_text.replace(/"/g, '""')}"`,
                c.severity,
                c.route_to,
                new Date(c.updated_at).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `archived_complaints_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }} onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        borderRadius: 'var(--radius-lg)',
                        maxWidth: '900px', width: '90%', maxHeight: '85vh',
                        display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-2xl)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: 0 // Reset padding as we handle it internally
                    }}
                >
                    {/* Header */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Archived Complaints</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)' }} className="hover:text-white">
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Filters */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div style={{ position: 'relative' }}>
                                <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
                                <input
                                    type="text"
                                    placeholder="Search by text or ID..."
                                    value={filters.search}
                                    onChange={handleSearch}
                                    style={{
                                        paddingLeft: '2.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white'
                                    }}
                                />
                            </div>
                            <select
                                value={filters.severity}
                                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            >
                                <option value="" style={{ color: 'black' }}>All Severities</option>
                                <option value="Critical" style={{ color: 'black' }}>Critical</option>
                                <option value="High" style={{ color: 'black' }}>High</option>
                                <option value="Normal" style={{ color: 'black' }}>Normal</option>
                            </select>
                            <select
                                value={filters.department}
                                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            >
                                <option value="" style={{ color: 'black' }}>All Departments</option>
                                <option value="Infrastructure" style={{ color: 'black' }}>Infrastructure</option>
                                <option value="Student Affairs" style={{ color: 'black' }}>Student Affairs</option>
                                <option value="IT Support" style={{ color: 'black' }}>IT Support</option>
                                <option value="Security" style={{ color: 'black' }}>Security</option>
                                <option value="Transport" style={{ color: 'black' }}>Transport</option>
                            </select>
                            <button className="btn btn-primary" onClick={handleExport}>
                                <FiDownload style={{ marginRight: '0.5rem' }} /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-400)' }}>
                                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                                Loading archives...
                            </div>
                        ) : complaints.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-400)' }}>
                                <FiFilter size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>No archived complaints found matching your filters.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {complaints.map((complaint) => (
                                    <div key={complaint.id} className="card hover-lift" style={{
                                        padding: '1.25rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <div>
                                                <span className={`badge badge-${complaint.severity.toLowerCase()}`}>{complaint.severity}</span>
                                                <span style={{ marginLeft: '0.75rem', fontSize: '0.85rem', color: 'var(--neutral-400)' }}>
                                                    {complaint.route_to}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--neutral-400)' }}>
                                                Resolved: {new Date(complaint.updated_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--neutral-200)', lineHeight: '1.6', margin: '0.5rem 0' }}>
                                            {complaint.complaint_text}
                                        </p>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', marginTop: '0.5rem', fontFamily: 'monospace' }}>
                                            ID: {complaint.id}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
