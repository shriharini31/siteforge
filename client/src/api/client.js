const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

let defaultApiToken = null;
export const setApiToken = (token) => {
  defaultApiToken = token || null;
};

export const request = async (path, { method = 'GET', body, token, headers = {}, ...options } = {}) => {
  const authToken = token || defaultApiToken;

  const response = await fetch(`${API_BASE_URL}${path}`, {
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

  const payload = await response.json().catch(() => ({ data: null, error: 'Request failed', meta: { status: response.status } }));
  if (!response.ok) throw new Error(payload.error || 'Request failed');
  return payload;
};
