import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getChartColor } from '../../utils/chartColors';

export default function DepartmentChart({ data }) {
    // Transform data for Recharts
    const chartData = data ? Object.entries(data).map(([name, value], index) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        fullName: name,
        value,
        color: getChartColor(index)
    })).sort((a, b) => b.value - a.value) : [];

    if (chartData.length === 0) {
        return (
            <div style={{
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)'
            }}>
                No data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 50)}>
            <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" />
                <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    tick={{ fontSize: 12 }}
                />
                <Tooltip
                    contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '8px 12px'
                    }}
                    formatter={(value, name, props) => [value, props.payload.fullName]}
                />
                <Bar
                    dataKey="value"
                    radius={[0, 8, 8, 0]}
                    animationDuration={800}
                    animationBegin={0}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
