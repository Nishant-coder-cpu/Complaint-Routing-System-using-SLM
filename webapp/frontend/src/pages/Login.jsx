import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FiShield, FiLock, FiActivity, FiArrowRight } from 'react-icons/fi';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout" style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)' }}>
            {/* Left Side - Login Form */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem', background: 'var(--color-bg)' }}>
                <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
                                <FiShield size={24} />
                            </div>
                            <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', letterSpacing: '-0.025em' }}>
                                Institutional Grievance Portal
                            </span>
                        </div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', color: 'white' }}>Sign in to your account</h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            Access your dashboard to manage complaints and view reports.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label" style={{ color: 'var(--color-text-muted)' }}>Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@institution.edu"
                                required
                                style={{
                                    height: '48px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <label className="form-label" style={{ marginBottom: 0, color: 'var(--color-text-muted)' }}>Password</label>
                                <a href="#" style={{ fontSize: '0.875rem', color: 'var(--primary-400)' }}>Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    height: '48px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem', justifyContent: 'center' }}
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                            {!loading && <FiArrowRight />}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Public access</span>
                            <Link to="/track" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--primary-400)' }}>
                                Track a Complaint <FiArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Institutional Branding */}
            <div className="hidden-mobile" style={{ flex: '1', background: 'var(--neutral-900)', position: 'relative', overflow: 'hidden', color: 'white' }}>
                {/* Decorative Pattern */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)', borderRadius: '50%' }}></div>

                <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '3rem' }}>
                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem', opacity: 0.8, display: 'block', marginBottom: '1rem', color: 'var(--primary-400)' }}>
                            System Overview
                        </span>
                        <h2 style={{ fontSize: '2.5rem', lineHeight: '1.2', marginBottom: '1.5rem', color: 'white' }}>
                            Secure, AI-assisted grievance resolution.
                        </h2>
                        <p style={{ fontSize: '1.125rem', opacity: 0.8, lineHeight: '1.6', maxWidth: '480px', color: 'var(--color-text-muted)' }}>
                            A centralized platform ensuring every voice is heard. Our system prioritizes confidentiality, efficiency, and fair resolution.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.5rem', height: 'fit-content' }}>
                                <FiLock size={24} color="#5EEAD4" />
                            </div>
                            <div>
                                <h4 style={{ color: 'white', fontSize: '1.125rem', marginBottom: '0.25rem' }}>Confidential by Design</h4>
                                <p style={{ fontSize: '0.875rem', opacity: 0.7, lineHeight: '1.5', color: 'var(--color-text-muted)' }}>
                                    End-to-end encryption and optional anonymity protection for all reporters.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.5rem', height: 'fit-content' }}>
                                <FiActivity size={24} color="#5EEAD4" />
                            </div>
                            <div>
                                <h4 style={{ color: 'white', fontSize: '1.125rem', marginBottom: '0.25rem' }}>Intelligent Triage</h4>
                                <p style={{ fontSize: '0.875rem', opacity: 0.7, lineHeight: '1.5', color: 'var(--color-text-muted)' }}>
                                    AI-assisted categorization ensures complaints reach the right department instantly.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '4rem', opacity: 0.6, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        © 2026 Institutional Grievance System. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
}
