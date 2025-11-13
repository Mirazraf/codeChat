import { useNavigate } from 'react-router-dom';
import useChatStore from '../../store/useChatStore';
import useThemeStore from '../../store/useThemeStore';

const OnlineUsers = () => {
  const { onlineUsers } = useChatStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200">
          Online ({onlineUsers.length})
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {onlineUsers.map((user) => (
          <button
            key={user.userId}
            onClick={() => navigate(`/user/${user.userId}`)}
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition cursor-pointer"
          >
            <div className="relative">
              <img
                src={user.avatar || 'https://via.placeholder.com/40'}
                alt={user.username}
                className="w-10 h-10 rounded-full"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">
                {user.username}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</div>
            </div>
          </button>
        ))}
        
        {onlineUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No users online</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;
