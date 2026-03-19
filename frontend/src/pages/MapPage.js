import React, { useEffect, useRef, useState, useCallback } from 'react';
import Navbar from '../components/Layout/Navbar';
import BottomNav from '../components/Layout/BottomNav';
import { useLocation } from '../hooks/useLocation';
import { zoneAPI, routeAPI } from '../utils/api';
import './MapPage.css';

const GOOGLE_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;
const DEFAULT_CENTER = { lat: 23.5204, lng: 87.3119 }; // NSHM campus

const RISK_COLORS = {
  safe: '#16A34A',
  moderate: '#D97706',
  high: '#DC2626',
  critical: '#FF1A1A',
};

const getRiskBadgeCls = (score) => {
  if (score < 35) return 'safe';
  if (score < 60) return 'moderate';
  if (score < 75) return 'high';
  return 'critical';
};

// ── Route Card ──
const RouteCard = ({ route, selected, onSelect }) => {
  const cls = getRiskBadgeCls(route.riskScore);
  return (
    <div
      className={`route-card ${selected ? 'selected' : ''} ${route.recommended ? 'recommended' : ''}`}
      onClick={() => onSelect(route)}
    >
      {route.recommended && <div className="route-recommended-tag">✦ SAFEST ROUTE</div>}
      <div className="route-card-body">
        <div className={`route-icon-wrap ${cls}`}>
          {cls === 'safe'
            ? <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            : cls === 'moderate'
              ? <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
              : <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          }
        </div>
        <div className="route-info">
          <div className="route-name">{route.summary}</div>
          <div className="route-meta">{route.distance} · {route.duration} · Risk: {route.riskScore}/100</div>
        </div>
        <div className={`badge badge-${cls}`}>{cls.toUpperCase()}</div>
      </div>
    </div>
  );
};

// ── Map Legend ──
const MapLegend = () => (
  <div className="map-legend">
    {Object.entries(RISK_COLORS).map(([k, v]) => (
      <div key={k} className="legend-item">
        <div className="legend-dot" style={{ background: v }} />
        <span>{k.charAt(0).toUpperCase() + k.slice(1)}</span>
      </div>
    ))}
  </div>
);

