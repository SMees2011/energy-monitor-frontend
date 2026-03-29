import { useState, useEffect, useCallback } from 'react';

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

    const fetch = useCallback(async () => {
        try {
            const response = await fetchFn();
            setData(response.data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchFn]);

    useEffect(() => {
        fetch();
        const timer = setInterval(fetch, interval);
        return () => clearInterval(timer);
    }, [fetch, interval]);

    return { data, loading, error };
};