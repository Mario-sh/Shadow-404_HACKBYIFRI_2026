import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { chatService } from '../services/chat'

const ChatContext = createContext()

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) throw new Error('useChat must be used within ChatProvider')
  return context
}

export const ChatProvider = ({ children }) => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadConversations()
      loadUnreadCount()

      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(() => {
        loadUnreadCount()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [user])

  const loadConversations = async () => {
    try {
      const response = await chatService.getConversations()
      setConversations(response.data || [])
    } catch (error) {
      console.error('Erreur chargement conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const response = await chatService.getUnreadCount()
      setUnreadCount(response.data.unread_count || 0)
    } catch (error) {
      console.error('Erreur chargement compteur:', error)
    }
  }

  const loadMessages = async (conversationId) => {
    try {
      const response = await chatService.getMessages(conversationId)
      setMessages(response.data || [])

      // Marquer comme lu
      await chatService.markAsRead(conversationId)
      loadUnreadCount()

      return response.data
    } catch (error) {
      console.error('Erreur chargement messages:', error)
      return []
    }
  }

  const sendMessage = async (conversationId, content) => {
    try {
      const response = await chatService.sendMessage(conversationId, content)

      // Recharger les messages
      await loadMessages(conversationId)

      // Recharger les conversations pour mettre à jour le dernier message
      await loadConversations()

      return response.data
    } catch (error) {
      console.error('Erreur envoi message:', error)
      throw error
    }
  }

  const setTyping = (conversationId, isTyping) => {
    chatService.setTyping(conversationId, isTyping).catch(console.error)
  }

  const value = {
    conversations,
    messages,
    loading,
    unreadCount,
    loadMessages,
    sendMessage,
    setTyping,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}