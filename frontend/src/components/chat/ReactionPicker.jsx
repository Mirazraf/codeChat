const COMMON_EMOJIS = [
  '👍', '❤️', '😂', '😮', '😢', '😡',
  '🎉', '🔥', '👏', '✅', '❌', '💯'
];

const ReactionPicker = ({ onSelectEmoji, onClose, isOwnMessage = false }) => {
  // If it's own message (right-aligned), open picker to the LEFT
  // If it's received message (left-aligned), open picker to the RIGHT
  const positionClass = isOwnMessage ? 'right-0' : 'left-0';

  return (
    <div 
      className={`absolute bottom-full ${positionClass} mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999]`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '8px',
        padding: '12px',
        width: '300px',
        maxWidth: '90vw',
        boxSizing: 'border-box', // Include padding in width calculation
      }}
    >
      {COMMON_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={(e) => {
            e.stopPropagation();
            onSelectEmoji(emoji);
            onClose();
          }}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all hover:scale-110 active:scale-95"
          style={{
            fontSize: '26px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            padding: '0',
            margin: '0',
          }}
          type="button"
          title={emoji}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionPicker;
