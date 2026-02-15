import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { FiArrowRight } from 'react-icons/fi';

// Pages
import Login from './pages/Login';
import ComplainantPortal from './pages/ComplainantPortal';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReviewQueue from './pages/ReviewQueue';
import PublicFeed from './pages/PublicFeed';
import CommunityFeed from './pages/CommunityFeed';
import TrackComplaint from './pages/TrackComplaint';
import LandingPage from './pages/LandingPage';
import Layout from './components/layout/Layout';

function App() {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // Standard useRef
    const lastUserIdRef = React.useRef(null);

    useEffect(() => {
        console.log('App: Mounting and checking session...');
        let mounted = true;

        const handleSession = async (session) => {
            if (!mounted) return;

            console.log('App: Handling session:', session?.user?.id);

            if (session?.user) {
                setUser(session.user);

                // Prevent redundant fetches
                if (lastUserIdRef.current !== session.user.id) {
                    console.log('App: Fetching role for new user:', session.user.id);
                    setLoading(true);
                    lastUserIdRef.current = session.user.id;
                    await fetchUserRole(session.user.id);
                } else {
                    console.log('App: Role already being fetched or fetched for this user');
                }
            } else {
                console.log('App: No user in session');
                setUser(null);
                setUserRole(null);
                lastUserIdRef.current = null;
                setLoading(false);
            }
        };

        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('App: Initial session check completed');
            handleSession(session);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('App: Auth state change:', _event);
            handleSession(session);
        });

        return () => {
            console.log('App: Unmounting');
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserRole = async (userId) => {
        console.log('App: executing fetchUserRole for', userId);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('role, department')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('App: Error fetching user role from DB:', error);
            }

            if (data) {
                console.log('App: Role fetched:', data);
                setUserRole(data);
            } else {
                console.warn('App: User found in auth but not in users table');
            }
        } catch (error) {
            console.error('App: Exception in fetchUserRole:', error);
        } finally {
            console.log('App: setting loading to false');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div className="spinner" style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid var(--border-color)',
                        borderTopColor: 'var(--primary-color)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    <div style={{ color: 'var(--text-secondary)' }}>Loading application...</div>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={
                user ? (
                    userRole?.role === 'admin'
                        ? <Navigate to="/admin" />
                        : userRole?.role === 'authority'
                            ? <Navigate to="/authority" />
                            : <Navigate to="/complainant" />
                ) : <LandingPage />
            } />

            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

            {/* Public track page, but wrapped in layout if user is logged in, or just standalone if not */}
            <Route path="/track" element={
                user ? (
                    <Layout user={user} userRole={userRole}>
                        <TrackComplaint />
                    </Layout>
                ) : (
                    <div className="container" style={{ padding: '2rem', paddingTop: '100px' }}>
                        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '2rem', color: 'var(--primary-400)', textDecoration: 'none', fontWeight: '500' }}>
                            <FiArrowRight style={{ transform: 'rotate(180deg)', marginRight: '0.5rem' }} /> Back to Home
                        </Link>
                        <TrackComplaint />
                    </div>
                )
            } />

            {/* Protected routes */}
            <Route
                path="/complainant"
                element={
                    user ? (
                        userRole?.role === 'complainant' ? (
                            <Layout user={user} userRole={userRole}>
                                <ComplainantPortal />
                            </Layout>
                        ) : <Navigate to="/" />
                    ) : <Navigate to="/login" />
                }
            />
            <Route
                path="/feed"
                element={
                    <Layout user={user} userRole={userRole}>
                        <PublicFeed />
                    </Layout>
                }
            />
            <Route
                path="/community"
                element={
                    <Layout user={user} userRole={userRole}>
                        <CommunityFeed />
                    </Layout>
                }
            />
            <Route
                path="/authority"
                element={
                    user ? (
                        userRole?.role === 'authority' ? (
                            <Layout user={user} userRole={userRole}>
                                <AuthorityDashboard />
                            </Layout>
                        ) : <Navigate to="/" />
                    ) : <Navigate to="/login" />
                }
            />
            <Route
                path="/admin"
                element={
                    user ? (
                        userRole?.role === 'admin' ? (
                            <Layout user={user} userRole={userRole}>
                                <AdminDashboard />
                            </Layout>
                        ) : <Navigate to="/" />
                    ) : <Navigate to="/login" />
                }
            />
            <Route
                path="/admin/review-queue"
                element={
                    user ? (
                        userRole?.role === 'admin' ? (
                            <Layout user={user} userRole={userRole}>
                                <ReviewQueue />
                            </Layout>
                        ) : <Navigate to="/" />
                    ) : <Navigate to="/login" />
                }
            />

            {/* Default redirect based on role */}
            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
