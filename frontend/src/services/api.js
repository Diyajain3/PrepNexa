const API = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

export async function api(path, { method = 'GET', body, headers } = {}) {
  const token = localStorage.getItem('token');

  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }

  const data = await res.json().catch(() => ({}));

  // Expired or invalid token: clear it and send the user to login
  if (res.status === 401 && !path.startsWith('/auth')) {
    localStorage.clear();
    window.location.assign('/login');
  }
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}
