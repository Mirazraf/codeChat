import { useState, useEffect, useRef } from 'react';
import useThemeStore from '../../store/useThemeStore';

const ReadReceipts = ({ messages, currentMessageId, senderId, currentUserId }) => {
  const { theme } = useThemeStore();
  const [showAll, setShowAll] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const tooltipRef = useRef(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(null);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showTooltip]);

  // Only show read receipts for own messages
  if (senderId !== currentUserId) {
    return null;
  }

  // Find the current message
  const currentMessageIndex = messages.findIndex(msg => msg._id === currentMessageId);
  if (currentMessageIndex === -1) return null;

  const currentMessage = messages[currentMessageIndex];

  // Get all readers of the current message (excluding sender)
  const currentReaders = currentMessage.readBy
    ?.filter((read) => read.user?._id !== senderId)
    .map((read) => read.user)
    .filter(Boolean) || [];

  // For each reader, check if this is their LAST read message
  const readersAtThisMessage = currentReaders.filter((reader) => {
    // Check all messages after this one
    for (let i = currentMessageIndex + 1; i < messages.length; i++) {
      const laterMessage = messages[i];
      // If this reader has read a later message, don't show them here
      if (laterMessage.readBy?.some(read => read.user?._id === reader._id)) {
        return false;
      }
    }
    return true;
  });

  if (readersAtThisMessage.length === 0) {
    return null;
  }

  const maxVisible = 3;
  const visibleReaders = showAll ? readersAtThisMessage : readersAtThisMessage.slice(0, maxVisible);
  const remainingCount = readersAtThisMessage.length - maxVisible;

  return (
    <div className="flex items-center gap-1 mt-1" ref={tooltipRef}>
      <div className="flex -space-x-2">
        {visibleReaders.map((reader, index) => (
          <div
            key={reader._id || index}
            className="relative"
            onMouseEnter={() => setShowTooltip(reader._id)}
            onMouseLeave={() => setShowTooltip(null)}
            onClick={() => setShowTooltip(showTooltip === reader._id ? null : reader._id)}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 overflow-hidden cursor-pointer ${
                theme === 'dark' ? 'border-[#2d2d3d]' : 'border-white'
              }`}
            >
              {reader.avatar ? (
                <img
                  src={reader.avatar}
                  alt={reader.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-[8px] font-bold text-white ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                      : 'bg-gradient-to-br from-teal-500 to-emerald-500'
                  }`}
                >
                  {reader.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Tooltip */}
            {showTooltip === reader._id && (
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-[10px] whitespace-nowrap z-50 ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-white border border-gray-700'
                    : 'bg-gray-900 text-white'
                }`}
              >
                {reader.username}
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                    theme === 'dark' ? 'border-t-gray-800' : 'border-t-gray-900'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {!showAll && remainingCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className={`text-[10px] ${
            theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          +{remainingCount}
        </button>
      )}

      {showAll && readersAtThisMessage.length > maxVisible && (
        <button
          onClick={() => setShowAll(false)}
          className={`text-[10px] ${
            theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Show less
        </button>
      )}
    </div>
  );
};

export default ReadReceipts;
