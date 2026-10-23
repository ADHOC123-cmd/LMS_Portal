/**
 * Base localStorage utilities
 */

const setCookie = (name, value, days = 30) => {
  try {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    document.cookie = name + "=" + encodeURIComponent(stringValue) + expires + "; path=/; SameSite=Lax; Secure";
  } catch (e) {
    console.warn(`Cookie write failed for key "${name}":`, e);
  }
};

const getCookie = (name) => {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
    }
  } catch (e) {
    console.warn(`Cookie read failed for key "${name}":`, e);
  }
  return null;
};

const eraseCookie = (name) => {
  try {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure';
  } catch (e) {
    console.warn(`Cookie erase failed for key "${name}":`, e);
  }
};

const memoryStore = {};

export const getStorage = (key, fallback = null) => {
  if (typeof window === "undefined") return fallback;
  
  let item;
  try {
    item = localStorage.getItem(key);
  } catch (error) {
    console.warn(`localStorage read failed for key "${key}", using memory backup:`, error);
    item = memoryStore[key] !== undefined ? memoryStore[key] : null;
  }

  // If item not in localStorage, check cookie backup for specific keys
  if (!item && (key === "lms_token" || key === "lms_user")) {
    const cookieVal = getCookie(key);
    if (cookieVal) {
      item = typeof cookieVal === 'string' ? cookieVal : JSON.stringify(cookieVal);
      // Auto-heal localStorage
      try {
        localStorage.setItem(key, item);
      } catch (e) {
        console.warn(`Auto-heal localStorage failed for key "${key}":`, e);
      }
    }
  }

  if (!item) return fallback;

  try {
    return JSON.parse(item);
  } catch {
    return item; // Return as string if not JSON
  }
};

export const setStorage = (key, value) => {
  if (typeof window !== "undefined") {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    try {
      localStorage.setItem(key, stringValue);
    } catch (error) {
      console.warn(`localStorage write failed for key "${key}", using memory backup:`, error);
    }
    
    // Backup in cookie for auth-specific keys
    if (key === "lms_token" || key === "lms_user") {
      setCookie(key, value);
    }

    memoryStore[key] = value;
    // Dispatch custom event for cross-component reactivity
    window.dispatchEvent(new CustomEvent(`storage-update-${key}`, { detail: value }));
  }
};

export const removeStorage = (key) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`localStorage delete failed for key "${key}", using memory backup:`, error);
    }

    // Clean cookie backup as well
    if (key === "lms_token" || key === "lms_user") {
      eraseCookie(key);
    }

    delete memoryStore[key];
    window.dispatchEvent(new CustomEvent(`storage-update-${key}`, { detail: null }));
  }
};
