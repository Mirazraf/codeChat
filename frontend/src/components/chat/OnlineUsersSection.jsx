import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronDown } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';

const OnlineUsersSection = () => {
  const { onlineUsers } = useChatStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // Subtask 2.1: Implement localStorage persistence for collapsed/expanded state
  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = localStorage.getItem('onlineUsersExpanded');
    return stored !== 'false'; // Default to expanded if not set
  });
  
  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('onlineUsersExpanded', newState.toString());
  };
  
  // Subtask 2.2: Implement user sorting (current user first, then alphabetical)
  const sortedUsers = useMemo(() => {
    return [...onlineUsers].sort((a, b) => {
      if (a.userId === user._id) return -1;
      if (b.userId === user._id) return 1;
      return a.username.localeCompare(b.username);
    });
  }, [onlineUsers, user._id]);
  
  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      {/* Subtask 2.1: Collapsible header showing user count */}
      <button 
        onClick={toggleExpanded} 
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        aria-label={isExpanded ? 'Collapse online users' : 'Expand online users'}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            Online ({onlineUsers.length})
          </span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {/* Subtask 2.2: Horizontal scrollable user list */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {onlineUsers.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {sortedUsers.map((onlineUser) => (
                <button
                  key={onlineUser.userId}
                  onClick={() => navigate(`/user/${onlineUser.userId}`)}
                  className="flex flex-col items-center gap-1 flex-shrink-0 group"
                  aria-label={`View ${onlineUser.username}'s profile`}
                >
                  {/* Subtask 2.2: Render user avatars (56px) with usernames below */}
                  <div className="relative">
                    <img
                      src={onlineUser.avatar || 'https://via.placeholder.com/56'}
                      alt={onlineUser.username}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-500 transition-all"
                    />
                    {/* Subtask 2.3: Position green dot (14px) at bottom-right of each avatar */}
                    <div 
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"
                      aria-label="Online"
                    />
                  </div>
                  {/* Subtask 2.2: Username below avatar */}
                  <span className="text-xs font-medium text-center max-w-[60px] truncate text-gray-900 dark:text-gray-100">
                    {onlineUser.userId === user._id ? 'You' : onlineUser.username}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No users online</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OnlineUsersSection;
