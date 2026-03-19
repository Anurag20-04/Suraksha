import { useState, useEffect, useCallback } from 'react';

export const useLocation = () => {
  const [location, setLocation] = useState({ lat: null, lng: null, address: '', error: null, loading: false });
  const [permission, setPermission] = useState('unknown'); // unknown | granted | denied

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation((p) => ({ ...p, error: 'Geolocation not supported' }));
      setPermission('denied');
      return;
    }
    setLocation((p) => ({ ...p, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng, address: '', error: null, loading: false });
        setPermission('granted');
        // Reverse geocode (Google or fallback)
        const key = process.env.REACT_APP_GOOGLE_MAPS_KEY;
        if (key && key !== 'YOUR_GOOGLE_MAPS_API_KEY') {
          fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.results?.[0]) {
                setLocation((p) => ({ ...p, address: d.results[0].formatted_address }));
              }
            })
            .catch(() => {});
        }
      },
      (err) => {
        setLocation({ lat: null, lng: null, address: '', error: err.message, loading: false });
        setPermission('denied');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  // Check permission on mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((r) => {
        setPermission(r.state);
        if (r.state === 'granted') requestLocation();
        r.onchange = () => setPermission(r.state);
      });
    }
  }, [requestLocation]);

  return { ...location, permission, requestLocation };
};
