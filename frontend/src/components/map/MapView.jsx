import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, ZoomIn, ZoomOut, Maximize2, Locate, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';

// Helper component to center map smoothly when selected location changes
function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Custom HTML DivIcons matching the Stitch pulsing design
const createPulsingIcon = (color = '#ba1a1a', label = 'Critical Zone', pulse = true) => {
  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
        ${pulse ? `<div class="absolute w-10 h-10 rounded-full animate-ping opacity-35" style="background-color: ${color}"></div>` : ''}
        <div class="w-7 h-7 rounded-full bg-white shadow-md border-2 flex items-center justify-center" style="border-color: ${color}">
          <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
        </div>
        <div class="absolute left-8 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-slate-200 whitespace-nowrap pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
          <span class="font-sans text-[11px] font-semibold text-slate-800">${label}</span>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export default function MapView({ height = '100%', className = '', showControls = true, interactiveLayers = true }) {
  const { selectedLocation, setSelectedLocation, locations, riskData, layerVisibility, vectorOpacity } = useApp();
  const [zoomLevel, setZoomLevel] = useState(12);
  const [mapInstance, setMapInstance] = useState(null);

  const centerCoords = [selectedLocation.lat, selectedLocation.lng];

  // Mock GIS Risk Geometry: Palar River Basin & Ward Inundation Polygons (around Vellore 12.34°N, 79.13°E)
  const palarBasinPolygon = [
    [12.385, 79.080],
    [12.365, 79.115],
    [12.340, 79.130],
    [12.315, 79.165],
    [12.290, 79.195],
    [12.280, 79.185],
    [12.305, 79.140],
    [12.330, 79.105],
    [12.355, 79.070],
  ];

  // Critical Inundation Pocket (Katpadi Sector)
  const katpadiInundationPolygon = [
    [12.358, 79.120],
    [12.370, 79.135],
    [12.362, 79.155],
    [12.348, 79.145],
    [12.345, 79.128],
  ];

  // Ranipet Moderate Runoff Zone
  const ranipetPolygon = [
    [12.320, 79.160],
    [12.335, 79.190],
    [12.310, 79.205],
    [12.295, 79.175],
  ];

  const handleLocateMe = () => {
    if (navigator.geolocation && mapInstance) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          mapInstance.flyTo([latitude, longitude], 13);
        },
        (err) => {
          console.warn('Geolocation denied or unavailable. Fallback to Vellore center.', err);
        }
      );
    }
  };

  const handleZoomIn = () => {
    if (mapInstance) mapInstance.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstance) mapInstance.zoomOut();
  };

  const handleResetNorth = () => {
    if (mapInstance) {
      mapInstance.flyTo(centerCoords, 12);
    }
  };

  return (
    <div className={`relative w-full overflow-hidden bg-slate-100 rounded-xl ${className}`} style={{ height }}>
      {/* Top Map HUD Bar with Live Risk & Source Metadata */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-outline-variant/40 shadow-md flex flex-wrap items-center gap-2 font-mono text-[11px] text-on-surface select-none">
        <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
        <span className="font-bold text-primary">LIVE MAP</span>
        <span className="text-outline-variant">|</span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedLocation.name}</span>
        <span className="text-outline-variant">|</span>
        <span className="text-slate-600 dark:text-slate-400">
          Source: {riskData.source || 'Windy API'}
        </span>
        <span className="text-outline-variant">|</span>
        <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
          Mode: {riskData.mode || 'LIVE'}
        </span>
        <span className="text-outline-variant">|</span>
        <span className="font-bold text-error">
          Live Risk Score: {riskData.compositeScore}/100
        </span>
        <span className="text-outline-variant">|</span>
        <span className="px-1.5 py-0.2 rounded bg-error-container text-on-error-container font-semibold">
          {riskData.tier}
        </span>
      </div>

      {/* Real Leaflet Map */}
      <MapContainer
        center={centerCoords}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full"
        ref={setMapInstance}
      >
        <MapViewController center={centerCoords} zoom={zoomLevel} />

        {/* Clean OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.92}
        />

        {/* Risk Overlays */}
        {layerVisibility.riskVectors && (
          <>
            {/* Palar River Corridor Surge Gradient */}
            <Polygon
              positions={palarBasinPolygon}
              pathOptions={{
                color: '#ba1a1a',
                weight: 2,
                dashArray: '4, 4',
                fillColor: '#ba1a1a',
                fillOpacity: (vectorOpacity / 100) * 0.28,
              }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <div className="flex items-center gap-1 font-bold text-red-700">
                    <AlertTriangle className="w-3.5 h-3.5" /> Palar River Surge Vector
                  </div>
                  <p className="mt-1 text-slate-600">Discharge surging +38%. Water level at 3.4m (threshold 3.8m).</p>
                </div>
              </Popup>
            </Polygon>

            {/* Katpadi Critical Inundation Pocket */}
            <Polygon
              positions={katpadiInundationPolygon}
              pathOptions={{
                color: '#ea580c',
                weight: 2,
                fillColor: '#ea580c',
                fillOpacity: (vectorOpacity / 100) * 0.35,
              }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <span className="font-bold text-orange-700 block">Katpadi Sector (Critical Runoff)</span>
                  <span className="text-slate-600 text-[11px]">Submersion hazard in low-lying railway underpasses.</span>
                </div>
              </Popup>
            </Polygon>

            {/* Ranipet Moderate Runoff Zone */}
            <Polygon
              positions={ranipetPolygon}
              pathOptions={{
                color: '#007b8c',
                weight: 1.5,
                fillColor: '#00ccf9',
                fillOpacity: (vectorOpacity / 100) * 0.25,
              }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <span className="font-bold text-teal-800 block">Ranipet Basin</span>
                  <span className="text-slate-600 text-[11px]">Moderate drainage backlog.</span>
                </div>
              </Popup>
            </Polygon>
          </>
        )}

        {/* Doppler Rainfall Mesh Buffer (Radial Circle Overlay) */}
        {layerVisibility.dopplerMesh && (
          <Circle
            center={[12.35, 79.135]}
            radius={4500}
            pathOptions={{
              color: '#00ccf9',
              weight: 1,
              dashArray: '3, 4',
              fillColor: '#00ccf9',
              fillOpacity: 0.12,
            }}
          />
        )}

        {/* Location Markers with Custom Pulsing Beacons */}
        {locations.map((loc) => {
          const isSelected = loc.id === selectedLocation.id;
          const markerColor = isSelected ? '#ba1a1a' : '#00677f';
          return (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={createPulsingIcon(markerColor, loc.name, isSelected)}
              eventHandlers={{
                click: () => {
                  setSelectedLocation(loc);
                },
              }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs min-w-[160px]">
                  <h4 className="font-bold text-slate-900">{loc.name}</h4>
                  <p className="text-slate-500 text-[10px] uppercase font-mono">{loc.catchment}</p>
                  <div className="mt-2 pt-1 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-[11px] text-slate-600">Risk Score:</span>
                    <span className="font-mono font-bold text-red-600">
                      {isSelected ? riskData.compositeScore : 48} / 100
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Controls (Zoom, Reset North, Locate) */}
      {showControls && (
        <div className="absolute right-4 bottom-4 z-[400] flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-outline-variant/30 shadow-md">
          <button
            onClick={handleZoomIn}
            className="icon-button w-8 h-8 text-slate-700 hover:bg-slate-100 hover:text-primary"
            title="Zoom In"
            type="button"
          >
            <Icon icon={ZoomIn} size="inline" />
          </button>
          <button
            onClick={handleZoomOut}
            className="icon-button w-8 h-8 text-slate-700 hover:bg-slate-100 hover:text-primary"
            title="Zoom Out"
            type="button"
          >
            <Icon icon={ZoomOut} size="inline" />
          </button>
          <div className="w-full h-px bg-slate-200 my-0.5" />
          <button
            onClick={handleResetNorth}
            className="icon-button w-8 h-8 text-slate-700 hover:bg-slate-100 hover:text-primary"
            title="Reset to Active Center"
            type="button"
          >
            <Icon icon={Navigation} size="inline" />
          </button>
          <button
            onClick={handleLocateMe}
            className="icon-button w-8 h-8 text-slate-700 hover:bg-slate-100 hover:text-primary"
            title="Locate Current Position"
            type="button"
          >
            <Icon icon={Locate} size="inline" />
          </button>
        </div>
      )}

      {/* Map Legend (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-[400] hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-outline-variant/30 shadow-xs font-mono text-[10px] text-slate-600 select-none">
        <span className="font-semibold text-slate-900">HAZARD TIERS:</span>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Low</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-amber-500" /> Mod</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-orange-500" /> High Runoff</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-red-600" /> Inundation</div>
      </div>
    </div>
  );
}
