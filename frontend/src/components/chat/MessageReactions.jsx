import { useState } from 'react';

const MessageReactions = ({ reactions, currentUserId, onReactionClick }) => {
  const [showReactionDetails, setShowReactionDetails] = useState(false);

  if (!reactions || reactions.length === 0) return null;

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    const emoji = reaction.emoji;
    if (!acc[emoji]) {
      acc[emoji] = [];
    }
    acc[emoji].push(reaction);
    return acc;
  }, {});

  // Check if current user reacted
  const userReacted = reactions.some(r => r.user._id === currentUserId);

  return (
    <div className="relative inline-block mt-1">
      <div 
        className="flex items-center space-x-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5 shadow-sm cursor-pointer hover:shadow-md transition"
        onMouseEnter={() => setShowReactionDetails(true)}
        onMouseLeave={() => setShowReactionDetails(false)}
      >
        {Object.entries(groupedReactions).map(([emoji, reactionList]) => (
          <div 
            key={emoji} 
            className="flex items-center space-x-0.5"
            onClick={() => onReactionClick?.(emoji)}
          >
            <span className="text-sm">{emoji}</span>
            {reactionList.length > 1 && (
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {reactionList.length}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Reaction Details Tooltip */}
      {showReactionDetails && (
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 min-w-[200px] z-50">
          <div className="space-y-2">
            {Object.entries(groupedReactions).map(([emoji, reactionList]) => (
              <div key={emoji} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {reactionList.length} {reactionList.length === 1 ? 'reaction' : 'reactions'}
                  </span>
                </div>
                <div className="pl-7 space-y-1">
                  {reactionList.map((reaction) => (
                    <div 
                      key={reaction.user._id} 
                      className="text-xs text-gray-600 dark:text-gray-300"
                    >
                      {reaction.user.username}
                      {reaction.user._id === currentUserId && ' (You)'}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageReactions;