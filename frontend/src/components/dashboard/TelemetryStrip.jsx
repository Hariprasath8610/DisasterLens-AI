import React from 'react';
import { CloudRain, CloudLightning, Waves, Thermometer, Wind } from 'lucide-react';
import TelemetryCard from '../common/TelemetryCard';
import { useApp } from '../../context/AppContext';

export default function TelemetryStrip() {
  const { riskData } = useApp();
  const { telemetry } = riskData;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Rainfall */}
      <TelemetryCard
        title="Rainfall"
        value={telemetry.rainfall.value}
        unit={telemetry.rainfall.unit}
        icon={CloudRain}
        delta={telemetry.rainfall.delta}
        deltaType="danger"
        trend={telemetry.rainfall.trend}
        subtext={telemetry.rainfall.subtext}
      />

      {/* 2. Forecast */}
      <TelemetryCard
        title="Forecast"
        value={telemetry.forecast.condition}
        icon={CloudLightning}
        delta={`+${telemetry.forecast.expectedMm}mm/18h`}
        deltaType="danger"
        progress={telemetry.forecast.confidence}
        progressColor="bg-primary-container"
        subtext={`Confidence ${telemetry.forecast.confidence}% · ${telemetry.forecast.timeframe}`}
      />

      {/* 3. River Level */}
      <TelemetryCard
        title="River Level"
        value={telemetry.riverLevel.value}
        unit={telemetry.riverLevel.unit}
        icon={Waves}
        delta={`Alert ${telemetry.riverLevel.alert}m`}
        deltaType="warning"
        progress={telemetry.riverLevel.capacityPercent}
        progressColor="bg-secondary"
        subtext={`Status: ${telemetry.riverLevel.status} (${telemetry.riverLevel.capacityPercent}% Cap)`}
      />

      {/* 4. Temperature & Humidity */}
      <TelemetryCard
        title="Temperature"
        value={`${telemetry.weather.temp}°C`}
        icon={Thermometer}
        delta={`Dew ${telemetry.weather.dew}°C`}
        deltaType="neutral"
        progress={telemetry.weather.humidity}
        progressColor="bg-teal-500"
        subtext={`Humidity ${telemetry.weather.humidity}% · High Saturation`}
      />

      {/* 5. Wind Vector */}
      <TelemetryCard
        title="Wind Vector"
        value={telemetry.wind.speed}
        unit={telemetry.wind.unit}
        icon={Wind}
        delta={telemetry.wind.direction}
        deltaType="neutral"
        progress={(telemetry.wind.gusts / 100) * 100}
        progressColor="bg-slate-500"
        subtext={`Gusts ${telemetry.wind.gusts} km/h · ${telemetry.wind.subtext}`}
      />
    </div>
  );
}
