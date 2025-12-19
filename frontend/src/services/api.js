import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  timeout: 5000,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    // If unauthorized, try refreshing token once
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await api.post('/auth/refresh');
        const { token: newToken } = res.data.data;
        setAuthToken(newToken);
        // Save new token to local storage if exists
        try {
          const cached = JSON.parse(localStorage.getItem('tutor_support_auth') || '{}');
          cached.token = newToken;
          localStorage.setItem('tutor_support_auth', JSON.stringify(cached));
        } catch (e) {}
        return api(originalRequest);
      } catch (refreshErr) {
        // Refresh failed, pass original error
      }
    }
    const message = error?.response?.data?.error?.message || error.message || 'Có lỗi xảy ra';
    return Promise.reject(new Error(message));
  },
);

export default api;
