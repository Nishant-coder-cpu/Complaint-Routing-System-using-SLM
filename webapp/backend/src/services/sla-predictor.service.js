const supabase = require('../config/supabase');

/**
 * SLA Prediction Service
 * Predicts resolution time based on:
 * - Historical data (similar complaints)
 * - Current department workload
 * - Complaint severity
 */

class SLAPredictorService {
    /**
     * Get historical average resolution time for similar complaints
     */
    async getHistoricalAverage(categories, severity) {
        try {
            const { data, error } = await supabase
                .from('complaints')
                .select('created_at, updated_at, status')
                .eq('severity', severity)
                .eq('status', 'resolved')
                .limit(50);

            if (error || !data || data.length === 0) {
                // Default values if no historical data
                const defaults = { 'High': 72, 'Normal': 168, 'Low': 336 };
                return defaults[severity] || 168;
            }

            // Calculate average resolution time in hours
            const resolutionTimes = data.map(complaint => {
                const created = new Date(complaint.created_at);
                const resolved = new Date(complaint.updated_at);
                return (resolved - created) / (1000 * 60 * 60); // Convert to hours
            });

            const average = resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length;
            return Math.round(average);
        } catch (error) {
            console.error('Error getting historical average:', error);
            // Return default based on severity
            const defaults = { 'High': 72, 'Normal': 168, 'Low': 336 };
            return defaults[severity] || 168;
        }
    }

    /**
     * Get current department workload
     */
    async getDepartmentWorkload(department) {
        try {
            const { count, error } = await supabase
                .from('complaints')
                .select('*', { count: 'exact', head: true })
                .eq('route_to', department)
                .neq('status', 'resolved');

            if (error) {
                console.error('Error getting department workload:', error);
                return 0;
            }

            return count || 0;
        } catch (error) {
            console.error('Error in getDepartmentWorkload:', error);
            return 0;
        }
    }

    /**
     * Predict SLA deadline in hours
     */
    async predictSLA(complaint) {
        const { categories, severity, route_to } = complaint;

        // Get historical average
        const historicalAvg = await this.getHistoricalAverage(categories, severity);

        // Get current workload
        const workload = await this.getDepartmentWorkload(route_to);

        // Calculate workload multiplier
        // Light load (0-5): 1.0x
        // Medium load (6-15): 1.2x
        // Heavy load (16+): 1.5x
        let workloadMultiplier = 1.0;
        if (workload > 15) {
            workloadMultiplier = 1.5;
        } else if (workload > 5) {
            workloadMultiplier = 1.2;
        }

        // Calculate predicted time
        const predictedHours = Math.round(historicalAvg * workloadMultiplier);

        return {
            predicted_hours: predictedHours,
            predicted_days: (predictedHours / 24).toFixed(1),
            historical_avg: historicalAvg,
            current_workload: workload,
            workload_factor: workloadMultiplier
        };
    }
}

module.exports = new SLAPredictorService();
