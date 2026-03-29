/**
 * Reusable stat card component for displaying a single metric.
 *
 * @param {string} label - card label
 * @param {string|number} value - main value to display
 * @param {string} unit - unit of measurement
 * @param {string} sub - subtitle or badge text
 * @param {string} color - accent color class for the left border
 * @param {React.ReactNode} icon - optional lucide icon
 */
const StatCard = ({ label, value, unit, sub, color = 'border-gray-200', icon }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border-l-4 border border-gray-100 dark:border-gray-700 ${color} p-4`}>
            <div className="flex items-center gap-2 mb-2">
                {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
                <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-medium text-gray-900 dark:text-white">{value ?? '—'}</span>
                {unit && <span className="text-sm text-gray-400 dark:text-gray-500">{unit}</span>}
            </div>
            {sub && <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">{sub}</div>}
        </div>
    );
};

export default StatCard;