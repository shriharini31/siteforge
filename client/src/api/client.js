const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

let defaultApiToken = null;
export const setApiToken = (token) => {
  defaultApiToken = token || null;
};

export const request = async (path, { method = 'GET', body, token, headers = {}, ...options } = {}) => {
  const authToken = token || defaultApiToken;

  const response = await fetch(apiUrl(path), {
    method,
    // include credentials to support refresh cookie flow
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const message = payload?.error
      || `API request failed (${response.status}). Configure VITE_API_BASE_URL to your deployed backend URL.`;
    throw new Error(message);
  }

  if (!payload) {
    throw new Error('The API returned a non-JSON response. Check VITE_API_BASE_URL and backend routing.');
  }
  return payload;
};
