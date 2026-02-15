// Chart color palette matching design system
export const chartColors = {
    severity: {
        High: '#EF4444',      // Red
        Medium: '#F59E0B',    // Amber
        Low: '#10B981',       // Green
    },
    department: [
        '#3B82F6',  // Blue
        '#8B5CF6',  // Purple
        '#EC4899',  // Pink
        '#14B8A6',  // Teal
        '#F97316',  // Orange
        '#06B6D4',  // Cyan
        '#A855F7',  // Violet
        '#84CC16',  // Lime
    ],
    status: {
        pending: '#F59E0B',      // Amber
        in_progress: '#3B82F6', // Blue
        resolved: '#10B981',     // Green
    }
};

export const getChartColor = (index) => {
    return chartColors.department[index % chartColors.department.length];
};
