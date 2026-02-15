import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';

const ConfidenceBadge = ({ confidence }) => {
    if (!confidence) return null;

    const avgScore = ((confidence.category || 0) + (confidence.severity || 0) + (confidence.department || 0)) / 3;
    const percentage = (avgScore * 100).toFixed(0);

    const getColor = () => {
        if (avgScore >= 0.85) return {
            bg: 'bg-green-50',
            text: 'text-green-700',
            border: 'border-green-200',
            icon: '✓'
        };
        if (avgScore >= 0.70) return {
            bg: 'bg-yellow-50',
            text: 'text-yellow-700',
            border: 'border-yellow-200',
            icon: '⚠'
        };
        return {
            bg: 'bg-red-50',
            text: 'text-red-700',
            border: 'border-red-200',
            icon: '!'
        };
    };

    const colors = getColor();

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border} text-sm font-medium`}>
            <span>{colors.icon}</span>
            <span>{percentage}% AI Confidence</span>
        </div>
    );
};

export default ConfidenceBadge;
