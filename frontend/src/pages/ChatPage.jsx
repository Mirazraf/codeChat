import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import socketService from '../services/socketService';
import RoomList from '../components/chat/RoomList';
import ChatWindow from '../components/chat/ChatWindow';
import OnlineUsers from '../components/chat/OnlineUsers';
import CreateRoomModal from '../components/chat/CreateRoomModal';
import ToastProvider from '../components/common/ToastProvider';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { user } = useAuthStore();
  const {
    rooms,
    currentRoom,
    fetchRooms,
    addMessage,
    setOnlineUsers,
    setTypingUser,
    updateMessageReaction,
    updateEditedMessage,
    handleDeletedMessage,
    leaveRoom,
  } = useChatStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    document.body.classList.add('chat-page');
    document.documentElement.style.overflow = 'hidden';

    const socket = socketService.connect(user._id);

    fetchRooms().catch((err) => {
      toast.error('Failed to load rooms');
    });

    // Listen for messages
    socketService.onMessage((message) => {
      addMessage(message);
    });

    // Listen for message reactions
    socketService.onMessageReaction((updatedMessage) => {
      updateMessageReaction(updatedMessage);
    });

    // Listen for message edits
    socketService.onMessageEdited((editedMessage) => {
      updateEditedMessage(editedMessage);
      toast.success('Message updated');
    });

    // Listen for message deletions
    socketService.onMessageDeleted((data) => {
      handleDeletedMessage(data);
    });

    // Listen for online users
    socketService.onOnlineUsers((users) => {
      setOnlineUsers(users);
    });

    // Listen for typing indicators
    socketService.onUserTyping(({ username, isTyping }) => {
      setTypingUser(username, isTyping);
    });

    return () => {
      document.body.classList.remove('chat-page');
      document.documentElement.style.overflow = '';
      
      if (currentRoom) {
        leaveRoom(user._id);
      }
      socketService.disconnect();
    };
  }, [user?._id, navigate]);

  return (
    <div 
      className="fixed inset-0 flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden" 
      style={{ top: '64px' }}
    >
      <ToastProvider />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Room List */}
        <div className={`${currentRoom ? 'hidden md:flex' : 'flex'} w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col overflow-hidden`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              + Create Room
            </button>
          </div>
          <RoomList rooms={rooms} currentRoom={currentRoom} />
        </div>

        {/* Middle - Chat Window */}
        <div className={`${currentRoom ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden`}>
          {currentRoom ? (
            <ChatWindow replyingTo={replyingTo} onCancelReply={() => setReplyingTo(null)} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center px-4">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                  Welcome to CodeChat!
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Select a room or create a new one to start chatting
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Online Users (hidden on mobile) */}
        <div className="hidden lg:block overflow-hidden">
          <OnlineUsers />
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default ChatPage;