// API Client — fetch wrapper for communicating with the backend
// Sends credentials (cookies) with every request and attaches the access token.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/** In-memory access token — set by AuthContext, never persisted */
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

/**
 * Generic fetch wrapper.
 * @param {string} endpoint - API path (e.g. "/auth/login")
 * @param {object} options - fetch options (method, body, headers, etc.)
 * @returns {Promise<object>} Parsed JSON response
 */
async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // send httpOnly cookies
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(data?.error || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
  delete: (endpoint, options) =>
    request(endpoint, { ...options, method: "DELETE" }),

  /**
   * POST multipart/form-data (file upload).
   * Does NOT set Content-Type — the browser must set it with the correct boundary.
   * @param {string} endpoint
   * @param {FormData} formData
   */
  postFormData: (endpoint, formData) => {
    const url = `${API_URL}${endpoint}`;
    const headers = {};
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    return fetch(url, {
      method: "POST",
      body: formData,
      headers,
      credentials: "include",
    }).then(async (res) => {
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const error = new Error(data?.error || `Request failed (${res.status})`);
        error.status = res.status;
        error.data = data;
        throw error;
      }
      return data;
    });
  },
};

let refreshPromise = null;

export function refreshToken() {
  if (refreshPromise) {
    return refreshPromise;
  }
  
  refreshPromise = api.post("/auth/refresh").finally(() => {
    refreshPromise = null;
  });
  
  return refreshPromise;
}
