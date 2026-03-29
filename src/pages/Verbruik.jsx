import { useState, useCallback } from 'react';
import { Zap, ArrowDownLeft, Sun, Activity } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { usePolling } from '../hooks/usePolling';
import { getLatest, getStackedGrafiek } from '../services/api';
import StatCard from '../components/layout/StatCard';
import PageHeader from '../components/layout/PageHeader';

/**
 * Formats a timestamp string to a readable hour label.
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} hour label e.g. '14u'
 */
const formatHour = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}u`;
};

/**
 * Converts a map of timestamp → value to a recharts-compatible array.
 * @param {Object} injectie - timestamp → value map
 * @param {Object} eigenVerbruik - timestamp → value map
 * @param {Object} verbruikVanNet - timestamp → value map
 * @returns {Array} recharts data array
 */
const buildChartData = (injectie, eigenVerbruik, verbruikVanNet) => {
    const timestamps = Object.keys(injectie ?? {}).sort();
    return timestamps.map((ts) => ({
        time: formatHour(ts),
        injectie: Math.round(injectie[ts] ?? 0),
        eigenVerbruik: Math.round(eigenVerbruik?.[ts] ?? 0),
        verbruikVanNet: Math.round(verbruikVanNet?.[ts] ?? 0),
    }));
};

/**
 * Verbruik page — shows current consumption stats and stacked area chart.
 * Allows switching between day and week view.
 */
const Verbruik = () => {
    const [activeTab, setActiveTab] = useState('Dag');

    const range = activeTab === 'Dag' ? '-1d' : activeTab === 'Week' ? '-1w' : '-30d';

    const fetchLatest = useCallback(() => getLatest(), []);
    const fetchStacked = useCallback(() => getStackedGrafiek(range), [range]);

    const { data: latest } = usePolling(fetchLatest, 5000);
    const { data: stacked, loading } = usePolling(fetchStacked, 60000);

    const totaalVerbruik = latest?.totaal_verbruik ?? 0;
    const eigenVerbruik = latest?.zonnepaneel_eigen_verbruik ?? 0;
    const verbruikVanNet = latest?.verbruik_van_net ?? 0;

    const formatWatt = (w) => w >= 1000 ? `${(w / 1000).toFixed(2)}` : `${Math.round(w)}`;
    const formatWattUnit = (w) => w >= 1000 ? 'kW' : 'W';

    const chartData = stacked
        ? buildChartData(stacked.injectie, stacked.eigenVerbruik, stacked.verbruikVanNet)
        : [];

    const solarPct = totaalVerbruik > 0
        ? Math.round((eigenVerbruik / totaalVerbruik) * 100)
        : 0;

    return (
        <div className="p-4">
            <PageHeader
                title="Verbruik"
                subtitle="Netverbruik · Eigen verbruik · Injectie"
                tabs={['Dag', 'Week', 'Maand']}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <StatCard
                    label="Totaal verbruik"
                    value={formatWatt(totaalVerbruik)}
                    unit={formatWattUnit(totaalVerbruik)}
                    sub="Huidig verbruik"
                    color="border-l-red-400"
                    icon={<Activity size={14} />}
                />
                <StatCard
                    label="Van zonnepanelen"
                    value={formatWatt(eigenVerbruik)}
                    unit={formatWattUnit(eigenVerbruik)}
                    sub={`${solarPct}% van verbruik`}
                    color="border-l-green-500"
                    icon={<Sun size={14} />}
                />
                <StatCard
                    label="Van net"
                    value={formatWatt(verbruikVanNet)}
                    unit={formatWattUnit(verbruikVanNet)}
                    sub={verbruikVanNet === 0 ? 'Volledig solar' : `${100 - solarPct}% van verbruik`}
                    color="border-l-purple-500"
                    icon={<ArrowDownLeft size={14} />}
                />
            </div>

            {/* Stacked grafiek */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-4">
                <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                    Energieverdeling — {activeTab.toLowerCase()}
                </div>
                {loading ? (
                    <div className="h-48 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                        Laden...
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                        Geen data beschikbaar
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} unit="W" />
                            <Tooltip formatter={(val) => [`${val} W`]} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Area
                                type="monotone"
                                dataKey="injectie"
                                stackId="1"
                                stroke="#3b82f6"
                                fill="#bfdbfe"
                                name="Injectie"
                            />
                            <Area
                                type="monotone"
                                dataKey="eigenVerbruik"
                                stackId="1"
                                stroke="#22c55e"
                                fill="#bbf7d0"
                                name="Eigen verbruik"
                            />
                            <Area
                                type="monotone"
                                dataKey="verbruikVanNet"
                                stackId="1"
                                stroke="#a855f7"
                                fill="#e9d5ff"
                                name="Verbruik van net"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Stats tabel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    Statistieken — {activeTab.toLowerCase()}
                </div>
                <div className="space-y-2">
                    {[
                        { label: 'Zelfvoorzieningsgraad', value: `${solarPct}%` },
                        { label: 'Van zonnepanelen', value: `${formatWatt(eigenVerbruik)} ${formatWattUnit(eigenVerbruik)}` },
                        { label: 'Van net', value: `${formatWatt(verbruikVanNet)} ${formatWattUnit(verbruikVanNet)}` },
                        { label: 'Totaal verbruik', value: `${formatWatt(totaalVerbruik)} ${formatWattUnit(totaalVerbruik)}` },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Verbruik;