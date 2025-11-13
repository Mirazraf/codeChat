import { useState } from 'react';
import { Users, Lock, Hash, GraduationCap, ArrowRight } from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const RoomPreview = ({ room }) => {
  const { theme } = useThemeStore();
  const { joinRoomAndFetchMessages } = useChatStore();
  const { user } = useAuthStore();
  const [joining, setJoining] = useState(false);

  const getRoomIcon = () => {
    switch (room.type) {
      case 'private':
        return <Lock className="w-12 h-12" />;
      case 'classroom':
        return <GraduationCap className="w-12 h-12" />;
      default:
        return <Hash className="w-12 h-12" />;
    }
  };

  const getRoomTypeLabel = () => {
    switch (room.type) {
      case 'private':
        return 'Private Room';
      case 'classroom':
        return 'Classroom';
      default:
        return 'Public Room';
    }
  };

  const handleJoinRoom = async () => {
    setJoining(true);
    try {
      await joinRoomAndFetchMessages(room._id, user._id);
      toast.success(`✅ Joined ${room.name} successfully!`, {
        duration: 3000,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to join room';
      toast.error(`❌ ${errorMessage}`, {
        duration: 4000,
      });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className={`flex-1 flex items-center justify-center p-4 ${
      theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-gray-50'
    }`}>
      <div className={`max-w-2xl w-full rounded-2xl shadow-xl p-8 md:p-12 text-center ${
        theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-white'
      }`}>
        {/* Room Icon */}
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-6 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
            : 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white'
        }`}>
          {getRoomIcon()}
        </div>

        {/* Room Name */}
        <h1 className={`text-3xl md:text-4xl font-bold mb-3 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {room.name}
        </h1>

        {/* Room Type Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
            theme === 'dark'
              ? 'bg-purple-900 text-purple-200'
              : 'bg-purple-100 text-purple-800'
          }`}>
            {getRoomTypeLabel()}
          </span>
          <span className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium ${
            theme === 'dark'
              ? 'bg-gray-700 text-gray-300'
              : 'bg-gray-100 text-gray-700'
          }`}>
            <Users className="w-4 h-4" />
            {room.members?.length || 0} members
          </span>
        </div>

        {/* Room Description */}
        {room.description && (
          <p className={`text-lg mb-8 max-w-xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {room.description}
          </p>
        )}

        {!room.description && (
          <p className={`text-base mb-8 max-w-xl mx-auto ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No description available
          </p>
        )}

        {/* Creator Info */}
        <div className={`flex items-center justify-center gap-3 mb-8 p-4 rounded-xl ${
          theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-gray-50'
        }`}>
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {room.creator?.avatar ? (
              <img
                src={room.creator.avatar}
                alt={room.creator.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-white font-bold ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                  : 'bg-gradient-to-br from-teal-500 to-emerald-500'
              }`}>
                {room.creator?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-left">
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Created by
            </p>
            <p className={`font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {room.creator?.username}
            </p>
          </div>
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoinRoom}
          disabled={joining}
          className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 mx-auto ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/50'
              : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/50'
          }`}
        >
          {joining ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              <span>Joining...</span>
            </>
          ) : (
            <>
              <span>Join Room</span>
              <ArrowRight className="w-6 h-6" />
            </>
          )}
        </button>

        {/* Info Text */}
        <p className={`mt-6 text-sm ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        }`}>
          Join this room to view messages and start chatting
        </p>
      </div>
    </div>
  );
};

export default RoomPreview;
