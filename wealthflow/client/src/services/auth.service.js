import api from './api';

export const registerUser = (payload) => axios.post(`${API_URL}/api/auth/register`, payload).then((r) => r.data);
export const loginUser = (payload) => axios.post(`${API_URL}/api/auth/login`, payload).then((r) => r.data);
export const fetchMe = () => axios.get(`${API_URL}/api/auth/me`).then((r) => r.data);