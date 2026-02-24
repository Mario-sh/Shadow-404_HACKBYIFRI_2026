import api from './api'

export const logsService = {
  getLogs: (params = {}) => api.get('/logs/logs/', { params }),
  getLog: (id) => api.get(`/logs/logs/${id}/`),
  getStats: (period = 'day') => api.get('/logs/logs/stats/', { params: { period } }),
  cleanupLogs: (days = 30) => api.delete('/logs/logs/cleanup/', { params: { days } }),
}