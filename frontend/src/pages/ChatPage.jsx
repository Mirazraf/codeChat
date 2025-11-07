import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import useThemeStore from '../store/useThemeStore';
import socketService from '../services/socketService';
import RoomList from '../components/chat/RoomList';
import ChatWindow from '../components/chat/ChatWindow';
import OnlineUsers from '../components/chat/OnlineUsers';
import CreateRoomModal from '../components/chat/CreateRoomModal';
import toast, { Toaster } from 'react-hot-toast';
import ToastProvider from '../components/common/ToastProvider';
import PageTitle from '../components/PageTitle';



const ChatPage = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const {
    rooms,
    currentRoom,
    fetchRooms,
    addMessage,
    setOnlineUsers,
    setTypingUser,
    leaveRoom,
  } = useChatStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Add class to body to prevent scrolling
    document.body.classList.add('chat-page');
    document.documentElement.style.overflow = 'hidden';

    // Connect to socket
    const socket = socketService.connect(user._id);

    // Fetch rooms
    fetchRooms().catch((err) => {
      toast.error('Failed to load rooms');
    });

    // Listen for messages
    socketService.onMessage((message) => {
      addMessage(message);
    });

    // Listen for online users
    socketService.onOnlineUsers((users) => {
      setOnlineUsers(users);
    });

    // Listen for typing indicators
    socketService.onUserTyping(({ username, isTyping }) => {
      setTypingUser(username, isTyping);
    });

    // Cleanup on unmount - leave room when navigating away
    return () => {
      document.body.classList.remove('chat-page');
      document.documentElement.style.overflow = '';
      if (currentRoom) {
        leaveRoom(user._id);
      }
      socketService.disconnect();
    };
  }, [user, navigate]);

  return (
  <>
    <PageTitle title={currentRoom?.name ? `${currentRoom.name} - Chat` : 'Chat'} />
    <div 
      className={`fixed inset-0 flex flex-col overflow-hidden ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      }`}
      style={{ top: '64px' }}
    >
      <ToastProvider />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Room List */}
        <div className={`${currentRoom ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r flex-col overflow-hidden ${
          theme === 'dark'
            ? 'bg-[#1e1e2d] border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-4 border-b flex-shrink-0 ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={() => setShowCreateModal(true)}
              className={`w-full font-bold py-2 px-4 rounded-lg transition ${
                theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-800 hover:bg-gray-900 text-white'
              }`}
            >
              + Create Room
            </button>
          </div>
          <RoomList rooms={rooms} currentRoom={currentRoom} />
        </div>

        {/* Middle - Chat Window */}
        <div className={`${currentRoom ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden`}>
          {currentRoom ? (
            <ChatWindow />
          ) : (
            <div className={`flex-1 flex items-center justify-center ${
              theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-gray-50'
            }`}>
              <div className="text-center px-4">
                <div className="text-6xl mb-4">💬</div>
                <h2 className={`text-2xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Welcome to CodeChat!
                </h2>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
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
    </>
  );
};

export default ChatPage;
