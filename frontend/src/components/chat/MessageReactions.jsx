import { useState } from 'react';
import ReactionPicker from './ReactionPicker';
import { Smile } from 'lucide-react';

const MessageReactions = ({ 
  messageId, 
  reactions = [], 
  currentUserId, 
  onAddReaction, 
  onRemoveReaction,
  isOwnMessage = false // NEW: To determine positioning
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleReactionClick = (emoji) => {
    // Check if current user already reacted with this emoji
    const reaction = reactions.find(r => r.emoji === emoji);
    const userReacted = reaction?.users?.some(
      uid => uid.toString() === currentUserId.toString()
    );

    if (userReacted) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
  };

  const handleAddNewReaction = (emoji) => {
    onAddReaction(messageId, emoji);
  };

  return (
    <div className="flex items-center gap-1 mt-1 flex-wrap relative">
      {/* Display existing reactions */}
      {reactions.map((reaction, index) => {
        if (!reaction.users || reaction.users.length === 0) return null;
        
        const userReacted = reaction.users.some(
          uid => uid.toString() === currentUserId.toString()
        );

        return (
          <button
            key={`${reaction.emoji}-${index}`}
            onClick={() => handleReactionClick(reaction.emoji)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${
              userReacted
                ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                : 'bg-gray-100 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            title={`${reaction.users.length} ${reaction.users.length === 1 ? 'person' : 'people'} reacted`}
          >
            <span className="text-base">{reaction.emoji}</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {reaction.users.length}
            </span>
          </button>
        );
      })}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Add reaction"
        >
          <Smile className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Reaction picker */}
        {showPicker && (
          <>
            {/* Backdrop to close picker */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPicker(false)}
            />
            <ReactionPicker
              onSelectEmoji={handleAddNewReaction}
              onClose={() => setShowPicker(false)}
              isOwnMessage={isOwnMessage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MessageReactions;
