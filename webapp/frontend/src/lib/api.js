import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

import { supabase } from './supabase';

// Add auth token to requests
api.interceptors.request.use(async (config) => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
