import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useChat } from '../../context/ChatContext'
import {
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  EllipsisHorizontalIcon,
  PaperClipIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const ChatPage = () => {
  const { user } = useAuth()
  const { conversations, messages, sendMessage, loading } = useChat()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Filtrer les conversations en fonction du terme de recherche
  const filteredConversations = Array.isArray(conversations)
    ? conversations.filter(conv => {
        if (!conv || !conv.name) return false
        return conv.name.toLowerCase().includes((searchTerm || '').toLowerCase())
      })
    : []

  // Récupérer les messages de la conversation sélectionnée
  const currentMessages = selectedConversation && Array.isArray(messages)
    ? messages.filter(msg => msg.conversationId === selectedConversation.id)
    : []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedConversation) return

    try {
      await sendMessage(selectedConversation.id, messageInput)
      setMessageInput('')
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file && selectedConversation) {
      // Implémenter l'upload de fichier
      console.log('Fichier à uploader:', file)
    }
  }

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return ''
    try {
      return format(new Date(timestamp), 'HH:mm')
    } catch {
      return ''
    }
  }

  const formatMessageDate = (timestamp) => {
    if (!timestamp) return ''
    try {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const messageDate = new Date(timestamp)

      if (messageDate.toDateString() === today.toDateString()) {
        return "Aujourd'hui"
      } else if (messageDate.toDateString() === yesterday.toDateString()) {
        return "Hier"
      } else {
        return format(messageDate, 'dd MMM yyyy', { locale: fr })
      }
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden animate-fade-in">
      {/* Sidebar des conversations */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} border-r border-secondary-200 transition-all duration-300 bg-white overflow-hidden`}>
        <div className="h-full flex flex-col">
          {/* En-tête */}
          <div className="p-4 border-b border-secondary-200">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Messages</h2>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
              />
            </div>
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-secondary-500">
                Aucune conversation
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-secondary-50 transition-colors border-b border-secondary-100 ${
                    selectedConversation?.id === conv.id ? 'bg-primary-50' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold ${
                      conv.type === 'group' 
                        ? 'bg-gradient-to-br from-green-500 to-green-600' 
                        : 'bg-gradient-to-br from-primary-500 to-primary-600'
                    }`}>
                      {conv.type === 'group' ? (
                        <UsersIcon className="h-6 w-6" />
                      ) : (
                        conv.name?.charAt(0) || '?'
                      )}
                    </div>
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-secondary-900 truncate">{conv.name}</h3>
                      {conv.lastMessageTime && (
                        <span className="text-xs text-secondary-500 flex-shrink-0 ml-2">
                          {formatMessageTime(conv.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-secondary-600 truncate text-left">
                      {conv.lastMessage || 'Aucun message'}
                    </p>
                  </div>

                  {/* Badge non lu */}
                  {conv.unreadCount > 0 && (
                    <span className="flex-shrink-0 px-2 py-1 bg-primary-600 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* En-tête du chat */}
            <div className="p-4 border-b border-secondary-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="lg:hidden p-2 hover:bg-secondary-100 rounded-lg"
                >
                  <UsersIcon className="h-5 w-5 text-secondary-600" />
                </button>

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold ${
                    selectedConversation.type === 'group' 
                      ? 'bg-gradient-to-br from-green-500 to-green-600' 
                      : 'bg-gradient-to-br from-primary-500 to-primary-600'
                  }`}>
                    {selectedConversation.type === 'group'
                      ? <UsersIcon className="h-5 w-5" />
                      : selectedConversation.name?.charAt(0) || '?'
                    }
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900">{selectedConversation.name}</h3>
                    <p className="text-xs text-secondary-500">
                      {selectedConversation.online ? 'En ligne' : 'Hors ligne'}
                    </p>
                  </div>
                </div>
              </div>

              <button className="p-2 hover:bg-secondary-100 rounded-lg">
                <EllipsisHorizontalIcon className="h-5 w-5 text-secondary-600" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-secondary-500">
                  Aucun message. Commencez la conversation !
                </div>
              ) : (
                currentMessages.map((msg, index) => {
                  const isCurrentUser = msg.senderId === user?.id
                  const showDate = index === 0 ||
                    format(new Date(msg.timestamp), 'yyyy-MM-dd') !==
                    format(new Date(currentMessages[index - 1]?.timestamp), 'yyyy-MM-dd')

                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center">
                          <span className="px-3 py-1 bg-secondary-100 text-secondary-600 rounded-full text-xs">
                            {formatMessageDate(msg.timestamp)}
                          </span>
                        </div>
                      )}

                      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                          {!isCurrentUser && (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold mr-2 flex-shrink-0">
                              {msg.senderName?.charAt(0) || '?'}
                            </div>
                          )}

                          <div>
                            <div className={`px-4 py-2 rounded-2xl ${
                              isCurrentUser 
                                ? 'bg-primary-600 text-white rounded-br-none' 
                                : 'bg-secondary-100 text-secondary-900 rounded-bl-none'
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 text-xs text-secondary-500 ${
                              isCurrentUser ? 'justify-end' : 'justify-start'
                            }`}>
                              <span>{formatMessageTime(msg.timestamp)}</span>
                              {isCurrentUser && msg.read && (
                                <CheckCircleIcon className="h-3 w-3 text-blue-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie */}
            <div className="p-4 border-t border-secondary-200">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex-1 bg-secondary-50 rounded-xl p-2">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="w-full bg-transparent border-none outline-none resize-none max-h-32 p-1 text-secondary-900"
                    rows="1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                  />

                  <div className="flex items-center gap-1 mt-2">
                    <button
                      type="button"
                      onClick={handleFileUpload}
                      className="p-2 hover:bg-secondary-200 rounded-lg transition-colors"
                    >
                      <PaperClipIcon className="h-5 w-5 text-secondary-500" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          // État vide
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Vos messages</h3>
              <p className="text-secondary-500 mb-4">Sélectionnez une conversation pour commencer à discuter</p>
              <button
                onClick={() => setShowSidebar(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 lg:hidden"
              >
                Voir les conversations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPage