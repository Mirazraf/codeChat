import { Users, Hash, Lock } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';

const RoomList = ({ rooms, currentRoom }) => {
  const { setCurrentRoom, leaveRoom } = useChatStore();
  const { user } = useAuthStore();

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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2">
        <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
          Rooms ({rooms.length})
        </h3>
        {rooms.map((room) => (
          <button
            key={room._id}
            onClick={() => handleRoomClick(room)}
            className={`w-full text-left px-3 py-3 rounded-lg mb-1 transition flex items-center space-x-3 ${
              currentRoom?._id === room._id
                ? 'bg-primary text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div
              className={`${
                currentRoom?._id === room._id ? 'text-white' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {getRoomIcon(room.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{room.name}</div>
              <div
                className={`text-xs truncate ${
                  currentRoom?._id === room._id
                    ? 'text-blue-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {room.members?.length || 0} members
              </div>
            </div>
          </button>
        ))}
        
        {rooms.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No rooms yet</p>
            <p className="text-xs mt-1">Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList;
