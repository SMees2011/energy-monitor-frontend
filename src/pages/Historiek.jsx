import { useState, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { usePolling } from '../hooks/usePolling';
import { getDagelijkseProductie, getStats } from '../services/api';
import PageHeader from '../components/layout/PageHeader';
import StatCard from '../components/layout/StatCard';
import { Sun, Zap, ArrowUpRight, Euro } from 'lucide-react';

/**
 * Formats a timestamp to a short date label.
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} date label e.g. '22/03'
 */
const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getDate()}/${date.getMonth() + 1}`;
};

/**
 * Converts a timestamp → value map to a recharts array.
 * @param {Object} data - timestamp → value map
 * @param {string} key - data key name
 * @returns {Array} recharts data array
 */
const buildBarData = (data, key) => {
    if (!data) return [];
    return Object.entries(data)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([ts, value]) => ({
            date: formatDate(ts),
            [key]: Math.round(value * 100) / 100,
        }));
};

/**
 * Historiek page — shows daily production bar charts and period stats.
 * Supports switching between week, month and year views.
 */
const Historiek = () => {
    const [activeTab, setActiveTab] = useState('Maand');
    const [activeCategory, setActiveCategory] = useState('Productie');

    const range = activeTab === 'Week' ? '-1w' : activeTab === 'Maand' ? '-30d' : '-365d';
    const statsRange = activeTab === 'Week' ? '-1w' : activeTab === 'Maand' ? '-30d' : '-365d';

    const fetchProductie = useCallback(() => getDagelijkseProductie(range), [range]);
    const fetchStats = useCallback(() => getStats(statsRange), [statsRange]);

    const { data: productie, loading: loadingProductie } = usePolling(fetchProductie, 300000);
    const { data: stats } = usePolling(fetchStats, 300000);

    const productieData = buildBarData(productie, 'kwh');

    const totalProductie = productieData.reduce((sum, d) => sum + d.kwh, 0).toFixed(1);
    const maxProductie = productieData.length > 0
        ? Math.max(...productieData.map((d) => d.kwh)).toFixed(1)
        : 0;
    const avgProductie = productieData.length > 0
        ? (productieData.reduce((sum, d) => sum + d.kwh, 0) / productieData.length).toFixed(1)
        : 0;

    const categories = ['Productie', 'Verbruik', 'Kosten', 'Zelfconsumptie'];

    return (
        <div className="p-4">
            <PageHeader
                title="Historiek"
                subtitle="Trends over tijd"
                tabs={['Week', 'Maand', 'Jaar']}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Category tabs */}
            <div className="flex gap-0 border-b border-gray-100 dark:border-gray-700 mb-4">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`text-sm px-4 py-2 border-b-2 transition-colors ${
                            activeCategory === cat
                                ? 'text-gray-900 dark:text-white border-blue-500 font-medium'
                                : 'text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 dark:hover:text-gray-400'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Stats rij */}
            <div className="grid grid-cols-4 gap-3 mb-4">
                <StatCard
                    label="Totale productie"
                    value={totalProductie}
                    unit="kWh"
                    sub={`${activeTab.toLowerCase()}`}
                    color="border-l-amber-400"
                    icon={<Sun size={14} />}
                />
                <StatCard
                    label="Beste dag"
                    value={maxProductie}
                    unit="kWh"
                    sub="Piekproductie"
                    color="border-l-amber-400"
                    icon={<Sun size={14} />}
                />
                <StatCard
                    label="Gemiddeld/dag"
                    value={avgProductie}
                    unit="kWh"
                    sub="Daggemiddelde"
                    color="border-l-blue-400"
                    icon={<Zap size={14} />}
                />
                <StatCard
                    label="Zelfconsumptie"
                    value={stats?.zelfconsumptiegraad?.toFixed(1) ?? '—'}
                    unit="%"
                    sub={`${activeTab.toLowerCase()}`}
                    color="border-l-green-500"
                    icon={<ArrowUpRight size={14} />}
                />
            </div>

            {/* Grafiek */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-4">
                <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                    {activeCategory === 'Productie' && `Dagelijkse PV productie (kWh) — ${activeTab.toLowerCase()}`}
                    {activeCategory === 'Verbruik' && `Dagelijks verbruik — ${activeTab.toLowerCase()}`}
                    {activeCategory === 'Kosten' && `Dagelijkse kosten — ${activeTab.toLowerCase()}`}
                    {activeCategory === 'Zelfconsumptie' && `Zelfconsumptiegraad — ${activeTab.toLowerCase()}`}
                </div>

                {loadingProductie ? (
                    <div className="h-52 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                        Laden...
                    </div>
                ) : productieData.length === 0 ? (
                    <div className="h-52 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                        Geen data beschikbaar
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={productieData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} unit=" kWh" />
                            <Tooltip formatter={(val) => [`${val} kWh`]} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar
                                dataKey="kwh"
                                fill="#fbbf24"
                                name="PV Productie"
                                radius={[3, 3, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Periode samenvatting */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    Samenvatting — {activeTab.toLowerCase()}
                </div>
                <div className="space-y-2">
                    {[
                        {
                            label: 'Totale PV productie',
                            value: `${stats?.pvProductieKwh?.toFixed(1) ?? '—'} kWh`,
                        },
                        {
                            label: 'Totale injectie',
                            value: `${stats?.injectieKwh?.toFixed(1) ?? '—'} kWh`,
                        },
                        {
                            label: 'Totaal verbruik van net',
                            value: `${stats?.netVerbruikKwh?.toFixed(1) ?? '—'} kWh`,
                        },
                        {
                            label: 'Zelfconsumptiegraad',
                            value: `${stats?.zelfconsumptiegraad?.toFixed(1) ?? '—'} %`,
                        },
                        {
                            label: 'Zelfvoorzieningsgraad',
                            value: `${stats?.zelfvoorzieningsgraad?.toFixed(1) ?? '—'} %`,
                        },
                        {
                            label: 'Netkost (EPEX)',
                            value: `€ ${stats?.netkost?.toFixed(2) ?? '—'}`,
                        },
                        {
                            label: 'Gasverbruik',
                            value: `${stats?.gasVerbruik?.toFixed(2) ?? '—'} m³`,
                        },
                    ].map(({ label, value }) => (
                        <div
                            key={label}
                            className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700 last:border-0"
                        >
                            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Historiek;