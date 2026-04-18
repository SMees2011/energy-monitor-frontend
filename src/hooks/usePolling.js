import { useState, useEffect } from 'react';

/**
 * Custom hook that polls a data fetching function at a given interval.
 *
 * @param {Function} fetchFn - async function that returns data
 * @param {number} interval - polling interval in milliseconds (default 5000)
 * @returns {{ data, loading, error }}
 */
export const usePolling = (fetchFn, interval = 5000) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        let timerId = null;
        let consecutiveTransientErrors = 0;

        const MAX_BACKOFF_MS = 30000;

        const isTransientError = (err) => {
            const status = err?.response?.status;
            // Treat upstream/temporary failures as transient.
            return !status || status >= 500;
        };

        const scheduleNext = (delayMs) => {
            if (!active) {
                return;
            }
            timerId = setTimeout(tick, delayMs);
        };

        const tick = async () => {
            try {
                const response = await fetchFn();
                if (!active) {
                    return;
                }

                setData(response.data);
                setError(null);
                consecutiveTransientErrors = 0;
                setLoading(false);
                scheduleNext(interval);
            } catch (err) {
                if (!active) {
                    return;
                }

                setError(err?.message || 'Onbekende fout');
                setLoading(false);

                if (isTransientError(err)) {
                    consecutiveTransientErrors += 1;
                } else {
                    consecutiveTransientErrors = 0;
                }

                const transientMultiplier = Math.min(2 ** consecutiveTransientErrors, 32);
                const nextDelay = Math.min(interval * transientMultiplier, MAX_BACKOFF_MS);
                scheduleNext(nextDelay);
            }
        };

        // Kick off immediately, then adaptively back off on transient errors.
        tick();

        return () => {
            active = false;
            if (timerId) {
                clearTimeout(timerId);
            }
        };
    }, [fetchFn, interval]);

    return { data, loading, error };
};