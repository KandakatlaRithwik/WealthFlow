import api from './api';
export const fetchDashboardSummary = () => api.get('/dashboard/summary').then((r) => r.data);
