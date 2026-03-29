import { useEffect, useState } from 'react';
import { Server } from 'lucide-react';
import { getHealth } from '../../services/api';

const HEALTH_POLL_INTERVAL_MS = 15000;

/**
 * Compact sidebar icon that reflects backend/Influx connectivity status.
 */
const BackendStatusIcon = () => {
  const [status, setStatus] = useState({
    level: 'loading',
    text: 'Backendstatus controleren...'
  });

  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const response = await getHealth();
        const health = response.data || {};
        const influxStatus = health.influxStatus || 'UP';

        if (!active) {
          return;
        }

        if (influxStatus === 'UP') {
          setStatus({ level: 'ok', text: 'Backend online, InfluxDB verbonden' });
          return;
        }

        if (influxStatus === 'AUTH_ERROR') {
          setStatus({ level: 'warn', text: 'Backend online, Influx token ongeldig of onvoldoende rechten' });
          return;
        }

        setStatus({ level: 'warn', text: 'Backend online, InfluxDB tijdelijk onbereikbaar' });
      } catch (error) {
        if (!active) {
          return;
        }

        const influxStatus = error?.response?.data?.influxStatus;
        if (influxStatus === 'AUTH_ERROR') {
          setStatus({ level: 'warn', text: 'Backend online, Influx token ongeldig of onvoldoende rechten' });
          return;
        }

        setStatus({ level: 'error', text: 'Backend niet bereikbaar vanaf frontend' });
      }
    };

    poll();
    const timer = setInterval(poll, HEALTH_POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const colorByLevel = {
    loading: 'text-gray-400',
    ok: 'text-emerald-500',
    warn: 'text-amber-500',
    error: 'text-rose-500'
  };

  const pulseByLevel = {
    loading: '',
    ok: 'animate-pulse',
    warn: '',
    error: ''
  };

  return (
    <div className="flex items-center gap-2" title={status.text} aria-label={status.text}>
      <Server size={14} className={`${colorByLevel[status.level]} ${pulseByLevel[status.level]}`} />
      <span className="text-xs text-gray-400 dark:text-gray-500">API status</span>
    </div>
  );
};

export default BackendStatusIcon;
