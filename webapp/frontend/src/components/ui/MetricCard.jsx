import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';

export default function MetricCard({ title, value, icon, color = 'var(--primary-color)', trend }) {
    const animatedValue = useCountUp(value, 1500);

    return (
        <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
            style={{
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                borderLeft: `4px solid ${color}`
            }}
        >
            {/* Background Icon */}
            <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                fontSize: '5rem',
                opacity: 0.05,
                pointerEvents: 'none'
            }}>
                {icon}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem',
                        fontWeight: 500
                    }}>
                        {title}
                    </div>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1
                    }}>
                        {animatedValue}
                    </div>
                    {trend && (
                        <div style={{
                            marginTop: '0.5rem',
                            fontSize: '0.75rem',
                            color: trend > 0 ? '#10B981' : trend < 0 ? '#EF4444' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}
                            <span>{Math.abs(trend)}%</span>
                            <span style={{ color: 'var(--text-secondary)' }}>vs last month</span>
                        </div>
                    )}
                </div>
                <div style={{
                    fontSize: '2rem',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    background: `${color}15`
                }}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
}
