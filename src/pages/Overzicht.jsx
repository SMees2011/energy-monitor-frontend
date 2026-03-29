import { useCallback } from 'react';
import { Sun, Zap, ArrowUpRight, ArrowDownLeft, Activity, Euro } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePolling } from '../hooks/usePolling';
import { getLatest, getPrijsNu, getZelfconsumptieNu, getRealtimeStackedGrafiek } from '../services/api';
import StatCard from '../components/layout/StatCard';
import PageHeader from '../components/layout/PageHeader';

const buildRealtimeChartData = (injectie, eigenVerbruik, verbruikVanNet) => {
    const timestamps = Array.from(new Set([
        ...Object.keys(injectie ?? {}),
        ...Object.keys(eigenVerbruik ?? {}),
        ...Object.keys(verbruikVanNet ?? {}),
    ])).sort();

    return timestamps.map((ts) => ({
        time: ts,
        injectie: Math.round(injectie?.[ts] ?? 0),
        eigenVerbruik: Math.round(eigenVerbruik?.[ts] ?? 0),
        verbruikVanNet: Math.round(verbruikVanNet?.[ts] ?? 0),
    }));
};

/**
 * Overzicht page — shows real-time energy stats and energy flow.
 * Data is polled every 5 seconds from the Spring Boot backend.
 */
