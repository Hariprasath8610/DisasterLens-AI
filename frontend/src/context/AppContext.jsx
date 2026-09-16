import React, { createContext, useContext, useState, useEffect } from 'react';
import { LOCATIONS, DEFAULT_RISK_DATA, DISASTERS_LIST } from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [riskData, setRiskData] = useState(DEFAULT_RISK_DATA);
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
