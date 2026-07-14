// src/utils/authStore.js

let subscribers = []

const getAuthState = () => {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, user: null };
  }
  try {
    const token = localStorage.getItem("lms_token");
    const userStr = localStorage.getItem("lms_user");
    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch {
        user = null;
      }
    }
    return {
      isAuthenticated: !!token && token !== "undefined" && token !== "null",
      user: user
    };
  } catch (e) {
    console.warn("authStore failed to read storage:", e);
    return { isAuthenticated: false, user: null };
  }
};

export const authStore = {
  subscribe: (callback) => {
    subscribers.push(callback)
    return () => {
      subscribers = subscribers.filter(s => s !== callback)
    }
  },

  notify: (user) => {
    const newState = {
      isAuthenticated: !!user,
      user: user
    }
    subscribers.forEach(callback => callback(newState))
  },

  getState: getAuthState,
  getSnapshot: getAuthState
};
