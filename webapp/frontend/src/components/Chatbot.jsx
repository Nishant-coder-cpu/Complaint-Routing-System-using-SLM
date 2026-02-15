import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

export default function Chatbot({ isOpen, onClose }) {
    // const [isOpen, setIsOpen] = useState(false); // Controlled by parent now
    const [messages, setMessages] = useState([{
        type: 'bot',
        text: 'Hi! I can help you with complaint statistics. Try asking:\n- "How many critical complaints are unresolved?"\n- "Which department has the most complaints?"\n- "Show me SLA breaches"',
        timestamp: new Date()
    }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (question = null) => {
        const userMessage = question || input.trim();
        if (!userMessage) return;

        // Add user message
        setMessages(prev => [...prev, {
            type: 'user',
            text: userMessage,
            timestamp: new Date()
        }]);

        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('/admin/chat', { message: userMessage });

            // Add bot response
            setMessages(prev => [...prev, {
                type: 'bot',
                text: response.data.answer,
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, {
                type: 'bot',
                text: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };


    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            bottom: '2rem',
                            right: '2rem',
                            width: '400px',
                            maxWidth: 'calc(100vw - 4rem)',
                            height: '600px',
                            maxHeight: 'calc(100vh - 4rem)',
                            background: 'rgba(24, 24, 27, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            zIndex: 1000
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1rem 1.5rem',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>🤖</span>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>Admin Assistant</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Ask about complaints</div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            background: 'transparent'
                        }}>
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '80%'
                                    }}
                                >
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: msg.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        background: msg.type === 'user'
                                            ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))'
                                            : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: 1.5,
                                        fontSize: '0.9rem',
                                        border: msg.type === 'bot' ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                    }}>
                                        {msg.type === 'bot' && idx === messages.length - 1 && isLoading ? (
                                            <TypingEffect text={msg.text} />
                                        ) : (
                                            <MarkdownText text={msg.text} />
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: 'var(--color-text-muted)',
                                        marginTop: '0.25rem',
                                        paddingLeft: msg.type === 'user' ? 0 : '1rem',
                                        paddingRight: msg.type === 'user' ? '1rem' : 0,
                                        textAlign: msg.type === 'user' ? 'right' : 'left'
                                    }}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        alignSelf: 'flex-start',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '16px 16px 16px 4px',
                                        background: 'rgba(255,255,255,0.1)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span className="dot-pulse"></span>
                                        <span className="dot-pulse" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="dot-pulse" style={{ animationDelay: '0.4s' }}></span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Questions */}
                        <div style={{
                            padding: '0.75rem',
                            background: 'rgba(0,0,0,0.2)',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                        }}>
                            {['How many critical complaints?', 'Show SLA breaches', 'Which department has most complaints?', 'Show recent complaints'].map((question, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendMessage(question)}
                                    disabled={isLoading}
                                    style={{
                                        padding: '0.4rem 0.75rem',
                                        fontSize: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        color: 'var(--color-text-muted)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'var(--color-primary)';
                                        e.target.style.color = 'white';
                                        e.target.style.borderColor = 'var(--color-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.05)';
                                        e.target.style.color = 'var(--color-text-muted)';
                                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                    }}
                                >
                                    {question}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(0,0,0,0.2)',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            gap: '0.5rem'
                        }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask a question..."
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    color: 'white'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!input.trim() || isLoading}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: input.trim() && !isLoading ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                    color: input.trim() && !isLoading ? 'white' : 'rgba(255,255,255,0.3)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                                    fontWeight: 500,
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Send
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add CSS for loading animation */}
            <style>{`
                @keyframes dotPulse {
                    0%, 80%, 100% { opacity: 0.3; }
                    40% { opacity: 1; }
                }
                .dot-pulse {
                    width: 8px;
                    height: 8px;
                    background: var(--color-primary);
                    border-radius: 50%;
                    display: inline-block;
                    animation: dotPulse 1.4s infinite ease-in-out both;
                }
            `}</style>
        </>
    );
}

// Simple Markdown Parser (Bold support)
const MarkdownText = ({ text }) => {
    if (!text) return null;

    // Split by ** for bold
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

// Typing Effect Component
const TypingEffect = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setDisplayedText((prev) => prev + text.charAt(index));
            index++;
            if (index === text.length) clearInterval(interval);
        }, 20); // Speed of typing

        return () => clearInterval(interval);
    }, [text]);

    return <MarkdownText text={displayedText} />;
};
