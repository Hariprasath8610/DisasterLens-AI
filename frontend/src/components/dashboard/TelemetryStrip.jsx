import React from 'react';
import { CloudRain, CloudLightning, Waves, Thermometer, Wind } from 'lucide-react';
import TelemetryCard from '../common/TelemetryCard';
import { useApp } from '../../context/AppContext';

export default function TelemetryStrip() {
  const { weatherData, weatherStatus, weatherError } = useApp();
  const isLoading = weatherStatus === 'loading';
  const valueOrNA = (value) => (value === null || value === undefined ? 'N/A' : value);
  const timestamp = weatherData?.timestamp
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(weatherData.timestamp))
    : null;
  const statusLabel = isLoading
    ? 'Loading live forecast…'
    : weatherStatus === 'error'
      ? weatherError
      : 'Live weather forecast powered by Windy API';

  return (
    <section aria-label="Live weather forecast">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
        <span className={`type-label ${weatherStatus === 'error' ? 'text-error' : 'text-secondary'}`}>{statusLabel}</span>
        {timestamp && <span className="type-data">Updated {timestamp} · {weatherData.source}</span>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <TelemetryCard
          title="Rainfall"
          value={isLoading ? '—' : valueOrNA(weatherData?.rainfall?.value)}
          unit={weatherData?.rainfall?.unit}
          icon={CloudRain}
          delta={weatherData?.rainfall?.period}
          deltaType="neutral"
          subtext={weatherStatus === 'error' ? 'Live value unavailable' : 'API precipitation accumulation'}
        />
        <TelemetryCard
          title="Temperature"
          value={isLoading ? '—' : valueOrNA(weatherData?.weather?.temp)}
          unit={weatherData?.weather?.unit}
          icon={Thermometer}
          delta={weatherData?.weather?.dewpoint !== null && weatherData?.weather?.dewpoint !== undefined ? `Dew ${weatherData.weather.dewpoint}°C` : undefined}
          deltaType="neutral"
          subtext={`Humidity ${valueOrNA(weatherData?.weather?.humidity)}${weatherData?.weather?.humidityUnit || ''}`}
        />
        <TelemetryCard
          title="Wind Speed"
          value={isLoading ? '—' : valueOrNA(weatherData?.wind?.speed)}
          unit={weatherData?.wind?.unit}
          icon={Wind}
          subtext={weatherStatus === 'error' ? 'Live value unavailable' : 'Surface wind vector'}
        />
        <TelemetryCard
          title="Wind Gusts"
          value={isLoading ? '—' : valueOrNA(weatherData?.wind?.gusts)}
          unit={weatherData?.wind?.unit}
          icon={CloudLightning}
          subtext={weatherStatus === 'error' ? 'Live value unavailable' : 'Forecast surface gusts'}
        />
        <TelemetryCard
          title="Pressure"
          value={isLoading ? '—' : valueOrNA(weatherData?.weather?.pressure)}
          unit={weatherData?.weather?.pressureUnit}
          icon={Waves}
          subtext={weatherStatus === 'error' ? 'Live value unavailable' : 'Surface atmospheric pressure'}
        />
      </div>
    </section>
  );
}
