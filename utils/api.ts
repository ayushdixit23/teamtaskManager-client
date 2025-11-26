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

export const setTokenGetter = (getter: () => string) => {
    tokenGetter = getter;
};

api.interceptors.request.use((config) => {
    if (tokenGetter) {
        config.headers.Authorization = `Bearer ${tokenGetter?.()}`;
    }
    return config;
})

api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response.status === 401) {
        // Refresh token
    }
    return Promise.reject(error);
});

export default api;