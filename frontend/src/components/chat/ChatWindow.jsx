import { useNavigate } from 'react-router-dom';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Users, Settings, ArrowLeft } from 'lucide-react';

const ChatWindow = () => {
  const { currentRoom, messages, typingUsers, leaveRoom } = useChatStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleBack = async () => {
    await leaveRoom(user._id);
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
      {/* Chat Header */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          {/* Back button for mobile */}
          <button
            onClick={handleBack}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
            {currentRoom?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-base md:text-lg truncate text-gray-900 dark:text-white">{currentRoom?.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentRoom?.members?.length || 0} members
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <Users className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button className="hidden md:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <MessageList messages={messages} />

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 md:px-6 py-2 text-sm text-gray-500 dark:text-gray-400 italic flex-shrink-0">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'}{' '}
          typing...
        </div>
      )}

      {/* Message Input */}
      <div className="flex-shrink-0">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatWindow;
