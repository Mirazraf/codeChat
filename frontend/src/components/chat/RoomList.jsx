import { Users, Hash, Lock } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import formatDate from '../../utils/formatDate';

const RoomList = ({ rooms, currentRoom }) => {
  const { setCurrentRoom, leaveRoom } = useChatStore();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

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
    // Room is unread if it has a lastMessage and it's not the current room
    // and the user hasn't read it yet
    return room.hasUnread && room._id !== currentRoom?._id;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2">
        <h3 className={`px-3 py-2 text-xs font-semibold uppercase ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Rooms ({rooms.length})
        </h3>
        {rooms.map((room) => {
          const hasUnread = isRoomUnread(room);
          
          return (
            <button
              key={room._id}
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className={`truncate ${hasUnread ? 'font-bold' : 'font-semibold'}`}>
                    {room.name}
                  </div>
                  {room.lastMessage && (
                    <span
                      className={`text-xs ml-2 flex-shrink-0 ${
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
                <div
                  className={`text-xs truncate ${
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
              </div>
              {hasUnread && (
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                  theme === 'dark' ? 'bg-purple-500' : 'bg-teal-500'
                }`} />
              )}
            </button>
          );
        })}
        
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
  );
};

export default RoomList;