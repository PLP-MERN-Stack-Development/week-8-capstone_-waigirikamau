import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Phone, ArrowLeft, User, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import io, { Socket } from 'socket.io-client';

// Configure API and Socket URLs based on environment
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://week-8-capstone-waigirikamau-2.onrender.com' // Replace with your deployed backend URL
  : 'http://localhost:5000';

interface Chat {
  _id: string;
  farmerId: {
    _id: string;
    farmName: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  buyerId: {
    _id: string;
    businessName: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  productId?: {
    _id: string;
    name: string;
    images: string[];
  };
  messages: Message[];
  lastMessage?: {
    content: string;
    timestamp: string;
    senderRole: string;
  };
}

interface Message {
  _id?: string;
  senderId: string;
  senderRole: 'farmer' | 'buyer';
  content: string;
  timestamp: string;
  isRead?: boolean;
}

const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch user's chats
  useEffect(() => {
    fetchChats();
  }, []);

  // Handle URL parameters for direct chat
  useEffect(() => {
    const farmerId = searchParams.get('farmer');
    const productId = searchParams.get('product');
    
    if (farmerId && user?.role === 'buyer') {
      createOrGetChat(farmerId, productId);
    }
  }, [searchParams, user]);

  // Socket event listeners
  useEffect(() => {
    if (socket && selectedChat) {
      socket.emit('join-room', selectedChat._id);

      socket.on('receive-message', (messageData: any) => {
        if (selectedChat && messageData.roomId === selectedChat._id) {
          const newMessage: Message = {
            senderId: messageData.senderId,
            senderRole: messageData.senderRole,
            content: messageData.content,
            timestamp: messageData.timestamp
          };

          setSelectedChat(prev => prev ? {
            ...prev,
            messages: [...prev.messages, newMessage]
          } : null);
        }
      });

      return () => {
        socket.off('receive-message');
      };
    }
  }, [socket, selectedChat]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get('/chat/my-chats');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrGetChat = async (farmerId: string, productId?: string | null) => {
    if (!user) return;

    try {
      // Get the actual profile IDs, not user IDs
      let actualFarmerId = farmerId;
      let actualBuyerId = '';
      
      if (user.role === 'buyer') {
        // Get buyer profile ID
        const buyerResponse = await axios.get('/buyers/profile');
        actualBuyerId = buyerResponse.data._id;
        actualFarmerId = farmerId;
      } else {
        // Get farmer profile ID
        const farmerResponse = await axios.get('/farmers/profile');
        actualFarmerId = farmerResponse.data._id;
        actualBuyerId = farmerId; // This would be buyer ID in this case
      }

      const chatData = {
        farmerId: actualFarmerId,
        buyerId: actualBuyerId,
        productId: productId || null
      };
      const response = await axios.post('/chat/create', chatData);
      setSelectedChat(response.data);
      
      // Add to chats list if not already there
      setChats(prev => {
        const exists = prev.find(chat => chat._id === response.data._id);
        return exists ? prev : [response.data, ...prev];
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Error starting chat. Please try again.');
    }
  };

  const selectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    
    // Fetch full chat details with messages
    try {
      const response = await axios.get(`/chat/${chat._id}/messages`);
      setSelectedChat(response.data);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !socket) return;

    const messageData = {
      roomId: selectedChat._id,
      senderId: user?.id,
      senderRole: user?.role,
      content: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      // Send via socket for real-time update
      socket.emit('send-message', messageData);

      // Send to backend to save
      await axios.post(`/chat/${selectedChat._id}/messages`, {
        content: newMessage.trim()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getChatPartner = (chat: Chat) => {
    if (user?.role === 'farmer') {
      return {
        name: chat.buyerId.businessName,
        subtitle: `${chat.buyerId.firstName} ${chat.buyerId.lastName}`,
        image: chat.buyerId.profileImage,
        icon: Building2
      };
    } else {
      return {
        name: chat.farmerId.farmName,
        subtitle: `${chat.farmerId.firstName} ${chat.farmerId.lastName}`,
        image: chat.farmerId.profileImage,
        icon: User
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Chat List */}
            <div className={`${selectedChat ? 'hidden lg:block' : 'block'} w-full lg:w-1/3 border-r border-gray-200`}>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              </div>
              
              <div className="overflow-y-auto h-full">
                {chats.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                    <p className="text-gray-500">
                      {user?.role === 'buyer' 
                        ? 'Start chatting with farmers by visiting product pages'
                        : 'Buyers will reach out to you when interested in your products'
                      }
                    </p>
                  </div>
                ) : (
                  chats.map((chat) => {
                    const partner = getChatPartner(chat);
                    const Icon = partner.icon;
                    
                    return (
                      <div
                        key={chat._id}
                        onClick={() => selectChat(chat)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedChat?._id === chat._id ? 'bg-green-50 border-green-200' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {partner.image ? (
                              <img
                                src={`http://localhost:5000/uploads/${partner.image}`}
                                alt={partner.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <Icon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900 truncate">{partner.name}</p>
                                <p className="text-sm text-gray-500 truncate">{partner.subtitle}</p>
                              </div>
                              {chat.lastMessage && (
                                <span className="text-xs text-gray-400">
                                  {formatTime(chat.lastMessage.timestamp)}
                                </span>
                              )}
                            </div>
                            
                            {chat.productId && (
                              <p className="text-xs text-green-600 mt-1">
                                About: {chat.productId.name}
                              </p>
                            )}
                            
                            {chat.lastMessage && (
                              <p className="text-sm text-gray-600 truncate mt-1">
                                {chat.lastMessage.senderRole === user?.role ? 'You: ' : ''}
                                {chat.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className={`${selectedChat ? 'block' : 'hidden lg:block'} flex-1 flex flex-col`}>
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedChat(null)}
                          className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        
                        {(() => {
                          const partner = getChatPartner(selectedChat);
                          const Icon = partner.icon;
                          
                          return (
                            <>
                              {partner.image ? (
                                <img
                                  src={`http://localhost:5000/uploads/${partner.image}`}
                                  alt={partner.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              
                              <div>
                                <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                                <p className="text-sm text-gray-500">{partner.subtitle}</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      
                      <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                        <Phone className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {selectedChat.productId && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {selectedChat.productId.images.length > 0 && (
                            <img
                              src={`http://localhost:5000/uploads/${selectedChat.productId.images[0]}`}
                              alt={selectedChat.productId.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Discussion about: {selectedChat.productId.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {selectedChat.messages.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedChat.messages.map((message, index) => {
                          const isOwnMessage = message.senderRole === user?.role;
                          const showDate = index === 0 || 
                            formatDate(message.timestamp) !== formatDate(selectedChat.messages[index - 1].timestamp);
                          
                          return (
                            <div key={index}>
                              {showDate && (
                                <div className="text-center py-2">
                                  <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                                    {formatDate(message.timestamp)}
                                  </span>
                                </div>
                              )}
                              
                              <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                <div
                                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    isOwnMessage
                                      ? 'bg-green-600 text-white'
                                      : 'bg-white text-gray-900 border border-gray-200'
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      isOwnMessage ? 'text-green-100' : 'text-gray-500'
                                    }`}
                                  >
                                    {formatTime(message.timestamp)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <form onSubmit={sendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500">Choose a chat from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;