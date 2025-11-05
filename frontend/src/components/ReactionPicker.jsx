import { useState } from 'react';
import { Smile } from 'lucide-react';

const COMMON_EMOJIS = [
  '👍', '❤️', '😂', '😮', '😢', '😡',
  '🎉', '🔥', '👏', '✅', '❌', '💯'
];

const ReactionPicker = ({ onSelectEmoji, onClose }) => {
  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-2 grid grid-cols-6 gap-1 z-50 border border-gray-200 dark:border-gray-700">
      {COMMON_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            onSelectEmoji(emoji);
            onClose();
          }}
          className="text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          type="button"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionPicker;
