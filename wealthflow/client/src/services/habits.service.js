import api from './api';
export const fetchHabits = (params) => api.get('/habits', { params }).then((r) => r.data);
export const createHabit = (payload) => api.post('/habits', payload).then((r) => r.data);
export const updateHabit = (id, payload) => api.put(`/habits/${id}`, payload).then((r) => r.data);
export const deleteHabit = (id) => api.delete(`/habits/${id}`).then((r) => r.data);
export const completeHabit = (id, payload = {}) => api.post(`/habits/${id}/complete`, payload).then((r) => r.data);
