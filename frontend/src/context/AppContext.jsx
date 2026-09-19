import React, { createContext, useContext, useState, useEffect } from 'react';
import { LOCATIONS, DEFAULT_RISK_DATA, DISASTERS_LIST } from '../data/mockData';
import { fetchWeather, fetchRisk, evaluateAlert } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  
  // 1. LIVE RISK & WEATHER STATE (Strictly read-only from simulation views)
  const [liveWeatherData, setLiveWeatherData] = useState(null);
  const [liveWeatherStatus, setWeatherStatus] = useState('idle');
  const [liveWeatherError, setWeatherError] = useState(null);
  const [liveRiskResult, setLiveRiskResult] = useState(DEFAULT_RISK_DATA);
  const [liveRiskStatus, setLiveRiskStatus] = useState('idle');
  const [liveAlertNotice, setLiveAlertNotice] = useState(null);

  // 2. SIMULATION STATE (Initialized from a deep-copy snapshot of live baseline)
  const [simulationData, setSimulationData] = useState({
    rain: 120,
    river: 4.2,
    wind: 42,
    duration: 8,
    soil: 95,
    drainageBlocked: true,
  });
  const [simulationRiskResult, setSimulationRiskResult] = useState({
    simulationScore: 78,
    affectedCitizens: 38420,
    submergedRoadsKm: 19.4,
    floodedWards: 4,
    peakSurgeHours: 2.5,
  });

  const [disasters, setDisasters] = useState(DISASTERS_LIST);
  const [activeDisasterType, setActiveDisasterType] = useState('flood');
  const [layerVisibility, setLayerVisibility] = useState({
    riskVectors: true,
    dopplerMesh: true,
    riverBasins: true,
    evacuationRoutes: true,
    populationDensity: false,
    historicalFootprints: false,
  });
  const [vectorOpacity, setVectorOpacity] = useState(82);
  const [elevationSlice, setElevationSlice] = useState(185);
  const [autoSyncTime, setAutoSyncTime] = useState(15);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Critical Inundation Risk', location: 'Vellore Basin (Palar Surge)', time: '4m ago', level: 'danger', mode: 'LIVE' },
    { id: 2, title: 'Dam Sluice Gate Advisory', location: 'Ponnai Anicut Discharge +38%', time: '18m ago', level: 'warning', mode: 'LIVE' },
    { id: 3, title: 'Convective Cell Forecast', location: '115mm/18h Predicted Cloudburst', time: '35m ago', level: 'info', mode: 'LIVE' },
  ]);

  // Auto-sync countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoSyncTime((prev) => (prev > 1 ? prev - 1 : 15));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Live Weather & Dynamically Calculate Live Risk Score
  useEffect(() => {
    let active = true;
    setWeatherStatus('loading');
    setWeatherError(null);
    setLiveRiskStatus('loading');

    fetchWeather(selectedLocation.lat, selectedLocation.lng, selectedLocation.name)
      .then(async (wData) => {
        if (!active) return;
        setLiveWeatherData(wData);
        setWeatherStatus('success');

        // Extract observed live weather variables
        const liveRain = wData?.rainfall?.value != null ? Number(wData.rainfall.value) : 86.0;
        const liveWind = wData?.wind?.speed != null ? Number(wData.wind.speed) : 18.0;

        // Fetch dynamically calculated live risk from backend
        try {
          const liveRisk = await fetchRisk(selectedLocation.name, activeDisasterType, {
            lat: selectedLocation.lat,
            lon: selectedLocation.lng,
            rainfall: liveRain,
            windSpeed: liveWind,
          });

          if (!active) return;
          setLiveRiskResult(liveRisk);
          setLiveRiskStatus('success');

          // Check if live risk score crosses alert threshold (>= 80)
          if (liveRisk.compositeScore >= 80) {
            evaluateAlert(liveRisk.compositeScore, 'LIVE', selectedLocation.name, {
              rainfall: liveRain,
              source: liveRisk.source || 'Windy API',
            }).then((alertRes) => {
              if (alertRes?.triggered && alertRes?.alert) {
                const a = alertRes.alert;
                setLiveAlertNotice(a);
                addNotification({
                  title: a.alertType,
                  location: `${selectedLocation.name}`,
                  riskScore: a.riskScore,
                  threshold: a.threshold,
                  smsStatus: a.smsStatus,
                  recipient: a.smsRecipient,
                  timestamp: a.timestamp,
                  time: 'Just now',
                  level: 'danger',
                  mode: 'LIVE',
                  message: a.message,
                  disclaimer: a.disclaimer || 'AI-assisted risk estimate. Not an official emergency warning.',
                });
              }
            }).catch(() => {});
          } else {
            setLiveAlertNotice(null);
          }
        } catch (err) {
          if (!active) return;
          setLiveRiskStatus('error');
        }
      })
      .catch((error) => {
        if (!active) return;
        setWeatherError(error.message || 'Unable to load live weather data.');
        setWeatherStatus('error');
        setLiveRiskStatus('idle');
      });

    return () => { active = false; };
  }, [selectedLocation.id, selectedLocation.lat, selectedLocation.lng, selectedLocation.name, activeDisasterType]);

  // Deep copy / snapshot reset: resets simulationData from live baseline without modifying live state
  const resetSimulationToLiveSnapshot = () => {
    const liveRain = liveWeatherData?.rainfall?.value != null ? Number(liveWeatherData.rainfall.value) : 86;
    const liveWind = liveWeatherData?.wind?.speed != null ? Number(liveWeatherData.wind.speed) : 18;

    const snapshot = {
      rain: liveRain,
      river: 3.4,
      wind: liveWind,
      duration: 4,
      soil: 72,
      drainageBlocked: false,
    };
    setSimulationData(structuredClone(snapshot));
    return snapshot;
  };

  // Mutates ONLY simulation state; NEVER touches live state
  const updateSimulationParams = (newParams) => {
    setSimulationData((prev) => ({ ...prev, ...newParams }));
  };

  const toggleLayer = (layerKey) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  const addNotification = (notif) => {
    setNotifications((prev) => [
      { id: Date.now(), time: 'Just now', ...notif },
      ...prev,
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        locations: LOCATIONS,
        selectedLocation,
        setSelectedLocation,
        // LIVE STATE (Exposed read-only)
        liveWeatherData,
        weatherData: liveWeatherData, // backward-compat alias
        weatherStatus: liveWeatherStatus,
        weatherError: liveWeatherError,
        liveRiskResult,
        riskData: liveRiskResult, // backward-compat alias for live dashboard & map
        liveRiskStatus,
        liveAlertNotice,
        // SIMULATION STATE (Independent)
        simulationData,
        updateSimulationParams,
        simulationRiskResult,
        setSimulationRiskResult,
        resetSimulationToLiveSnapshot,
        // Shared configuration
        disasters,
        setDisasters,
        activeDisasterType,
        setActiveDisasterType,
        layerVisibility,
        toggleLayer,
        vectorOpacity,
        setVectorOpacity,
        elevationSlice,
        setElevationSlice,
        autoSyncTime,
        notifications,
        addNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
