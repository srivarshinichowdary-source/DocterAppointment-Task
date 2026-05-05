const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function apiUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path}`;
}

export function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), options);
}
