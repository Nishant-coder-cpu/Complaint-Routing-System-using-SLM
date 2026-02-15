import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiUsers, FiCpu, FiAlertOctagon, FiDownload, FiSearch, FiTrendingUp, FiSettings, FiUserCheck } from 'react-icons/fi';
import api from '../lib/api';
import SeverityChart from '../components/charts/SeverityChart';
import DepartmentChart from '../components/charts/DepartmentChart';
import ArchiveModal from '../components/modals/ArchiveModal';
import UserManagementModal from '../components/modals/UserManagementModal';
import TrainingDataModal from '../components/modals/TrainingDataModal';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showTrainingModal, setShowTrainingModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            Initializing command center...
        </div>
    );

    // Calculate derived metrics
    const total = stats?.total_complaints || 0;
    const resolved = stats?.resolved_complaints || 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const critical = stats?.severity_breakdown?.Critical || 0;
    const breaches = stats?.sla_breach_count || 0;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}
            >
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'inline-block' }}>Command Center</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Real-time monitoring of grievance resolution performance.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>

                </div>
            </motion.div>

            {/* AI Insights Panel */}
            <motion.div
                className="gradient-border-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ padding: '2rem', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}
            >
                {/* Background glow for effect */}
                <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)'
                    }}>
                        <FiCpu size={32} color="var(--primary-400)" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'white' }}>AI System Insights</h3>
                        <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: '1.7', maxWidth: '800px', fontSize: '1.05rem' }}>
                            Complaint volume is <strong style={{ color: 'var(--success-text)' }}>stable</strong>. The 'Harassment' category has seen a slight increase (+5%) this week.
                            AI routing confidence remains high (92%). {breaches > 0 ? <span style={{ color: 'var(--danger-text)', fontWeight: 'bold' }}>{breaches} SLA breaches detected</span> : <span style={{ color: 'var(--success-text)' }}>All cases are within SLA limits.</span>}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6" style={{ marginBottom: '3rem' }}>
                <MetricCard
                    title="Total Volume"
                    value={total}
                    icon={<FiUsers size={24} color="var(--primary-400)" />}
                    trend="+12% vs last month"
                    trendColor="var(--success-text)"
                    delay={0.1}
                />
                <MetricCard
                    title="Resolution Rate"
                    value={`${resolutionRate}%`}
                    icon={<FiActivity size={24} color="#10B981" />}
                    progress={resolutionRate}
                    progressColor="#10B981"
                    delay={0.2}
                />
                <MetricCard
                    title="Critical Risks"
                    value={critical}
                    icon={<FiAlertOctagon size={24} color="#EF4444" />}
                    subtext="Cases marked as high severity"
                    delay={0.3}
                />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card hover-lift"
                    style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '1rem' }}
                    onClick={() => setShowTrainingModal(true)}
                >
                    <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%' }}>
                        <FiDownload size={24} color="var(--primary-400)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: 'white' }}>Export System Data</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>For offline analysis</div>
                    </div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" style={{ marginBottom: '3rem' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card"
                    style={{ padding: '2rem' }}
                >
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>Severity Distribution</h3>
                    <div style={{ height: '300px', overflow: 'hidden' }}>
                        <SeverityChart data={stats?.severity_breakdown || {}} />
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card"
                    style={{ padding: '2rem' }}
                >
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>Department Load</h3>
                    <div style={{ height: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        <DepartmentChart data={stats?.department_breakdown || {}} />
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Complaints List - Takes up 2/3 */}
                <div className="lg:col-span-2">
                    <RecentComplaintsList />
                </div>

                {/* Admin Tools - Takes up 1/3 */}
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-card"
                        style={{ padding: '2rem', height: '100%' }}
                    >
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FiSettings /> Admin Tools
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button className="btn btn-secondary" onClick={() => setShowArchiveModal(true)} style={{ justifyContent: 'flex-start', padding: '1rem' }}>
                                <FiSearch style={{ marginRight: '0.75rem' }} size={18} /> Search Archives
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowUserModal(true)} style={{ justifyContent: 'flex-start', padding: '1rem' }}>
                                <FiUserCheck style={{ marginRight: '0.75rem' }} size={18} /> Manage User Roles
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modals */}
            <ArchiveModal isOpen={showArchiveModal} onClose={() => setShowArchiveModal(false)} />
            <UserManagementModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />
            {showTrainingModal && <TrainingDataModal isOpen={showTrainingModal} onClose={() => setShowTrainingModal(false)} />}
        </div>
    );
}

function MetricCard({ title, value, icon, trend, trendColor, progress, progressColor, subtext, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay }}
            className="glass-card hover-lift"
            style={{ padding: '1.5rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
                    <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginTop: '0.5rem' }}>{value}</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {icon}
                </div>
            </div>
            {trend && (
                <div style={{ fontSize: '0.875rem', color: trendColor, display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}>
                    <FiTrendingUp /> {trend}
                </div>
            )}
            {progress !== undefined && (
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: delay + 0.2 }}
                        style={{ height: '100%', background: progressColor, borderRadius: '3px' }}
                    ></motion.div>
                </div>
            )}
            {subtext && (
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {subtext}
                </div>
            )}
        </motion.div>
    );
}


function RecentComplaintsList() {
    const [complaints, setComplaints] = useState([]);
    const [visibleCount, setVisibleCount] = useState(5);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchList = async () => {
            try {
                const { data } = await api.get('/admin/complaints');
                setComplaints(data || []);
            } catch (e) {
                console.error('Failed to fetch complaints list', e);
            } finally {
                setLoading(false);
            }
        };
        fetchList();
    }, []);

    const showMore = () => setVisibleCount(prev => prev + 5);
    const showLess = () => setVisibleCount(5);

    if (loading) return <div>Loading list...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card"
            style={{ marginBottom: '0', padding: '2rem' }}
        >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Recently Reported
                <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>Live Feed</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {complaints.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No recent complaints found.</div>
                ) : (
                    complaints.slice(0, visibleCount).map((c, i) => (
                        <div key={c.id} className="hover-lift-sm" style={{
                            padding: '1rem',
                            borderBottom: i === visibleCount - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'background 0.2s',
                            borderRadius: '8px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: c.priority === 'High' ? 'var(--danger-text)' : 'var(--primary-400)'
                                }}></div>
                                <div>
                                    <div style={{ fontWeight: '500', color: 'white', fontSize: '0.95rem' }}>{c.categories?.[0] || 'Grievance'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                        ID: {c.id.substring(0, 8)}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span className={`badge badge-${c.status}`} style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'inline-block' }}>{c.status}</span>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date(c.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {complaints.length > 5 && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    {visibleCount < complaints.length && (
                        <button
                            onClick={showMore}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1.5rem' }}
                        >
                            View More
                        </button>
                    )}
                    {visibleCount > 5 && (
                        <button
                            onClick={showLess}
                            className="btn btn-ghost"
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1.5rem' }}
                        >
                            Show Less
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
}
