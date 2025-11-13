import { useState, useEffect, useRef } from 'react';
import { Users, Hash, Lock, Pin, MoreVertical, Trash2, PinOff } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import { roomService } from '../../services/roomService';
import formatDate from '../../utils/formatDate';
import toast from 'react-hot-toast';
import OnlineUsersSection from './OnlineUsersSection';

const RoomList = ({ rooms, currentRoom }) => {
  const { setCurrentRoom, leaveRoom, fetchRooms } = useChatStore();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const [showMenu, setShowMenu] = useState(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(null);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMenu]);

  const handleRoomClick = async (room) => {
    if (currentRoom?._id !== room._id) {
      await leaveRoom(user._id);
      await setCurrentRoom(room, user._id);
    }
  };

  const getRoomIcon = (type) => {
    switch (type) {
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'classroom':
        return <Users className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  const getLastMessagePreview = (lastMessage) => {
    if (!lastMessage) return 'No messages yet';
    
    const isOwnMessage = lastMessage.sender?._id === user._id;
    const senderName = isOwnMessage ? 'You' : lastMessage.sender?.username || 'Unknown';
    
    if (lastMessage.type === 'code') {
      return `${senderName}: 📝 Code snippet`;
    } else if (lastMessage.type === 'image') {
      return `${senderName}: 🖼️ Image`;
    } else if (lastMessage.type === 'file') {
      return `${senderName}: 📎 ${lastMessage.fileName || 'File'}`;
    } else if (lastMessage.type === 'system') {
      return lastMessage.content;
    }
    
    return `${senderName}: ${lastMessage.content}`;
  };

  const formatLastMessageTime = (date) => {
    if (!date) return '';
    
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isRoomUnread = (room) => {
    return room.hasUnread && room._id !== currentRoom?._id;
  };

  const handlePinRoom = async (e, roomId) => {
    e.stopPropagation();
    try {
      await roomService.togglePinRoom(roomId);
      await fetchRooms();
      toast.success('Room pin status updated');
    } catch (error) {
      toast.error('Failed to update pin status');
    }
    setShowMenu(null);
  };

  const handleDeleteRoom = async (e, roomId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }
    try {
      await roomService.deleteRoom(roomId);
      await fetchRooms();
      toast.success('Room deleted successfully');
      if (currentRoom?._id === roomId) {
        await leaveRoom(user._id);
      }
    } catch (error) {
      toast.error('Failed to delete room');
    }
    setShowMenu(null);
  };

  // Categorize rooms
  const pinnedRooms = rooms.filter(r => r.isPinned);
  const publicRooms = rooms.filter(r => !r.isPinned && r.type === 'public');
  const privateRooms = rooms.filter(r => !r.isPinned && r.type === 'private');
  const classroomRooms = rooms.filter(r => !r.isPinned && r.type === 'classroom');

  const renderRoom = (room) => {
    const hasUnread = isRoomUnread(room);
    const isCreator = room.creator._id === user._id;
    
    return (
      <div key={room._id} className="relative group">
        <button
          onClick={() => handleRoomClick(room)}
          className={`w-full text-left px-3 py-3 rounded-lg mb-1 transition flex items-start space-x-3 relative ${
            currentRoom?._id === room._id
              ? theme === 'dark'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                : 'bg-gray-800 text-white'
              : theme === 'dark'
                ? 'hover:bg-[#2d2d3d] text-gray-300'
                : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
              <div
                className={`mt-1 ${
                  currentRoom?._id === room._id 
                    ? 'text-white' 
                    : theme === 'dark'
                      ? 'text-gray-400'
                      : 'text-gray-500'
                }`}
              >
                {getRoomIcon(room.type)}
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-start justify-between mb-1 gap-2">
                  <div className={`truncate flex-1 ${hasUnread ? 'font-bold' : 'font-semibold'}`}>
                    {room.name}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`text-xs truncate flex-1 ${
                      hasUnread ? 'font-semibold' : ''
                    } ${
                      currentRoom?._id === room._id
                        ? theme === 'dark'
                          ? 'text-purple-200'
                          : 'text-gray-300'
                        : theme === 'dark'
                          ? hasUnread ? 'text-gray-200' : 'text-gray-400'
                          : hasUnread ? 'text-gray-700' : 'text-gray-500'
                    }`}
                  >
                    {getLastMessagePreview(room.lastMessage)}
                  </div>
                  {room.lastMessage && (
                    <span
                      className={`text-xs flex-shrink-0 ${
                        currentRoom?._id === room._id
                          ? theme === 'dark'
                            ? 'text-purple-200'
                            : 'text-gray-300'
                          : hasUnread
                            ? theme === 'dark'
                              ? 'text-purple-400 font-semibold'
                              : 'text-teal-600 font-semibold'
                            : theme === 'dark'
                              ? 'text-gray-500'
                              : 'text-gray-400'
                      }`}
                    >
                      {formatLastMessageTime(room.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            {/* Unread indicator - positioned on the left side of icon */}
            {hasUnread && (
              <div className={`absolute left-1 bottom-3 -translate-y-1/2 w-2 h-2 rounded-full ${
                theme === 'dark' ? 'bg-purple-500' : 'bg-teal-500'
              }`} />
            )}
          </button>

          {/* Menu Button - Always visible on mobile, hover on desktop */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(showMenu === room._id ? null : room._id);
            }}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded transition md:opacity-0 md:group-hover:opacity-100 ${
              theme === 'dark'
                ? 'hover:bg-[#2d2d3d] text-gray-400'
                : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu === room._id && (
            <div 
              ref={menuRef}
              className={`absolute right-2 top-12 rounded-lg shadow-xl py-1 z-50 min-w-[150px] ${
                theme === 'dark'
                  ? 'bg-[#2d2d3d] border border-gray-700'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <button
                onClick={(e) => handlePinRoom(e, room._id)}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition ${
                  theme === 'dark'
                    ? 'hover:bg-[#1e1e2d] text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {room.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                {room.isPinned ? 'Unpin' : 'Pin'}
              </button>
              {isCreator && (
                <button
                  onClick={(e) => handleDeleteRoom(e, room._id)}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition ${
                    theme === 'dark'
                      ? 'hover:bg-[#1e1e2d] text-red-400'
                      : 'hover:bg-red-50 text-red-600'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Room
                </button>
              )}
            </div>
          )}
        </div>
      );
    };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Room List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {/* Pinned Section */}
          {pinnedRooms.length > 0 && (
            <div className="mb-4">
              <h3 className={`px-3 py-2 text-xs font-semibold uppercase flex items-center gap-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Pin className="w-3 h-3" />
                Pinned ({pinnedRooms.length})
              </h3>
              {pinnedRooms.map(renderRoom)}
            </div>
          )}

          {/* Public Rooms Section */}
          {publicRooms.length > 0 && (
            <div className="mb-4">
              <h3 className={`px-3 py-2 text-xs font-semibold uppercase flex items-center gap-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Hash className="w-3 h-3" />
                Public ({publicRooms.length})
              </h3>
              {publicRooms.map(renderRoom)}
            </div>
          )}

          {/* Private Rooms Section */}
          {privateRooms.length > 0 && (
            <div className="mb-4">
              <h3 className={`px-3 py-2 text-xs font-semibold uppercase flex items-center gap-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Lock className="w-3 h-3" />
                Private ({privateRooms.length})
              </h3>
              {privateRooms.map(renderRoom)}
            </div>
          )}

          {/* Classroom Section */}
          {classroomRooms.length > 0 && (
            <div className="mb-4">
              <h3 className={`px-3 py-2 text-xs font-semibold uppercase flex items-center gap-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Users className="w-3 h-3" />
                Classroom ({classroomRooms.length})
              </h3>
              {classroomRooms.map(renderRoom)}
            </div>
          )}
          
          {rooms.length === 0 && (
            <div className={`text-center py-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <p className="text-sm">No rooms yet</p>
              <p className="text-xs mt-1">Create one to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Online Users Section - Only visible on mobile/tablet (< lg breakpoint) */}
      <div className="lg:hidden">
        <OnlineUsersSection />
      </div>
    </div>
  );
};

export default RoomList;