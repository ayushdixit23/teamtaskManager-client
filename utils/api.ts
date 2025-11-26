import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

let tokenGetter: (() => string) | null = null;
let tokenUpdater: ((token: string) => void) | null = null;
let logoutCallback: (() => void) | null = null;
let currentToken: string = ''; // Store token directly for immediate access
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
}> = [];

export const setTokenGetter = (getter: () => string) => {
    tokenGetter = getter;
    // Update currentToken immediately when getter is set
    if (getter) {
        currentToken = getter();
    }
};

export const setTokenUpdater = (updater: (token: string) => void) => {
    tokenUpdater = updater;
};

export const setLogoutCallback = (callback: () => void) => {
    logoutCallback = callback;
};

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use((config) => {
    // Get the latest token - prioritize currentToken (updated immediately on refresh)
    // then fallback to tokenGetter (synced with React state)
    let token = currentToken;
    if (!token && tokenGetter) {
        token = tokenGetter();
        // Sync currentToken with tokenGetter value for future requests
        if (token) {
            currentToken = token;
        }
    }
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

api.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
    }

    if (originalRequest.url === '/auth/refresh-token') {
        return Promise.reject(error);
    }

    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        })
            .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
        const response = await api.post('/auth/refresh-token')

        if (response.data.success && response.data.data?.token) {
            const newToken = response.data.data.token;

            // Update currentToken immediately so new requests use it right away
            currentToken = newToken;

            // Update state through callback (async, but tokenGetter will be updated via useEffect)
            if (tokenUpdater) {
                tokenUpdater(newToken);
            }

            // Process queued requests with new token
            processQueue(null, newToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (refreshError) {
        // Clear token on refresh failure
        currentToken = '';
        if (logoutCallback) {
            logoutCallback();
        }
        processQueue(refreshError, null);
        isRefreshing = false;
        return Promise.reject(refreshError);
    } finally {
        isRefreshing = false;
    }
});

export default api;