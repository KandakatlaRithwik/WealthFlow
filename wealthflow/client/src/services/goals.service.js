import api from './api';
export const fetchGoals = (params) => api.get('/goals', { params }).then((r) => r.data);
export const createGoal = (payload) => api.post('/goals', payload).then((r) => r.data);
export const updateGoal = (id, payload) => api.put(`/goals/${id}`, payload).then((r) => r.data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`).then((r) => r.data);
export const contributeToGoal = (id, payload) => api.post(`/goals/${id}/contribute`, payload).then((r) => r.data);
