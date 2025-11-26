import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

const getToken = () => {
    const token = ""
    return token;
}

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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