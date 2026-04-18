import axios from 'axios';

/**
 * Base API client configured for the Spring Boot backend.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status === 502) {
            error.message = 'Backend tijdelijk onbereikbaar (502). Opnieuw proberen...';
        } else if (status && status >= 500) {
            error.message = `Serverfout (${status}). Opnieuw proberen...`;
        } else if (!error?.response) {
            error.message = 'Netwerkfout. Controleer backend/connectie.';
        }
        return Promise.reject(error);
    }
);

/**
 * Fetches the latest real-time sensor values.
 */
export const getLatest = () => api.get('/latest');

/**
 * Fetches backend and Influx health status.
 */
export const getHealth = () => api.get('/health');

/**
 * Fetches 5-second resolution real-time energy data for the last N minutes.
 * @param {number} minutes - time window in minutes (default 30)
 */
export const getRealtimeData = (minutes = 30) => api.get('/realtime', { params: { minutes } });

/**
 * Fetches the current Nordpool electricity price.
 */
export const getPrijsNu = () => api.get('/prijs/nu');

/**
 * Fetches the current self-consumption rate.
 */
export const getZelfconsumptieNu = () => api.get('/zelfconsumptie/nu');

/**
 * Fetches all key stats for a given period.
 * @param {string} range - e.g. '-1d', '-1w', '-30d'
 */
export const getStats = (range = '-1d') => api.get('/stats', { params: { range } });

/**
 * Fetches stacked chart data for a given period.
 * @param {string} range - e.g. '-1d', '-1w'
 */
export const getStackedGrafiek = (range = '-1d') => api.get('/grafiek/stacked', { params: { range } });

/**
 * Fetches realtime stacked chart data (last 5 minutes, 5-second resolution).
 */
export const getRealtimeStackedGrafiek = () => api.get('/grafiek/realtime-stacked');

/**
 * Fetches PV versus total consumption chart data.
 * @param {string} range - e.g. '-1d', '-1w'
 */
export const getPvVersusVerbruik = (range = '-1d') => api.get('/grafiek/pv-versus-verbruik', { params: { range } });

/**
 * Fetches hourly Nordpool price history.
 * @param {string} range - e.g. '-1d', '-1w'
 */
export const getNordpoolHistoriek = (range = '-1d') => api.get('/grafiek/nordpool', { params: { range } });

/**
 * Fetches daily PV production totals.
 * @param {string} range - e.g. '-30d', '-90d'
 */
export const getDagelijkseProductie = (range = '-30d') => api.get('/grafiek/dagelijkse-productie', { params: { range } });

/**
 * Fetches gas consumption for a given period.
 * @param {string} range - e.g. '-1d', '-1w', '-30d'
 */
export const getGas = (range = '-1d') => api.get('/gas', { params: { range } });