import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { alertAPI } from '../utils/api';

const EmergencyContext = createContext(null);

export const EmergencyProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [alertId, setAlertId] = useState(null);
  const [alertedContacts, setAlertedContacts] = useState([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordingState, setRecordingState] = useState('idle'); // idle | recording | secured | failed
  const [locationState, setLocationState] = useState({ lat: null, lng: null, address: '' });
  const [riskScore, setRiskScore] = useState(0);

  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const locationIntervalRef = useRef(null);

  // Start location tracking
  const startLocationTracking = useCallback((aid) => {
    if (!navigator.geolocation) return;
    locationIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocationState((prev) => ({ ...prev, lat, lng }));
        if (aid) alertAPI.updateLocation(aid, { lat, lng }).catch(() => {});
      });
    }, 10000);
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecordingState('secured');
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecordingState('recording');
    } catch {
      setRecordingState('failed');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Trigger full emergency
  const triggerEmergency = useCallback(async (location) => {
    if (isActive) return;

    // Vibrate pattern
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400, 100, 600]);

    setIsActive(true);
    setElapsedSeconds(0);
    setRecordingState('idle');

    const lat = location?.lat || locationState.lat || 23.5204;
    const lng = location?.lng || locationState.lng || 87.3119;
    setLocationState({ lat, lng, address: location?.address || '' });

    // API call — works without login
    try {
      const { data } = await alertAPI.trigger({ lat, lng, address: location?.address || '' });
      setAlertId(data.alertId);
      setAlertedContacts(data.alertedContacts || []);
      setRiskScore(data.riskScore || 0);
      startLocationTracking(data.alertId);
    } catch {
      // Offline fallback — still show emergency UI
      setAlertedContacts([
        { name: 'Police', phone: '100', method: 'call' },
        { name: 'Ambulance', phone: '102', method: 'call' },
      ]);
    }

    // Start timer
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);

    // Start recording async
    startRecording();
  }, [isActive, locationState, startLocationTracking, startRecording]);

  const cancelEmergency = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    stopRecording();

    if (alertId) {
      alertAPI.resolve(alertId, 'cancelled').catch(() => {});
    }

    setIsActive(false);
    setAlertId(null);
    setElapsedSeconds(0);
    setAlertedContacts([]);
    setRecordingState('idle');
    setRiskScore(0);
  }, [alertId, stopRecording]);

  // Format timer
  const formattedTime = (() => {
    const m = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const s = String(elapsedSeconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  })();

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
  }, []);

  return (
    <EmergencyContext.Provider value={{
      isActive, alertId, alertedContacts, elapsedSeconds, formattedTime,
      recordingState, locationState, riskScore,
      triggerEmergency, cancelEmergency,
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => useContext(EmergencyContext);
