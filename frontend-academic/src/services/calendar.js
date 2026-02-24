import api from './api'

export const calendarService = {
  getEvents: (params = {}) => api.get('/events/events/', { params }),
  getEvent: (id) => api.get(`/events/events/${id}/`),
  createEvent: (data) => api.post('/events/events/', data),
  updateEvent: (id, data) => api.put(`/events/events/${id}/`, data),
  deleteEvent: (id) => api.delete(`/events/events/${id}/`),
  getUpcomingEvents: (limit = 5) => api.get('/events/events/upcoming/', { params: { limit } }),
  getTodayEvents: () => api.get('/events/events/today/'),
  getWeekEvents: () => api.get('/events/events/week/'),
}