const MapPage = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeRendererRef = useRef(null);

  const { lat, lng, permission, requestLocation } = useLocation();
  const [zones, setZones] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [destination, setDestination] = useState('');
  const [activeTab, setActiveTab] = useState('map'); // map | routes

  // Load Google Maps script
  useEffect(() => {
    if (!GOOGLE_KEY || GOOGLE_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
      setMapLoaded(true); // Use fallback canvas map
      return;
    }
    if (window.google?.maps) { setMapLoaded(true); return; }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places,geometry`;
    script.async = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Load zones
  useEffect(() => {
    zoneAPI.getAll()
      .then(({ data }) => setZones(data.zones || []))
      .catch(() => {
        // Fallback NSHM zones
        setZones([
          { _id: '1', areaName: 'NSHM Main Gate', lat: 23.5204, lng: 87.3119, baseRiskScore: 25, riskLevel: 'safe' },
          { _id: '2', areaName: 'Hostel Road', lat: 23.5198, lng: 87.3105, baseRiskScore: 45, riskLevel: 'moderate' },
          { _id: '3', areaName: 'Market Area', lat: 23.5215, lng: 87.3142, baseRiskScore: 50, riskLevel: 'moderate' },
          { _id: '4', areaName: 'Durgapur Station Road', lat: 23.5187, lng: 87.3088, baseRiskScore: 60, riskLevel: 'moderate' },
          { _id: '5', areaName: 'Isolated Bypass', lat: 23.5172, lng: 87.3065, baseRiskScore: 80, riskLevel: 'critical' },
          { _id: '6', areaName: 'Industrial Stretch', lat: 23.5231, lng: 87.3158, baseRiskScore: 75, riskLevel: 'high' },
          { _id: '7', areaName: 'Dark Side Streets', lat: 23.5193, lng: 87.3132, baseRiskScore: 70, riskLevel: 'high' },
        ]);
      });
  }, []);

  // Initialize map when loaded + zones ready
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    if (!window.google?.maps) {
      renderFallbackMap();
      return;
    }

    const center = { lat: lat || DEFAULT_CENTER.lat, lng: lng || DEFAULT_CENTER.lng };
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      styles: getDarkMapStyles(),
      disableDefaultUI: true,
      gestureHandling: 'greedy',
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
    });
    mapInstanceRef.current = map;

    // User marker
    if (lat && lng) {
      new window.google.maps.Marker({
        position: { lat, lng },
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: 'Your Location',
      });
    }

    // Zone markers
    zones.forEach((zone) => {
      const color = RISK_COLORS[zone.riskLevel] || '#D97706';
      const circle = new window.google.maps.Circle({
        center: { lat: zone.lat, lng: zone.lng },
        radius: 200,
        fillColor: color,
        fillOpacity: 0.18,
        strokeColor: color,
        strokeOpacity: 0.6,
        strokeWeight: 1.5,
        map,
      });

      const marker = new window.google.maps.Marker({
        position: { lat: zone.lat, lng: zone.lng },
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 1.5,
        },
        title: zone.areaName,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="background:#1C2433;color:#E2E8F0;padding:10px;border-radius:8px;font-family:sans-serif;min-width:160px">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px">${zone.areaName}</div>
          <div style="font-size:11px;color:#94A3B8">Risk Score: <span style="color:${color};font-weight:700">${zone.baseRiskScore}/100</span></div>
          <div style="font-size:11px;color:#94A3B8;margin-top:2px">${zone.riskLevel.toUpperCase()}</div>
        </div>`,
      });

      marker.addListener('click', () => infoWindow.open(map, marker));
      markersRef.current.push(marker, circle);
    });

    routeRendererRef.current = new window.google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#3B82F6', strokeWeight: 4, strokeOpacity: 0.8 },
    });
  }, [mapLoaded, zones, lat, lng]);

  // Draw selected route on map
  useEffect(() => {
    if (!selectedRoute || !window.google?.maps || !mapInstanceRef.current) return;
    if (!selectedRoute.polyline) return;

    const decoded = window.google.maps.geometry.encoding.decodePath(selectedRoute.polyline);
    routeRendererRef.current?.setDirections(null);

    const routeColor = selectedRoute.riskScore < 35 ? '#16A34A' : selectedRoute.riskScore < 60 ? '#D97706' : '#DC2626';
    new window.google.maps.Polyline({
      path: decoded,
      map: mapInstanceRef.current,
      strokeColor: routeColor,
      strokeWeight: 5,
      strokeOpacity: 0.85,
    });
  }, [selectedRoute]);

  const handleGetRoutes = useCallback(async () => {
    if (!destination.trim()) return;
    setLoadingRoutes(true);
    try {
      const oLat = lat || DEFAULT_CENTER.lat;
      const oLng = lng || DEFAULT_CENTER.lng;
      const { data } = await routeAPI.getSafeRoutes(oLat, oLng, 23.515, 87.32);
      setRoutes(data.routes || []);
      setActiveTab('routes');
    } catch {
      setRoutes([]);
    }
    setLoadingRoutes(false);
  }, [destination, lat, lng]);

  // Fallback canvas map
  const renderFallbackMap = () => {
    if (!mapRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = mapRef.current.offsetWidth;
    canvas.height = mapRef.current.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0D1B2A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Grid
    ctx.strokeStyle = 'rgba(59,130,246,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    // Roads
    ctx.strokeStyle = 'rgba(59,130,246,0.15)'; ctx.lineWidth = 2;
    [[0, canvas.height * 0.35, canvas.width, canvas.height * 0.35],
     [0, canvas.height * 0.6, canvas.width, canvas.height * 0.6],
     [canvas.width * 0.3, 0, canvas.width * 0.3, canvas.height],
     [canvas.width * 0.65, 0, canvas.width * 0.65, canvas.height]
    ].forEach(([x1, y1, x2, y2]) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); });
    // Zone dots
    const pts = [
      { x: 0.48, y: 0.30, color: '#16A34A' },
      { x: 0.28, y: 0.52, color: '#D97706' },
      { x: 0.65, y: 0.60, color: '#D97706' },
      { x: 0.78, y: 0.70, color: '#DC2626' },
      { x: 0.15, y: 0.22, color: '#FF1A1A' },
      { x: 0.82, y: 0.45, color: '#DC2626' },
    ];
    pts.forEach(({ x, y, color }) => {
      ctx.beginPath();
      ctx.arc(canvas.width * x, canvas.height * y, 7, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    // User dot
    ctx.beginPath();
    ctx.arc(canvas.width * 0.48, canvas.height * 0.30, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#3B82F6';
    ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    mapRef.current.appendChild(canvas);
    mapRef.current.style.overflow = 'hidden';
  };

  return (
    <div className="page-map">
      <Navbar title="SURAKSHA" rightContent={
        <button className="nav-icon-btn" onClick={requestLocation} title="Refresh location">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      } />

      <div className="map-tabs">
        <button className={`map-tab ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>Risk Map</button>
        <button className={`map-tab ${activeTab === 'routes' ? 'active' : ''}`} onClick={() => setActiveTab('routes')}>Safe Routes</button>
      </div>

      <div className="scroll-area" style={{ paddingBottom: 100 }}>
        {/* Map container */}
        <div className="map-container">
          <div ref={mapRef} className="map-canvas" />
          {!mapLoaded && (
            <div className="map-loading">
              <div className="spinner" />
              <span>Loading map…</span>
            </div>
          )}
          <MapLegend />
        </div>

        {activeTab === 'map' && (
          <div className="zone-list animate-slideUp">
            <div className="section-label" style={{ marginTop: 16 }}>NSHM ZONE RISK LEVELS</div>
            {zones.map((zone) => {
              const cls = getRiskBadgeCls(zone.baseRiskScore);
              const color = RISK_COLORS[zone.riskLevel] || '#D97706';
              return (
                <div key={zone._id} className="zone-list-item">
                  <div className="zone-list-dot" style={{ background: color }} />
                  <div className="zone-list-info">
                    <div className="zone-list-name">{zone.areaName}</div>
                    {zone.reason && <div className="zone-list-reason">{zone.reason}</div>}
                  </div>
                  <div className={`badge badge-${cls}`}>{zone.baseRiskScore}</div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="routes-section animate-slideUp">
            <div className="route-input-row">
              <input
                className="input-field"
                placeholder="Enter destination…"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGetRoutes()}
              />
              <button
                className="btn btn-pink"
                style={{ width: 'auto', padding: '0 20px', flexShrink: 0 }}
                onClick={handleGetRoutes}
                disabled={loadingRoutes || !destination}
              >
                {loadingRoutes ? <div className="spinner" /> : 'Go'}
              </button>
            </div>

            {routes.length > 0 ? (
              <div className="routes-list">
                <div className="section-label">ROUTES BY SAFETY</div>
                {routes.map((r) => (
                  <RouteCard
                    key={r.id}
                    route={r}
                    selected={selectedRoute?.id === r.id}
                    onSelect={setSelectedRoute}
                  />
                ))}
              </div>
            ) : (
              !loadingRoutes && (
                <div className="routes-empty">
                  <div className="routes-empty-icon">🗺</div>
                  <div>Enter a destination to find the safest route</div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

// Google Maps dark theme styles
const getDarkMapStyles = () => [
  { elementType: 'geometry', stylers: [{ color: '#0D1B2A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0D1B2A' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94A3B8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1C2433' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#111827' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1D4ED8' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#0F1729' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0B1220' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

export default MapPage;
