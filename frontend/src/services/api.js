import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  withCredentials: true, // ← sends cookies automatically!
});

// ─── ACCESS TOKEN IN MEMORY ───────────────────────────────────
// NOT in localStorage — much more secure!

export const setAccessToken = (token) => { sessionStorage.setItem('accessToken', token); };
export const getAccessToken = () => sessionStorage.getItem('accessToken');
export const clearAccessToken = () => { sessionStorage.removeItem('accessToken'); };

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────
// Automatically attach access token to every request
API.interceptors.request.use((config) => {
 const token = getAccessToken();
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
  return config;
});

// ─── RESPONSE INTERCEPTOR ─────────────────────────────────────
// If access token expired (401) → auto refresh → retry request
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return API(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint — cookie sent automatically!
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.accessToken;
        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);

      } catch (refreshError) {
        // Refresh failed → logout user
        processQueue(refreshError, null);
        clearAccessToken();
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const logoutUser = () => API.post('/auth/logout');
export const googleAuth = (data) => API.post('/auth/google', data);

// ─── BALANCE ──────────────────────────────────────────────────
export const getBalance = () => API.get('/transfer/balance');

// ─── TRANSFER ─────────────────────────────────────────────────
export const sendMoney = (data) => API.post('/transfer/send', data);
export const getLimits = () => API.get('/transfer/limits');
export const getHistory = () => API.get('/transfer/history');

// ─── PAYMENT ──────────────────────────────────────────────────
export const createPaymentIntent = (data) => API.post('/payment/create-intent', data);
export const confirmPayment = (data) => API.post('/payment/confirm', data);

// ─── RECIPIENTS ───────────────────────────────────────────────
export const getRecipients = () => API.get('/recipient');
export const addRecipient = (data) => API.post('/recipient', data);
export const deleteRecipient = (id) => API.delete(`/recipient/${id}`);
export const updateRecipient = (id, data) => API.put(`/recipient/${id}`, data);

export default API;