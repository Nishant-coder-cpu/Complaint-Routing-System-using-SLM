import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiDatabase, FiCalendar, FiCheck, FiCpu } from 'react-icons/fi';
import api from '../../lib/api';

export default function TrainingDataModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false);
    const [format, setFormat] = useState('json');
    const [dateRange, setDateRange] = useState('all');
    const [downloaded, setDownloaded] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/export', {
                params: { format, range: dateRange },
                responseType: format === 'csv' ? 'blob' : 'json'
            });

            const blob = format === 'csv'
                ? response.data
                : new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resolveai_export_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setDownloaded(true);
            setTimeout(() => {
                onClose();
                setDownloaded(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 1000
                        }}
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="glass-card"
                        style={{
                            position: 'fixed',
                            top: '15%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100%',
                            maxWidth: '500px',
                            zIndex: 1001,
                            padding: '2rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '12px', color: 'var(--primary-400)' }}>
                                    <FiDatabase size={24} />
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'white' }}>Export Data</h2>
                            </div>
                            <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--color-text-muted)' }}>
                                <FiX size={24} />
                            </button>
                        </div>

                        {!downloaded ? (
                            <>
                                <div style={{ marginBottom: '2rem' }}>
                                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                        Download anonymized complaint data to retrain the AI model or for offline analysis.
                                    </p>

                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FiCalendar /> Date Range
                                        </label>
                                        <select
                                            className="form-control"
                                            value={dateRange}
                                            onChange={(e) => setDateRange(e.target.value)}
                                            style={{ background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}
                                        >
                                            <option value="all" style={{ background: '#1f2937', color: 'white' }}>All Time</option>
                                            <option value="30d" style={{ background: '#1f2937', color: 'white' }}>Last 30 Days</option>
                                            <option value="90d" style={{ background: '#1f2937', color: 'white' }}>Last Quarter</option>
                                            <option value="1y" style={{ background: '#1f2937', color: 'white' }}>Last Year</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Format</label>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button
                                                className={`btn ${format === 'json' ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => setFormat('json')}
                                                style={{ flex: 1, justifyContent: 'center' }}
                                            >
                                                JSON
                                            </button>
                                            <button
                                                className={`btn ${format === 'csv' ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => setFormat('csv')}
                                                style={{ flex: 1, justifyContent: 'center' }}
                                            >
                                                CSV
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '1rem' }}>
                                    <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="btn btn-primary"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '0.5rem' }}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>Processing...</>
                                        ) : (
                                            <><FiDownload /> Download Data</>
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ textAlign: 'center', padding: '2rem 0' }}
                            >
                                <div style={{
                                    width: '80px', height: '80px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                    color: '#10B981'
                                }}>
                                    <FiCheck size={40} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem' }}>Export Complete</h3>
                                <p style={{ color: 'var(--color-text-muted)' }}>
                                    Your data has been downloaded successfully.
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
