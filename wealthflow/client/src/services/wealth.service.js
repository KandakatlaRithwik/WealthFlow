import api from './api';
export const fetchWealth = () => api.get('/wealth').then((r) => r.data);
export const addAsset = (payload) => api.post('/wealth/assets', payload).then((r) => r.data);
export const deleteAsset = (id) => api.delete(`/wealth/assets/${id}`).then((r) => r.data);
export const addLiability = (payload) => api.post('/wealth/liabilities', payload).then((r) => r.data);
export const deleteLiability = (id) => api.delete(`/wealth/liabilities/${id}`).then((r) => r.data);
export const addInvestment = (payload) => api.post('/wealth/investments', payload).then((r) => r.data);
export const deleteInvestment = (id) => api.delete(`/wealth/investments/${id}`).then((r) => r.data);