const Overzicht = () => {
    const fetchLatest = useCallback(() => getLatest(), []);
    const fetchPrijs = useCallback(() => getPrijsNu(), []);
    const fetchZelfconsumptie = useCallback(() => getZelfconsumptieNu(), []);
    const fetchRealtimeStacked = useCallback(() => getRealtimeStackedGrafiek(), []);

    const { data: latest } = usePolling(fetchLatest, 5000);
    const { data: prijs } = usePolling(fetchPrijs, 60000);
    const { data: zelfconsumptie } = usePolling(fetchZelfconsumptie, 5000);
    const { data: realtimeStacked, loading: realtimeLoading } = usePolling(fetchRealtimeStacked, 5000);

    const pvProductie = latest?.sb4_0_1av_41_879_pv_power ?? 0;
    const eigenVerbruik = latest?.zonnepaneel_eigen_verbruik ?? 0;
    const injectie = latest?.zonnepaneel_injectie ?? 0;
    const verbruikVanNet = latest?.verbruik_van_net ?? 0;
    const totaalVerbruik = latest?.totaal_verbruik ?? 0;
    const prijsNu = prijs?.prijs ?? 0;
    const zelfconsumptieNu = zelfconsumptie?.percentage ?? 0;

    const formatWatt = (w) => w >= 1000 ? `${(w / 1000).toFixed(2)}` : `${Math.round(w)}`;
    const formatWattUnit = (w) => w >= 1000 ? 'kW' : 'W';
    const realtimeData = realtimeStacked
        ? buildRealtimeChartData(realtimeStacked.injectie, realtimeStacked.eigenVerbruik, realtimeStacked.verbruikVanNet)
        : [];

    return (
        <div className="p-4">
            <PageHeader
                title="Overzicht"
                subtitle={new Date().toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            />

            {/* Realtime stat cards */}
            <div className="grid grid-cols-5 gap-3 mb-4">
                <StatCard
                    label="PV Productie"
                    value={formatWatt(pvProductie)}
                    unit={formatWattUnit(pvProductie)}
                    sub={`Zonne-energie`}
                    color="border-l-amber-400"
                    icon={<Sun size={14} />}
                />
                <StatCard
                    label="Eigen verbruik"
                    value={formatWatt(eigenVerbruik)}
                    unit={formatWattUnit(eigenVerbruik)}
                    sub="Van zonnepanelen"
                    color="border-l-green-500"
                    icon={<Zap size={14} />}
                />
                <StatCard
                    label="Injectie"
                    value={formatWatt(injectie)}
                    unit={formatWattUnit(injectie)}
                    sub="Naar net"
                    color="border-l-blue-500"
                    icon={<ArrowUpRight size={14} />}
                />
                <StatCard
                    label="Verbruik van net"
                    value={formatWatt(verbruikVanNet)}
                    unit={formatWattUnit(verbruikVanNet)}
                    sub={verbruikVanNet === 0 ? 'Volledig solar' : 'Van net'}
                    color="border-l-purple-500"
                    icon={<ArrowDownLeft size={14} />}
                />
                <StatCard
                    label="Totaal verbruik"
                    value={formatWatt(totaalVerbruik)}
                    unit={formatWattUnit(totaalVerbruik)}
                    sub="Huidig verbruik"
                    color="border-l-red-400"
                    icon={<Activity size={14} />}
                />
            </div>

            {/* Energiestroom */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-4">
                <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Energiestroom</div>
                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">☀️ Panelen</div>
                        <div className="font-medium text-amber-500">
                            {formatWatt(pvProductie)} {formatWattUnit(pvProductie)}
                        </div>
                    </div>
                    <div className="text-gray-300 dark:text-gray-600 text-lg">→</div>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">🏠 Huis</div>
                        <div className="font-medium text-green-500">
                            {formatWatt(eigenVerbruik)} {formatWattUnit(eigenVerbruik)}
                        </div>
                    </div>
                    <div className="text-gray-300 dark:text-gray-600 text-lg">↗</div>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">🔌 Injectie</div>
                        <div className="font-medium text-blue-500">
                            {formatWatt(injectie)} {formatWattUnit(injectie)}
                        </div>
                    </div>
                    <div className="text-gray-300 dark:text-gray-600 text-lg">+</div>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">🔌 Net import</div>
                        <div className="font-medium text-purple-500">
                            {formatWatt(verbruikVanNet)} {formatWattUnit(verbruikVanNet)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Real-time energy graph (last 5 minutes at 5-second resolution) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-4">
                <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    Energieverdeling - realtime (laatste 5 minuten)
                </div>
                {realtimeLoading ? (
                    <div className="h-48 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                        Laden...
                    </div>
                ) : realtimeData && realtimeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={realtimeData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                tickFormatter={(time) => {
                                    if (!time) return '';
                                    const date = new Date(time);
                                    return date.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                }}
                            />
                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} unit="W" />
                            <Tooltip
                                formatter={(val) => [`${Math.round(val ?? 0)} W`]}
                                labelFormatter={(label) => {
                                    if (!label) return '';
                                    const date = new Date(label);
                                    return date.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
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
                            <Area
                                type="monotone"
                                dataKey="injectie"
                                stackId="1"
                                stroke="#3b82f6"
                                fill="#bfdbfe"
                                name="Injectie"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-48 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                        Geen data beschikbaar
                    </div>
                )}
            </div>

            {/* Onderste rij */}
            <div className="grid grid-cols-3 gap-3">
                <StatCard
                    label="Zelfconsumptie nu"
                    value={zelfconsumptieNu.toFixed(1)}
                    unit="%"
                    sub={
                        <div className="mt-1">
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(zelfconsumptieNu, 100)}%` }}
                                />
                            </div>
                        </div>
                    }
                    color="border-l-green-500"
                />
                <StatCard
                    label="Prijs nu (Nordpool)"
                    value={prijsNu.toFixed(4)}
                    unit="€/kWh"
                    sub={prijsNu < 0 ? '⚡ Negatief tarief' : prijsNu < 0.1 ? '✅ Goedkoop' : '⚠️ Normaal tarief'}
                    color={prijsNu < 0 ? 'border-l-green-500' : prijsNu < 0.1 ? 'border-l-green-400' : 'border-l-amber-400'}
                    icon={<Euro size={14} />}
                />
                <div className="bg-amber-50 dark:bg-gray-800 rounded-xl border border-amber-100 dark:border-amber-900 p-4">
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">💡 Tip</div>
                    <div className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                        {prijsNu < 0
                            ? 'Negatieve prijs! Zet grote verbruikers aan zoals wasmachine of vaatwasser.'
                            : pvProductie > totaalVerbruik
                                ? 'Je produceert meer dan je verbruikt. Overweeg grote verbruikers in te plannen.'
                                : 'Verbruik is hoger dan productie. Bekijk de historiek voor optimalisatie.'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overzicht;