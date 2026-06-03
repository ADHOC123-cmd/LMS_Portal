// adhoc_test_lms/src/utils/fingerprint.js

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const getBrowserHash = () => {
  if (typeof window === 'undefined') return 'server';
  const str = [
    navigator.userAgent || '',
    navigator.language || '',
    window.screen?.width || 0,
    window.screen?.height || 0,
    new Date().getTimezoneOffset()
  ].join('|');

  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
};

export const getDeviceDetails = () => {
  if (typeof window === 'undefined') {
    return {
      deviceFingerprint: 'server',
      deviceType: 'desktop',
      deviceName: 'Server Environment'
    };
  }

  // Persistent identifier
  let deviceUuid = localStorage.getItem("lms_device_uuid");
  if (!deviceUuid) {
    deviceUuid = generateUUID();
    localStorage.setItem("lms_device_uuid", deviceUuid);
  }

  const browserHash = getBrowserHash();
  const deviceFingerprint = `${deviceUuid}-${browserHash}`;

  // Enforce mobile vs desktop classification
  const ua = navigator.userAgent || '';
  const isMobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTouchDevice = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const isSmallScreen = window.innerWidth < 1024;
  
  const deviceType = (isMobileRegex || (isTouchDevice && isSmallScreen)) ? 'mobile' : 'desktop';

  // Device Name Builder
  let os = "Unknown OS";
  if (ua.indexOf("Windows NT 10.0") !== -1) os = "Windows 10/11";
  else if (ua.indexOf("Windows NT 6.2") !== -1) os = "Windows 8";
  else if (ua.indexOf("Windows NT 6.1") !== -1) os = "Windows 7";
  else if (ua.indexOf("Macintosh") !== -1) os = "macOS";
  else if (ua.indexOf("iPhone") !== -1) os = "iPhone (iOS)";
  else if (ua.indexOf("iPad") !== -1) os = "iPad (iPadOS)";
  else if (ua.indexOf("Android") !== -1) os = "Android";
  else if (ua.indexOf("Linux") !== -1) os = "Linux";

  let browser = "Unknown Browser";
  if (ua.indexOf("Chrome") !== -1 && ua.indexOf("Safari") !== -1 && ua.indexOf("Edge") === -1 && ua.indexOf("Edg") === -1) browser = "Chrome";
  else if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) browser = "Safari";
  else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
  else if (ua.indexOf("Edg") !== -1 || ua.indexOf("Edge") !== -1) browser = "Edge";

  const deviceName = `${browser} on ${os}`;

  return {
    deviceFingerprint,
    deviceType,
    deviceName
  };
};
