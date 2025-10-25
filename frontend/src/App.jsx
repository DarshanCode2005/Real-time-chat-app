import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join chat room
  const joinChat = () => {
    if (username.trim()) {
      connectWebSocket(username.trim());
      setIsJoined(true);
    }
  };

  // Connect to WebSocket
  const connectWebSocket = (user) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${user}`);
    
    ws.onopen = () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'history') {
        setMessages(data.messages);
      } else if (data.type === 'message') {
        setMessages((prev) => [...prev, data]);
      } else if (data.type === 'user_joined') {
        setOnlineUsers(data.online_users);
        setMessages((prev) => [...prev, {
          type: 'system',
          message: `${data.username} joined the chat`,
          timestamp: data.timestamp
        }]);
      } else if (data.type === 'user_left') {
        setOnlineUsers(data.online_users);
        setMessages((prev) => [...prev, {
          type: 'system',
          message: `${data.username} left the chat`,
          timestamp: data.timestamp
        }]);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    };

    wsRef.current = ws;
  };

  // Send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: inputMessage }));
      setInputMessage('');
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Leave chat
  const leaveChat = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsJoined(false);
    setMessages([]);
    setOnlineUsers([]);
    setUsername('');
  };

  // Login screen
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">💬 Chat App</h1>
            <p className="text-gray-600">Enter your username to join</p>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); joinChat(); }}>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500 text-lg"
              maxLength={20}
            />
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200 transform hover:scale-105"
              disabled={!username.trim()}
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Chat screen
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">💬</div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Real-Time Chat</h1>
              <p className="text-sm text-gray-600">
                {isConnected ? (
                  <span className="text-green-600">● Connected</span>
                ) : (
                  <span className="text-red-600">● Disconnected</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={leaveChat}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            Leave
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 h-[calc(100vh-88px)] flex gap-4">
        {/* Online Users Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow-md p-4 hidden md:block">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-green-500 mr-2">●</span>
            Online ({onlineUsers.length})
          </h2>
          <div className="space-y-2">
            {onlineUsers.map((user, index) => (
              <div
                key={index}
                className={`px-3 py-2 rounded-lg ${
                  user === username ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user} {user === username && '(You)'}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, index) => {
              if (msg.type === 'system') {
                return (
                  <div key={index} className="text-center">
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {msg.message}
                    </span>
                  </div>
                );
              }

              const isOwn = msg.username === username;
              
              return (
                <div
                  key={msg.id || index}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isOwn ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-center mb-1 space-x-2">
                      <span className={`text-sm font-semibold ${isOwn ? 'text-blue-600' : 'text-gray-700'}`}>
                        {isOwn ? 'You' : msg.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-blue-500 text-white rounded-tr-none'
                          : 'bg-gray-200 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                disabled={!isConnected}
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={!isConnected || !inputMessage.trim()}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;