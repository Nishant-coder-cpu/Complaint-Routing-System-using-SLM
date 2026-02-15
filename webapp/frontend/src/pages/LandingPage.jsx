import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiActivity, FiCpu, FiUsers } from 'react-icons/fi';

export default function LandingPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar Placeholder (Navbar is rendered by App but we need spacing) */}
            <div style={{ height: '70px' }}></div>

            {/* Hero Section */}
            <section style={{
                padding: '4rem 0',
                position: 'relative',
                overflow: 'hidden',
                flex: 1,
                display: 'flex',
                alignItems: 'center'
            }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            borderRadius: '50px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            color: '#A78BFA',
                            fontWeight: '600',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem'
                        }}>
                            ✨ AI-Powered Grievance Redressal
                        </div>
                        <h1 style={{
                            fontSize: '4rem',
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            fontWeight: 800
                        }}>
                            Resolve Issues with <br />
                            <span className="gradient-text">Lightning Speed</span>
                        </h1>
                        <p style={{
                            fontSize: '1.25rem',
                            color: 'var(--color-text-muted)',
                            marginBottom: '2.5rem',
                            maxWidth: '540px'
                        }}>
                            Smolify uses advanced AI to categorize, route, and predict resolution times for institutional grievances. Experience the future of governance.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/login" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                                Get Started <FiArrowRight style={{ marginLeft: '0.5rem' }} />
                            </Link>
                            <Link to="/track" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                                Track Complaint
                            </Link>
                        </div>

                        <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem' }}>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>92%</div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>AI Accuracy</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>24h</div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Avg. Resolution</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>5k+</div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Users</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ position: 'relative' }}
                    >
                        {/* Floating elements background */}
                        <div style={{
                            position: 'absolute',
                            width: '400px',
                            height: '400px',
                            background: 'var(--gradient-primary)',
                            filter: 'blur(100px)',
                            borderRadius: '50%',
                            opacity: 0.3,
                            zIndex: -1,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'

                        }}></div>

                        <div className="glass-card floating" style={{ padding: '2rem', position: 'relative', zIndex: 1, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }}></div>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }}></div>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }}></div>
                                </div>
                                <div style={{
                                    padding: '0.25rem 0.75rem',
                                    background: 'var(--gradient-accent)',
                                    borderRadius: '50px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: 'white'
                                }}>
                                    AI ANALYSIS
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Complaint #8291</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>"WiFi in library is extremely slow..."</div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span className="badge badge-high">High Priority</span>
                                    <span className="badge badge-normal">IT Support</span>
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.9rem',
                                color: 'var(--color-text-muted)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#A78BFA' }}>
                                    <FiCpu /> <span>AI Reasoning</span>
                                </div>
                                Classified as <strong>High Severity</strong> due to impact on academic activities. Routed to IT Support. Predicted resolution: <strong>4 hours</strong>.
                            </div>
                        </div>

                        {/* Floating Stats Card 1 */}
                        <motion.div
                            className="glass-card"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-30px',
                                padding: '1rem',
                                display: 'flex',
                                gap: '0.75rem',
                                alignItems: 'center',
                                zIndex: 2
                            }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <FiActivity color="white" size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>SLA Status</div>
                                <div style={{ fontWeight: 'bold' }}>On Track</div>
                            </div>
                        </motion.div>

                        {/* Floating Stats Card 2 */}
                        <motion.div
                            className="glass-card"
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                            style={{
                                position: 'absolute',
                                bottom: '-30px',
                                left: '-20px',
                                padding: '1rem',
                                display: 'flex',
                                gap: '0.75rem',
                                alignItems: 'center',
                                zIndex: 2
                            }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <FiShield color="white" size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Secure</div>
                                <div style={{ fontWeight: 'bold' }}>Verified</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '6rem 0', background: 'rgba(255,255,255,0.02)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Powerful Features</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>Everything you need to manage grievances effectively</p>
                    </div>

                    <div className="bento-grid">
                        <div className="bento-lg gradient-border-card hover-lift">
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '16px',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '1.5rem',
                                    boxShadow: 'var(--shadow-glow)'
                                }}>
                                    <FiCpu size={30} color="white" />
                                </div>
                                <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>AI Classification Engine</h3>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                                    Automatically analyzes complaint text to determine severity, category, and department routing with 92% accuracy. Reduces manual triage time by 85%.
                                </p>
                            </div>
                        </div>

                        <div className="bento-sm card hover-lift">
                            <FiActivity size={32} color="#10B981" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Live Tracking</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>Real-time status updates and SLA monitoring.</p>
                        </div>

                        <div className="bento-sm card hover-lift">
                            <FiUsers size={32} color="#F472B6" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Community Pulse</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>Public feed with engagement features like likes and comments.</p>
                        </div>

                        <div className="bento-md card hover-lift">
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Role-Based Access</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>
                                Secure portals for Complainants, Authorities, and Admins with granular permissions.
                            </p>
                        </div>

                        <div className="bento-md card hover-lift" style={{
                            background: 'var(--gradient-primary)',
                            position: 'relative', overflow: 'hidden', border: 'none'
                        }}>
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>Predictive Analytics</h3>
                                <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Forecast resolution times and identify potential bottlenecks before they happen.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
