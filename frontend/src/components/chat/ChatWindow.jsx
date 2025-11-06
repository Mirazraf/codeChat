import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, Users, Settings, ArrowLeft } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatWindow = () => {
  const { currentRoom, messages, typingUsers, leaveRoom } = useChatStore();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [showScrollButton, setShowScrollButton] = useState(false);

  const handleBack = async () => {
    await leaveRoom(user._id);
  };

  // Check if near bottom
  const checkScrollPosition = () => {
    const container = document.querySelector('[data-messages-container]');
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    setShowScrollButton(!isNearBottom);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    const container = document.querySelector('[data-messages-container]');
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Listen for scroll events
  useEffect(() => {
    const container = document.querySelector('[data-messages-container]');
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [currentRoom]);

  return (
    <div className={`flex-1 flex flex-col overflow-hidden relative ${
      theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-white'
    }`}>
      {/* Chat Header */}
      <div className={`h-16 border-b flex items-center justify-between px-4 md:px-6 flex-shrink-0 ${
        theme === 'dark' 
          ? 'border-gray-700 bg-[#1e1e2d]' 
          : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center space-x-3 min-w-0">
          {/* Back button for mobile */}
          <button
            onClick={handleBack}
            className={`md:hidden p-2 rounded-lg transition ${
              theme === 'dark'
                ? 'hover:bg-[#2d2d3d] text-gray-300'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
              : 'bg-gradient-to-br from-teal-500 to-emerald-500'
          }`}>
            {currentRoom?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className={`font-bold text-base md:text-lg truncate ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {currentRoom?.name}
            </h2>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {currentRoom?.members?.length || 0} members
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className={`p-2 rounded-lg transition ${
            theme === 'dark'
              ? 'hover:bg-[#2d2d3d] text-gray-300'
              : 'hover:bg-gray-100 text-gray-600'
          }`}>
            <Users className="w-5 h-5" />
          </button>
          <button className={`hidden md:block p-2 rounded-lg transition ${
            theme === 'dark'
              ? 'hover:bg-[#2d2d3d] text-gray-300'
              : 'hover:bg-gray-100 text-gray-600'
          }`}>
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <MessageList messages={messages} />

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className={`px-4 md:px-6 py-2 text-sm italic flex-shrink-0 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'}{' '}
          typing...
        </div>
      )}

      {/* Scroll to Bottom Button - CENTERED & SMALL */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className={`absolute bottom-20 left-1/2 -translate-x-1/2 md:bottom-24 rounded-full p-2 shadow-lg transition-all z-50 hover:scale-110 ${
            theme === 'dark'
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-teal-500 hover:bg-teal-600 text-white'
          }`}
          title="Scroll to bottom"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Message Input */}
      <div className="flex-shrink-0">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatWindow;
