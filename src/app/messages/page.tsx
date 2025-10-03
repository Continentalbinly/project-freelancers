"use client"

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslationContext } from '@/app/components/LanguageProvider'
import { db } from '@/service/firebase'
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore'
import Avatar from '@/app/utils/avatarHandler'
import { PaperAirplaneIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'

function ChatRoom({ chatRoom, user, onBack }: { chatRoom: any, user: any, onBack: () => void }) {
  const { t } = useTranslationContext()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [userProfiles, setUserProfiles] = useState<Record<string, { fullName: string, avatarUrl: string }>>({})
  const [receiverProfile, setReceiverProfile] = useState<{ fullName: string, avatarUrl: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chatRoom) return
    const q = query(
      collection(db, 'chatMessages'),
      where('chatRoomId', '==', chatRoom.id),
      orderBy('timestamp', 'asc')
    )
    const unsub = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMessages(messagesData)

      // Always fetch user profiles for all unique senderIds and receiverIds in messages
      const missingUserIds = new Set<string>()
      messagesData.forEach((msg: any) => {
        if (msg.senderId && !userProfiles[msg.senderId]) {
          missingUserIds.add(msg.senderId)
        }
        if (msg.receiverId && !userProfiles[msg.receiverId]) {
          missingUserIds.add(msg.receiverId)
        }
      })

      // Fetch profiles for missing users
      missingUserIds.forEach(async (userId) => {
        if (!userProfiles[userId]) {
          try {
            const profileRef = doc(db, 'profiles', userId)
            const profileSnap = await getDoc(profileRef)
            if (profileSnap.exists()) {
              const profileData = profileSnap.data()
              setUserProfiles(prev => ({
                ...prev,
                [userId]: {
                  fullName: profileData.fullName || 'Unknown User',
                  avatarUrl: profileData.avatarUrl || ''
                }
              }))
            }
          } catch (err) {
            //console.log('Could not fetch profile for user:', userId, err)
          }
        }
      })
    })
    return () => unsub()
  }, [chatRoom, userProfiles])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Fetch receiver profile
  useEffect(() => {
    if (!chatRoom || !user) return

    const receiverId = chatRoom.participants?.find((id: string) => id !== user.uid)
    if (!receiverId) return

    const fetchReceiverProfile = async () => {
      try {
        const receiverProfileRef = doc(db, 'profiles', receiverId)
        const receiverProfileSnap = await getDoc(receiverProfileRef)
        if (receiverProfileSnap.exists()) {
          const receiverData = receiverProfileSnap.data()
          setReceiverProfile({
            fullName: receiverData.fullName || 'Unknown User',
            avatarUrl: receiverData.avatarUrl || ''
          })
        }
      } catch (err) {
        //console.log('Could not fetch receiver profile:', err)
      }
    }

    fetchReceiverProfile()
  }, [chatRoom, user])

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return ''

    let date: Date

    // Handle different timestamp formats
    if (timestamp.toDate) {
      // Firestore Timestamp object
      date = timestamp.toDate()
    } else if (timestamp.seconds) {
      // Firestore Timestamp with seconds
      date = new Date(timestamp.seconds * 1000)
    } else if (timestamp instanceof Date) {
      // Already a Date object
      date = timestamp
    } else if (typeof timestamp === 'number') {
      // Unix timestamp
      date = new Date(timestamp)
    } else if (typeof timestamp === 'string') {
      // ISO string
      date = new Date(timestamp)
    } else {
      // Try to create Date from whatever it is
      date = new Date(timestamp)
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return ''
    }

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatMessageDate = (timestamp: any) => {
    if (!timestamp) return ''

    let date: Date

    // Handle different timestamp formats
    if (timestamp.toDate) {
      // Firestore Timestamp object
      date = timestamp.toDate()
    } else if (timestamp.seconds) {
      // Firestore Timestamp with seconds
      date = new Date(timestamp.seconds * 1000)
    } else if (timestamp instanceof Date) {
      // Already a Date object
      date = timestamp
    } else if (typeof timestamp === 'number') {
      // Unix timestamp
      date = new Date(timestamp)
    } else if (typeof timestamp === 'string') {
      // ISO string
      date = new Date(timestamp)
    } else {
      // Try to create Date from whatever it is
      date = new Date(timestamp)
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return ''
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (messageDate.getTime() === today.getTime()) {
      return t('dashboard.messagesPage.today')
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return t('dashboard.messagesPage.yesterday')
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      })
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    try {
      // Fetch sender's profile to get avatar
      let senderAvatar = user.photoURL || ''
      let senderName = user.displayName || 'User'

      try {
        const senderProfileRef = doc(db, 'profiles', user.uid)
        const senderProfileSnap = await getDoc(senderProfileRef)
        if (senderProfileSnap.exists()) {
          const senderData = senderProfileSnap.data()
          senderAvatar = senderData.avatarUrl || senderAvatar
          senderName = senderData.fullName || senderName
        }
      } catch (profileErr) {
        //console.log('Could not fetch sender profile:', profileErr)
      }

      await addDoc(collection(db, 'chatMessages'), {
        chatRoomId: chatRoom.id,
        message: newMessage,
        senderId: user.uid,
        receiverId: chatRoom?.participants?.find((id: string) => id !== user.uid) || '',
        timestamp: serverTimestamp(),
        read: false
      })

      // Update last message in chatRoom
      if (chatRoom.id) {
        const chatRoomRef = doc(db, 'chatRooms', chatRoom.id)
        await updateDoc(chatRoomRef, {
          lastMessage: newMessage,
          lastMessageTime: serverTimestamp()
        })
      }
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  if (!chatRoom) return null

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Chat Header - Fixed Height */}
      <div className="flex-shrink-0 bg-white border-b border-border px-4 py-3 h-16 flex items-center">
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-background-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary lg:hidden"
            aria-label={t('dashboard.messagesPage.backToMessages')}
          >
            <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
          </button>

          {/* Receiver Avatar */}
          <Avatar
            src={receiverProfile?.avatarUrl || ''}
            alt={receiverProfile?.fullName || t('dashboard.messagesPage.user')}
            name={receiverProfile?.fullName || t('dashboard.messagesPage.user')}
            size="lg"
          />

          {/* Receiver Info and Project */}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-text-primary text-base truncate">
              {receiverProfile?.fullName || t('dashboard.messagesPage.user')}
            </span>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              {chatRoom?.projectTitle && (
                <>
                  <span className="truncate max-w-[120px] lg:max-w-[200px]">
                    {chatRoom.projectTitle}
                  </span>
                  <span className="text-text-muted">•</span>
                </>
              )}
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {chatRoom?.projectId ? t('dashboard.messagesPage.project') : t('dashboard.messagesPage.directMessage')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container - ONLY Scrollable Area */}
      <div className="flex-1 bg-background-secondary px-4 py-4 overflow-y-auto min-h-0">
        <div className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center text-text-secondary text-sm py-8">
              {t('dashboard.messagesPage.noMessages')}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((msg, index) => {
                const isMe = msg.senderId === user?.uid
                const currentDate = formatMessageDate(msg.timestamp)
                const previousDate = index > 0 ? formatMessageDate(messages[index - 1].timestamp) : null
                const showDateSeparator = currentDate !== previousDate

                return (
                  <div key={msg.id}>
                    {/* Date Separator */}
                    {showDateSeparator && (
                      <div className="flex justify-center my-4">
                        <div className="bg-background-secondary px-3 py-1 rounded-full text-xs text-text-secondary font-medium">
                          {currentDate}
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <Avatar
                          src={userProfiles[msg.senderId]?.avatarUrl || ''}
                          alt={userProfiles[msg.senderId]?.fullName || t('dashboard.messagesPage.user')}
                          name={userProfiles[msg.senderId]?.fullName || t('dashboard.messagesPage.user')}
                          size="md"
                          className="rounded-full border border-border flex-shrink-0"
                        />
                      )}

                      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl shadow-sm ${isMe
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-white text-text-primary rounded-bl-md border border-border'
                        } flex flex-col relative`}>
                        {!isMe && (
                          <span className="text-xs font-medium mb-1 text-text-secondary">
                            {userProfiles[msg.senderId]?.fullName || t('dashboard.messagesPage.user')}
                          </span>
                        )}
                        <span className="text-sm leading-relaxed">{msg.message}</span>
                        <span className={`text-xs mt-1 self-end ${isMe ? 'text-white/70' : 'text-text-secondary'
                          }`}>
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>

                      {isMe && (
                        <Avatar
                          src={userProfiles[user.uid]?.avatarUrl || ''}
                          alt={userProfiles[user.uid]?.fullName || t('dashboard.messagesPage.user')}
                          name={userProfiles[user.uid]?.fullName || t('dashboard.messagesPage.user')}
                          size="md"
                          className="rounded-full border border-border flex-shrink-0"
                        />
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input - Fixed Height */}
      <div className="flex-shrink-0 bg-white border-t border-border px-4 py-3 h-16 flex items-center">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3 w-full">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder={t('dashboard.messagesPage.typeMessage')}
            className="flex-1 px-4 py-2 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-background-secondary"
            disabled={sending}
            autoFocus
          />
          <button
            type="submit"
            className="btn btn-primary rounded-full p-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={sending || !newMessage.trim()}
            aria-label={t('dashboard.messagesPage.send')}
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const { t } = useTranslationContext()
  const { user } = useAuth()
  const [chatRooms, setChatRooms] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [profileCache, setProfileCache] = useState<Record<string, { fullName: string, avatarUrl: string }>>({})

  useEffect(() => {
    if (!user) return
    setLoading(true)
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    )
    const unsub = onSnapshot(q, (snapshot) => {
      setChatRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  // Fetch missing profile info for chat list
  useEffect(() => {
    if (!user) return
    const missingIds: string[] = []
    chatRooms.forEach(room => {
      const otherId = Array.isArray(room.participants)
        ? room.participants.find((id: string) => id !== user.uid)
        : null
      if (otherId && !profileCache[otherId]) {
        missingIds.push(otherId)
      }
    })
    if (missingIds.length === 0) return
    missingIds.forEach(async (uid) => {
      const profileRef = doc(db, 'profiles', uid)
      const snap = await getDoc(profileRef)
      if (snap.exists()) {
        const data = snap.data()
        setProfileCache(prev => ({
          ...prev,
          [uid]: {
            fullName: data.fullName || 'Unknown User',
            avatarUrl: data.avatarUrl || ''
          }
        }))
      }
    })
  }, [chatRooms, user, profileCache])

  const filteredChatRooms = chatRooms.filter(room => {
    if (!searchQuery) return true
    const avatars: Record<string, string> = room.participantAvatars || {}
    const names: Record<string, string> = room.participantNames || {}
    const otherId = Array.isArray(room.participants)
      ? room.participants.find((id: string) => id !== user?.uid)
      : null

    if (!otherId) return false

    const otherName = names[otherId] || profileCache[otherId]?.fullName || 'Unknown User'
    const projectTitle = room.projectTitle || ''

    return otherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Handle chat selection without page scroll
  const handleChatSelect = (room: any) => {
    // Prevent any page scrolling
    window.scrollTo(0, 0)
    setSelectedRoom(room)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        Please sign in to view your messages.
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-background overflow-hidden">
      {/* Chat List Sidebar - Fixed */}
      <aside className={`w-full lg:w-80 max-w-full lg:max-w-xs border-r border-border bg-white h-full flex flex-col overflow-hidden ${selectedRoom ? 'hidden lg:flex' : 'flex'
        }`}>
        {/* Header - Fixed Height */}
        <div className="flex-shrink-0 p-4 border-b border-border h-20 flex flex-col justify-center bg-white">
          <h1 className="font-bold text-xl text-text-primary mb-2">{t('dashboard.messagesPage.title')}</h1>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder={t('dashboard.messagesPage.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background-secondary"
            />
          </div>
        </div>

        {/* Chat List - Fixed Height, No Scroll */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="p-4 text-center text-text-secondary">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              {t('dashboard.messagesPage.loadingConversations')}
            </div>
          ) : filteredChatRooms.length === 0 ? (
            <div className="p-4 text-center text-text-secondary">
              {searchQuery ? t('dashboard.messagesPage.noConversationsFound') : t('dashboard.messagesPage.noConversations')}
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Show only first 6 conversations to fit in fixed height */}
              {user && filteredChatRooms.slice(0, 6).map(room => {
                const avatars: Record<string, string> = room.participantAvatars || {}
                const names: Record<string, string> = room.participantNames || {}
                const otherId = Array.isArray(room.participants)
                  ? room.participants.find((id: string) => id !== user.uid)
                  : null
                let otherName = 'Unknown User'
                let otherAvatar = ''
                if (otherId) {
                  otherName = names[otherId] || profileCache[otherId]?.fullName || 'Unknown User'
                  otherAvatar = avatars[otherId] || profileCache[otherId]?.avatarUrl || ''
                }

                const formatLastMessageTime = (timestamp: any) => {
                  if (!timestamp) return ''

                  let date: Date

                  // Handle different timestamp formats
                  if (timestamp.toDate) {
                    // Firestore Timestamp object
                    date = timestamp.toDate()
                  } else if (timestamp.seconds) {
                    // Firestore Timestamp with seconds
                    date = new Date(timestamp.seconds * 1000)
                  } else if (timestamp instanceof Date) {
                    // Already a Date object
                    date = timestamp
                  } else if (typeof timestamp === 'number') {
                    // Unix timestamp
                    date = new Date(timestamp)
                  } else if (typeof timestamp === 'string') {
                    // ISO string
                    date = new Date(timestamp)
                  } else {
                    // Try to create Date from whatever it is
                    date = new Date(timestamp)
                  }

                  // Check if date is valid
                  if (isNaN(date.getTime())) {
                    return ''
                  }

                  const now = new Date()
                  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

                  if (diffInHours < 24) {
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  } else if (diffInHours < 48) {
                    return 'Yesterday'
                  } else {
                    return date.toLocaleDateString()
                  }
                }

                return (
                  <div
                    key={room.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-background-secondary transition-colors ${selectedRoom?.id === room.id ? 'bg-primary/5 border-r-2 border-primary' : ''
                      }`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleChatSelect(room)
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <Avatar
                      src={otherAvatar}
                      alt={otherName}
                      name={otherName}
                      size="lg"
                      className="flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-text-primary truncate">
                          {otherName}
                        </div>
                        <div className="text-xs text-text-secondary flex-shrink-0 ml-2">
                          {formatLastMessageTime(room.lastMessageTime)}
                        </div>
                      </div>

                      <div className="text-sm text-text-secondary truncate">
                        {room.lastMessage || 'No messages yet.'}
                      </div>

                      {room.projectTitle && (
                        <div className="text-xs text-primary font-medium truncate mt-1">
                          {room.projectTitle}
                        </div>
                      )}
                    </div>

                    {room.unreadCount > 0 && (
                      <span className="ml-2 bg-primary text-white rounded-full px-2 py-0.5 text-xs font-semibold flex-shrink-0">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Chat Room */}
      <main className={`flex-1 flex flex-col h-full ${selectedRoom ? 'flex' : 'hidden lg:flex'
        }`}>
        {selectedRoom ? (
          <ChatRoom chatRoom={selectedRoom} user={user} onBack={() => setSelectedRoom(null)} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-text-secondary">
            <div className="text-center">
              <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{t('dashboard.messagesPage.selectConversation')}</h3>
              <p className="text-sm text-text-secondary">{t('dashboard.messagesPage.selectConversationDesc')}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 