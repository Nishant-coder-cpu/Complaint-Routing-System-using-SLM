import { useState } from 'react';
import { FiSend, FiShield, FiClock, FiAlertCircle, FiCheckCircle, FiArrowRight, FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import api from '../lib/api';

export default function ComplaintSubmissionWizard({ onComplaintSubmitted }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [complaintText, setComplaintText] = useState('');
    const [anonymous, setAnonymous] = useState(false);

    // AI Analysis Result
    const [analysis, setAnalysis] = useState(null);

    const handleAnalyze = async () => {
        if (!complaintText.trim()) return;

        setLoading(true);
        try {
            const { data } = await api.post('/complaints/analyze', { complaint_text: complaintText });
            setAnalysis(data);
            setStep(2);
        } catch (error) {
            console.error('Analysis failed:', error);
            // If analysis fails, fallback to simple submission
            alert('AI Analysis busy. Proceeding to manual submission.');
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post('/complaints', {
                complaint_text: complaintText,
                anonymous
            });
            setStep(3);
            onComplaintSubmitted(); // Refresh parent list
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setComplaintText('');
        setAnonymous(false);
        setAnalysis(null);
        setStep(1);
    };

    return (
        <div className="card" style={{ overflow: 'hidden', padding: 0, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {/* Wizard Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'white' }}>Report an Issue Securely</h2>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Step {step} of 3</span>
                </div>
                {/* Progress Bar */}
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', width: '100%', position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        background: 'var(--primary-500)',
                        borderRadius: '2px',
                        width: step === 1 ? '33%' : step === 2 ? '66%' : '100%',
                        transition: 'width 0.3s ease'
                    }}></div>
                </div>
            </div>

            <div style={{ padding: '2rem' }}>
                {/* Step 1: Input */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <div className="form-group">
                            <label className="form-label" style={{ color: 'var(--color-text-muted)' }}>Describe your grievance in detail</label>
                            <textarea
                                className="form-control"
                                rows="6"
                                value={complaintText}
                                onChange={(e) => setComplaintText(e.target.value)}
                                placeholder="Please provide specific details about the incident, location, and time..."
                                required
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                <FiShield style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                Your report is encrypted and secure.
                            </p>
                        </div>

                        <div className="form-group" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    id="anon"
                                    checked={anonymous}
                                    onChange={(e) => setAnonymous(e.target.checked)}
                                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', accentColor: 'var(--primary-500)' }}
                                />
                            </div>
                            <label htmlFor="anon" style={{ marginBottom: 0, fontWeight: '500', cursor: 'pointer', flex: 1, color: 'white' }}>
                                Submit Anonymously
                                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
                                    Your personal details will be hidden from authorities.
                                </span>
                            </label>
                            <FiShield size={20} color="var(--neutral-400)" />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleAnalyze}
                                disabled={!complaintText.trim() || loading}
                            >
                                {loading ? 'Analyzing...' : 'Continue'}
                                {!loading && <FiArrowRight />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: AI Review */}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '60px', height: '60px',
                                background: 'rgba(139, 92, 246, 0.1)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem auto',
                                color: 'var(--primary-400)'
                            }}>
                                <FiClock size={30} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>AI Triage Assessment</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>
                                Based on your description, here is our preliminary assessment.
                            </p>
                        </div>

                        {analysis && (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600' }}>Category</span>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                            {analysis.categories.map((cat) => (
                                                <span key={cat} className="badge badge-normal">{cat}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600' }}>Severity</span>
                                        <div style={{ marginTop: '0.25rem', fontWeight: '600', color: 'white' }}>
                                            {analysis.severity}
                                        </div>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600' }}>Routing To</span>
                                        <div style={{ marginTop: '0.25rem', color: 'white', fontSize: '0.9rem' }}>
                                            {analysis.route_to}
                                        </div>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600' }}>Est. Resolution</span>
                                        <div style={{ marginTop: '0.25rem', color: 'var(--primary-400)', fontWeight: '600' }}>
                                            {analysis.predicted_resolution_days} Days
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(234, 88, 12, 0.1)', border: '1px solid rgba(234, 88, 12, 0.2)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                                    <FiAlertCircle color="#FB923C" style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#FDBA74' }}>
                                        This is an automated assessment. A human officer will verify these details upon submission.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setStep(1)}
                            >
                                <FiArrowLeft /> Edit
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Confirm & Submit'}
                                {!loading && <FiSend />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{
                            width: '80px', height: '80px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem auto',
                            color: 'var(--success-text)'
                        }}>
                            <FiCheckCircle size={40} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'white' }}>Complaint Submitted</h2>
                        <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
                            Your grievance has been securely logged and successfully routed to the relevant department.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-primary" onClick={resetForm}>
                                Report Another Issue
                            </button>
                            {/* In a real app, maybe navigate to the specific complaint page */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
