/**
 * Reusable page header with title, subtitle and optional time range tabs.
 *
 * @param {string} title - page title
 * @param {string} subtitle - page subtitle
 * @param {string[]} tabs - list of tab labels
 * @param {string} activeTab - currently active tab
 * @param {Function} onTabChange - callback when a tab is clicked
 */
const PageHeader = ({ title, subtitle, tabs, activeTab, onTabChange }) => {
    return (
        <div className="flex justify-between items-center mb-4">
            <div>
                <h1 className="text-base font-medium text-gray-900 dark:text-white">{title}</h1>
                {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            {tabs && (
                <div className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => onTabChange(tab)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                activeTab === tab
                                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-transparent'
                                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PageHeader;