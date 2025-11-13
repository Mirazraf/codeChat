import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useThemeStore from '../../store/useThemeStore';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';

const RoomMembersModal = ({ isOpen, onClose, room }) => {
  const { theme } = useThemeStore();
  const { onlineUsers } = useChatStore();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();

  if (!isOpen || !room) return null;

  // Check if a member is online
  const isUserOnline = (userId) => {
    return onlineUsers.some(u => u.userId === userId);
  };

  // Handle member click to view profile
  const handleMemberClick = (memberId) => {
    if (memberId === currentUser._id) {
      navigate('/profile');
    } else {
      navigate(`/user/${memberId}`);
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`fixed right-0 top-0 h-full w-full md:w-96 z-50 shadow-2xl transform transition-transform ${
        theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Room Members
            </h2>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {room.members?.length || 0} members
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition ${
              theme === 'dark'
                ? 'hover:bg-[#2d2d3d] text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Members List */}
        <div className="overflow-y-auto h-[calc(100%-80px)] p-4">
          {room.members && room.members.length > 0 ? (
            <div className="space-y-2">
              {room.members.map((member) => {
                const isOnline = isUserOnline(member._id);
                const isCurrentUser = member._id === currentUser._id;
                const isCreator = member._id === room.creator._id;

                return (
                  <button
                    key={member._id}
                    onClick={() => handleMemberClick(member._id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition cursor-pointer ${
                      theme === 'dark'
                        ? 'hover:bg-[#2d2d3d]'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {/* Avatar with online indicator */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center text-white font-bold ${
                            theme === 'dark'
                              ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                              : 'bg-gradient-to-br from-teal-500 to-emerald-500'
                          }`}>
                            {member.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {/* Online indicator */}
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${
                        theme === 'dark' ? 'border-[#1e1e2d]' : 'border-white'
                      } ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>

                    {/* Member info */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold truncate ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {member.username}
                          {isCurrentUser && (
                            <span className={`ml-2 text-xs ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              (You)
                            </span>
                          )}
                        </p>
                        {isCreator && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            theme === 'dark'
                              ? 'bg-purple-900 text-purple-200'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            Creator
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className={`text-sm capitalize ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {member.role}
                        </p>
                        <span className={`text-xs ${
                          isOnline
                            ? 'text-green-500'
                            : theme === 'dark'
                              ? 'text-gray-500'
                              : 'text-gray-400'
                        }`}>
                          • {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className={`flex-shrink-0 ${
                      theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No members in this room
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RoomMembersModal;
