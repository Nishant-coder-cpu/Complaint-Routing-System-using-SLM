import { FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Navbar({ user }) {
    return (
        <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'rgba(24, 24, 27, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            height: '70px'
        }}>
            <div className="container" style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '36px', height: '36px',
                        background: 'var(--gradient-primary)',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)'
                    }}>
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>S</span>
                    </div>
                    <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.03em' }}>
                        Smolify
                    </span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
                            {user?.email}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary-400)' }}>
                            <span style={{ opacity: 0.7 }}>ID:</span> <span style={{ fontFamily: 'monospace' }}>{user?.id?.substring(0, 8)}</span>
                        </div>
                    </div>

                    <div className="hover-lift" style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'var(--gradient-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                    }}>
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {user?.email?.[0].toUpperCase() || <FiUser />}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
