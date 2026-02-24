import api from './api'

export const chatService = {
  getConversations: () => api.get('/chat/conversations/'),
  getConversation: (id) => api.get(`/chat/conversations/${id}/`),
  createConversation: (data) => api.post('/chat/conversations/create/', data),
  getMessages: (conversationId) => api.get(`/chat/conversations/${conversationId}/messages/`),
  sendMessage: (conversationId, content) =>
    api.post(`/chat/conversations/${conversationId}/messages/`, { content }),
  markAsRead: (conversationId) =>
    api.post(`/chat/conversations/${conversationId}/mark-read/`),
  setTyping: (conversationId, isTyping) =>
    api.post(`/chat/conversations/${conversationId}/typing/`, { is_typing: isTyping }),
  getUnreadCount: () => api.get('/chat/unread-count/'),
}