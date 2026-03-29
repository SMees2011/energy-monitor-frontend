import { LayoutDashboard, Sun, Zap, Euro, BarChart2, Settings, Moon } from 'lucide-react';
import { useDarkMode } from '../../context/DarkModeContext';
import BackendStatusIcon from './BackendStatusIcon';

/**
 * Sidebar navigation component.
 * Highlights the active page and calls onNavigate when a nav item is clicked.
 *
 * @param {string} activePage - currently active page key
 * @param {Function} onNavigate - callback when a nav item is clicked
 */
const Sidebar = ({ activePage, onNavigate }) => {
    const { isDark, toggleDarkMode } = useDarkMode();

    const navItems = [
        { key: 'overzicht', label: 'Overzicht', icon: LayoutDashboard },
        { key: 'zonne', label: 'Zonne-energie', icon: Sun },
        { key: 'verbruik', label: 'Verbruik', icon: Zap },
        { key: 'kosten', label: 'Kosten', icon: Euro },
        { key: 'historiek', label: 'Historiek', icon: BarChart2 },
        { key: 'instellingen', label: 'Instellingen', icon: Settings },
    ];

    return (
        <div className="w-52 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col h-screen">
            {/* Logo */}
            <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Zap size={18} className="text-amber-500" />
                    <span className="font-medium text-sm text-gray-900 dark:text-white">Energiebeheer</span>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Thuis · Brussel</div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 py-2">
                <div className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">Menu</div>
                {navItems.slice(0, 5).map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => onNavigate(key)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors border-l-2 ${
                            activePage === key
                                ? 'text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border-blue-500 font-medium'
                                : 'text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}

                <div className="px-4 py-2 mt-2 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">Beheer</div>
                {navItems.slice(5).map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => onNavigate(key)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors border-l-2 ${
                            activePage === key
                                ? 'text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border-blue-500 font-medium'
                                : 'text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
                {/* Dark mode toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    {isDark ? 'Light mode' : 'Dark mode'}
                </button>

                {/* Status info */}
                <BackendStatusIcon />
                <div className="text-xs text-gray-400 dark:text-gray-500">Nordpool BE · EPEX</div>
            </div>
        </div>
    );
};

export default Sidebar;