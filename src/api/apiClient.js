async function request(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || res.statusText || 'Request failed');
  }
  return data;
}

export const api = {
  store: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/api/store/list${q ? `?${q}` : ''}`);
    },
    buy: (body) => request('/api/store/buy', { method: 'POST', body: JSON.stringify(body) }),
  },
  public: {
    faq: () => request('/api/public/faq'),
    news: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/api/public/news${q ? `?${q}` : ''}`);
    },
    staff: () => request('/api/public/staff'),
    settings: () => request('/api/public/settings'),
  },
  admin: {
    dashboard: () => request('/api/admin/dashboard'),
    settings: {
      list: () => request('/api/admin/settings'),
      save: (settings) => request('/api/admin/settings', { method: 'POST', body: JSON.stringify({ settings }) }),
    },
  },
};
