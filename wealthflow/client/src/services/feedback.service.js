import api from './api';
export const submitFeedback = (payload) => api.post('/feedback', payload).then((r) => r.data);
export const fetchMyFeedback = () => api.get('/feedback/mine').then((r) => r.data);
