import { motion } from 'framer-motion';

export default function Skeleton({ width = '100%', height = '20px', borderRadius = '4px', style = {} }) {
    return (
        <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
                width,
                height,
                borderRadius,
                background: 'linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)',
                backgroundSize: '200% 100%',
                ...style
            }}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="card" style={{ padding: '1.5rem' }}>
            <Skeleton width="60%" height="16px" style={{ marginBottom: '1rem' }} />
            <Skeleton width="40%" height="32px" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="50%" height="12px" />
        </div>
    );
}

export function SkeletonTable({ rows = 5 }) {
    return (
        <div>
            {Array.from({ length: rows }).map((_, idx) => (
                <div key={idx} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <Skeleton width="100%" height="16px" />
                </div>
            ))}
        </div>
    );
}
