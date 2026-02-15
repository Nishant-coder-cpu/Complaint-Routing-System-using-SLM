import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch, FiEdit2, FiSave, FiXCircle, FiUser } from 'react-icons/fi';
import api from '../../lib/api';

export default function UserManagementModal({ isOpen, onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ role: '', department: '' });

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/users');
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (user) => {
        setEditingUser(user.id);
        setEditForm({ role: user.role, department: user.department || '' });
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setEditForm({ role: '', department: '' });
    };

    const saveEdit = async (userId) => {
        try {
            await api.put(`/admin/users/${userId}`, editForm);

            // Update local state
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, ...editForm } : u
            ));

            setEditingUser(null);
            alert('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            alert(error.response?.data?.error || 'Failed to update user');
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        padding: 0
                    }}
                >
                    {/* Header */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>User Management</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)' }} className="hover:text-white">
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Search */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ position: 'relative' }}>
                            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
                            <input
                                type="text"
                                placeholder="Search by email, role, or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', paddingLeft: '2.5rem', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-400)' }}>
                                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                                Loading users...
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-400)' }}>No users found</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {filteredUsers.map((user) => (
                                    <div key={user.id} className="card" style={{
                                        padding: '1.25rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        {editingUser === user.id ? (
                                            // Edit mode
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                                    <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
                                                        <FiUser color="var(--primary-300)" size={20} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: 'white' }}>{user.email}</div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--neutral-400)' }}>
                                                            Joined: {new Date(user.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.85rem', color: 'var(--neutral-400)', display: 'block', marginBottom: '0.5rem' }}>Role</label>
                                                        <select
                                                            value={editForm.role}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                                                            style={{
                                                                width: '100%', padding: '0.5rem',
                                                                background: 'rgba(0,0,0,0.3)',
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                borderRadius: 'var(--radius-md)',
                                                                color: 'white'
                                                            }}
                                                        >
                                                            <option value="complainant">Complainant</option>
                                                            <option value="authority">Authority</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.85rem', color: 'var(--neutral-400)', display: 'block', marginBottom: '0.5rem' }}>
                                                            Department {editForm.role === 'authority' && <span style={{ color: 'var(--danger-text)' }}>*</span>}
                                                        </label>
                                                        <select
                                                            value={editForm.department}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                                                            disabled={editForm.role !== 'authority'}
                                                            style={{
                                                                width: '100%', padding: '0.5rem',
                                                                background: 'rgba(0,0,0,0.3)',
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                borderRadius: 'var(--radius-md)',
                                                                color: 'white',
                                                                opacity: editForm.role !== 'authority' ? 0.5 : 1
                                                            }}
                                                        >
                                                            <option value="">Select Department</option>
                                                            <option value="Infrastructure">Infrastructure</option>
                                                            <option value="Student Affairs">Student Affairs</option>
                                                            <option value="IT Support">IT Support</option>
                                                            <option value="Security">Security</option>
                                                            <option value="Transport">Transport</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                    <button className="btn btn-primary" onClick={() => saveEdit(user.id)}>
                                                        <FiSave style={{ marginRight: '0.5rem' }} /> Save
                                                    </button>
                                                    <button className="btn btn-secondary" onClick={cancelEdit}>
                                                        <FiXCircle style={{ marginRight: '0.5rem' }} /> Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // View mode
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                                                        <FiUser color="var(--neutral-400)" size={20} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: 'var(--neutral-200)' }}>{user.email}</div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
                                                            <span className={`badge badge-${user.role}`} style={{ marginRight: '0.5rem' }}>
                                                                {user.role}
                                                            </span>
                                                            {user.department && <span className="badge badge-normal">{user.department}</span>}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
                                                            Joined: {new Date(user.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="btn btn-secondary" onClick={() => startEdit(user)}>
                                                    <FiEdit2 style={{ marginRight: '0.5rem' }} /> Edit
                                                </button>
                                            </div>
                                        )}
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
