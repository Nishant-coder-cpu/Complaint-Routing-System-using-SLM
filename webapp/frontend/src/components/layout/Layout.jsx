import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Chatbot from '../Chatbot';


export default function Layout({ children, user, userRole }) {
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="dashboard-layout">
            <Sidebar
                userRole={userRole?.role}
                onLogout={handleLogout}
                onToggleChat={() => setIsChatOpen(!isChatOpen)}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 'var(--sidebar-width)' }}>
                <Navbar user={user} />
                <main className="main-content" style={{ margin: 0, width: '100%' }}>
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>

            {/* Global Chatbot for Admins */}
            {userRole?.role === 'admin' && (
                <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            )}
        </div>
    );
}
