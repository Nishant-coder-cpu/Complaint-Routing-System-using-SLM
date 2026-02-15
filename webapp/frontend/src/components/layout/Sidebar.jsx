import { NavLink } from 'react-router-dom';
import { FiBarChart2, FiSearch, FiFolder, FiMessageSquare, FiLogOut, FiPieChart, FiUsers } from 'react-icons/fi';

export default function Sidebar({ userRole, onLogout, onToggleChat }) {
    return (
        <aside className="sidebar" style={{
            width: 'var(--sidebar-width)',
            background: 'var(--neutral-900)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0
        }}>
            <div className="sidebar-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--neutral-700)' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', background: 'var(--primary-400)', borderRadius: '50%' }}></div>
                    Smolify
                </h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', marginTop: '0.25rem' }}>Grievance Resolution</div>
            </div>

            <nav className="sidebar-nav" style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {userRole === 'complainant' && (
                    <>
                        <NavLink to="/complainant" style={navLinkStyle}>
                            <FiBarChart2 /> My Complaints
                        </NavLink>
                        <NavLink to="/community" style={navLinkStyle}>
                            <FiUsers /> Community Pulse
                        </NavLink>
                        <NavLink to="/track" style={navLinkStyle}>
                            <FiSearch /> Track Complaint
                        </NavLink>
                    </>
                )}

                {userRole === 'authority' && (
                    <NavLink to="/authority" style={navLinkStyle}>
                        <FiFolder /> Department Cases
                    </NavLink>
                )}

                {userRole === 'admin' && (
                    <>
                        <NavLink to="/admin" style={navLinkStyle}>
                            <FiPieChart /> Dashboard
                        </NavLink>
                        {/* Chatbot Toggle Button */}
                        <button
                            onClick={onToggleChat}
                            style={{
                                ...baseLinkStyle,
                                background: 'transparent',
                                border: 'none',
                                width: '100%',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            <FiMessageSquare /> AI Assistant
                        </button>
                    </>
                )}
            </nav>

            <div className="sidebar-footer" style={{ padding: '1.5rem', borderTop: '1px solid var(--neutral-700)' }}>
                <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--neutral-400)' }}>
                    Logged in as <strong style={{ color: 'white', textTransform: 'capitalize' }}>{userRole}</strong>
                </div>
                <button onClick={onLogout} className="btn" style={{
                    width: '100%',
                    background: 'var(--neutral-800)',
                    color: 'var(--neutral-200)',
                    border: '1px solid var(--neutral-600)',
                    justifyContent: 'flex-start'
                }}>
                    <FiLogOut /> Logout
                </button>
            </div>
        </aside>
    );
}

const baseLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    color: 'var(--neutral-400)',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.2s',
    textDecoration: 'none'
};

const navLinkStyle = ({ isActive }) => ({
    ...baseLinkStyle,
    background: isActive ? 'var(--primary-900)' : 'transparent',
    color: isActive ? 'var(--primary-300)' : 'var(--neutral-400)',
    borderLeft: isActive ? '3px solid var(--primary-400)' : '3px solid transparent'
});
