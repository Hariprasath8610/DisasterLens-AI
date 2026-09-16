import React, { createContext, useContext, useState, useEffect } from 'react';
import { LOCATIONS, DEFAULT_RISK_DATA, DISASTERS_LIST } from '../data/mockData';
import { fetchWeather } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [riskData, setRiskData] = useState(DEFAULT_RISK_DATA);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState('idle');
  const [weatherError, setWeatherError] = useState(null);
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
    { id: 1, title: 'Critical Inundation Risk', location: 'Vellore Basin (Palar Surge)', time: '4m ago', level: 'danger' },
    { id: 2, title: 'Dam Sluice Gate Advisory', location: 'Ponnai Anicut Discharge +38%', time: '18m ago', level: 'warning' },
    { id: 3, title: 'Convective Cell Forecast', location: '115mm/18h Predicted Cloudburst', time: '35m ago', level: 'info' },
  ]);

  // Auto-sync countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoSyncTime((prev) => (prev > 1 ? prev - 1 : 15));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    setWeatherStatus('loading');
    setWeatherError(null);
    setWeatherData(null);
    fetchWeather(selectedLocation.lat, selectedLocation.lng, selectedLocation.name)
      .then((data) => {
        if (!active) return;
        setWeatherData(data);
        setWeatherStatus('success');
      })
      .catch((error) => {
        if (!active) return;
        setWeatherError(error.message || 'Unable to load live weather data.');
        setWeatherStatus('error');
      });
    return () => { active = false; };
  }, [selectedLocation.id, selectedLocation.lat, selectedLocation.lng, selectedLocation.name]);

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
        riskData,
        setRiskData,
        weatherData,
        weatherStatus,
        weatherError,
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
