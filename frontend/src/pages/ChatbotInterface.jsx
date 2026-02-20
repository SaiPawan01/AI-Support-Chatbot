import { useState, useRef, useEffect } from 'react';
import { Send, Plus, MessageCircle, Settings, LogOut, Paperclip, Smile, Search, Trash2, Copy, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';
import { logoutUser } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';

export default function ChatbotInterface() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm SupportBot AI. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      confidence: null,
      sources: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [conversations, setConversations] = useState([
    { id: 1, title: 'How to reset password', date: 'Today' },
    { id: 2, title: 'VPN Setup Issues', date: 'Yesterday' },
    { id: 3, title: 'Leave Policy Questions', date: '2 days ago' }
  ]);
  const [activeConversation, setActiveConversation] = useState(1);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() && !selectedFile) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      file: selectedFile
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedFile(null);
    setLoading(true);

    // Simulate AI response with confidence score
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text: "To reset your password, follow these steps:\n\n1. Click on your profile icon\n2. Select 'Account Settings'\n3. Click 'Change Password'\n4. Enter your current password\n5. Enter your new password\n6. Confirm the new password\n7. Click 'Save Changes'\n\nIf you need further assistance, visit our Help Center.",
        sender: 'bot',
        timestamp: new Date(),
        confidence: 0.94,
        sources: [
          { title: 'Password Reset Guide', url: '#', section: 'Account Management' },
          { title: 'Security Best Practices', url: '#', section: 'Security' }
        ]
      };

      setMessages(prev => [...prev, botMessage]);
      setLoading(false);
    }, 1500);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(2),
        type: file.type
      });
    }
  };

  const handleFeedback = (messageId, isPositive) => {
    setFeedbackGiven(prev => ({
      ...prev,
      [messageId]: isPositive ? 'positive' : 'negative'
    }));
    // TODO: Send feedback to backend
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  const startNewChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm SupportBot AI. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
        confidence: null,
        sources: []
      }
    ]);
    setFeedbackGiven({});
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-400';
    if (confidence >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const navigate = useNavigate();;
  const handleLogout =async () => {
    try{
      const response = await logoutUser();
      if(response.status === 200){
        localStorage.removeItem('access_token');
        navigate('/login');
      }
    } catch(error){
      console.error("Logout error:", error);
    }
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-slate-800 border-r border-slate-700 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-blue-500" />
          <span className="text-white font-bold hidden sm:inline">SupportBot AI</span>
        </div>

        {/* New Chat Button */}
        <button
          onClick={startNewChat}
          className="m-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>

        {/* Search */}
        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2">
          <p className="text-xs text-slate-400 px-2 py-2 uppercase font-semibold">Recent</p>
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition ${
                activeConversation === conv.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <p className="text-sm font-medium truncate">{conv.title}</p>
              <p className="text-xs text-slate-400">{conv.date}</p>
            </button>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-slate-700 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition">
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-white font-semibold">Support Assistant</h2>
              <p className="text-sm text-slate-400">Always ready to help</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((message, idx) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-3xl rounded-tr-none'
                    : 'bg-slate-700 text-slate-100 rounded-3xl rounded-tl-none'
                } px-6 py-4 space-y-3`}
              >
                {/* Message Text */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>

                {/* File Attachment (if any) */}
                {message.file && (
                  <div className="bg-slate-600/50 rounded px-3 py-2 flex items-center gap-2 text-xs">
                    <Paperclip className="w-4 h-4" />
                    {message.file.name} ({message.file.size}KB)
                  </div>
                )}

                {/* Confidence Score & Sources (Bot only) */}
                {message.sender === 'bot' && message.confidence && (
                  <div className="space-y-2 pt-2 border-t border-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Confidence:</span>
                      <span className={`text-xs font-semibold ${getConfidenceColor(message.confidence)}`}>
                        {(message.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    {/* Sources */}
                    {message.sources.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400">Sources:</p>
                        {message.sources.map((source, srcIdx) => (
                          <a
                            key={srcIdx}
                            href={source.url}
                            className="text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1 transition"
                          >
                            <FileText className="w-3 h-3" />
                            {source.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Feedback & Actions (Bot only) */}
                {message.sender === 'bot' && idx > 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-600">
                    <button
                      onClick={() => handleFeedback(message.id, true)}
                      className={`p-1.5 rounded transition ${
                        feedbackGiven[message.id] === 'positive'
                          ? 'bg-green-500/30 text-green-400'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="This was helpful"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, false)}
                      className={`p-1.5 rounded transition ${
                        feedbackGiven[message.id] === 'negative'
                          ? 'bg-red-500/30 text-red-400'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="This wasn't helpful"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopyMessage(message.text)}
                      className="p-1.5 rounded text-slate-400 hover:text-slate-200 transition"
                      title="Copy message"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-slate-400 pt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-100 rounded-3xl rounded-tl-none px-6 py-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-slate-800 border-t border-slate-700 px-6 py-4">
          {/* File Preview */}
          {selectedFile && (
            <div className="mb-3 bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Paperclip className="w-4 h-4" />
                {selectedFile.name}
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-slate-400 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="flex gap-3 items-end">
              <div className="relative flex-1 flex items-center bg-slate-700 border border-slate-600 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything... (IT policies, troubleshooting, procedures)"
                  className="flex-1 bg-transparent text-white placeholder-slate-500 px-4 py-3 outline-none text-sm"
                />

                {/* Attachment Button */}
                <label className="p-2 text-slate-400 hover:text-white cursor-pointer transition">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <Paperclip className="w-5 h-5" />
                </label>

                {/* Emoji Button */}
                <button
                  type="button"
                  className="p-2 text-slate-400 hover:text-white transition"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputValue.trim() && !selectedFile || loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white p-3 rounded-xl transition disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Info Text */}
            <p className="text-xs text-slate-500 text-center">
              SupportBot AI can make mistakes. For critical issues, escalate to human support.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// Menu icon (add to imports if not available)
const Menu = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);