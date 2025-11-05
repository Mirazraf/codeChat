import { useState, useRef, useEffect } from 'react';
import { Copy, Reply, Smile, MoreVertical, Edit, Trash2, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import useThemeStore from '../../store/useThemeStore';
import toast from 'react-hot-toast';

const MessageActions = ({ 
  message, 
  isOwnMessage, 
  onReply, 
  onReact, 
  onEdit, 
  onDelete, 
  onCopy 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showQuickEmojis, setShowQuickEmojis] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  const actionsRef = useRef(null);
  const moreMenuRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const { theme } = useThemeStore();

  // Quick reaction emojis
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (message.type === 'text' || message.type === 'code') {
      navigator.clipboard.writeText(message.content);
      toast.success('Message copied!');
      onCopy?.();
    }
    setShowActions(false);
  };

  const handleReply = () => {
    onReply(message);
    setShowActions(false);
  };

  const handleReact = (emoji) => {
    onReact(message._id, emoji);
    setShowQuickEmojis(false);
    setShowActions(false);
  };

  const handleEmojiSelect = (emojiData) => {
    onReact(message._id, emojiData.emoji);
    setShowEmojiPicker(false);
    setShowActions(false);
  };

  const handleEdit = () => {
    onEdit(message);
    setShowMoreMenu(false);
    setShowActions(false);
  };

  const handleDelete = (deleteType) => {
    onDelete(message._id, deleteType);
    setShowMoreMenu(false);
    setShowActions(false);
  };

  const isTextMessage = message.type === 'text' || message.type === 'code';

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        if (!showQuickEmojis && !showEmojiPicker && !showMoreMenu) {
          setShowActions(false);
        }
      }}
    >
      {/* Action Buttons */}
      {showActions && (
        <div
          ref={actionsRef}
          className={`absolute -top-8 ${
            isOwnMessage ? 'right-0' : 'left-0'
          } flex items-center space-x-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-1 py-1 z-10`}
        >
          {/* Copy Button - Only for text messages */}
          {isTextMessage && (
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
              title="Copy message"
            >
              <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}

          {/* Reply Button */}
          <button
            onClick={handleReply}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
            title="Reply"
          >
            <Reply className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Emoji Button */}
          <button
            onClick={() => setShowQuickEmojis(!showQuickEmojis)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
            title="React"
          >
            <Smile className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          {/* More Menu Button - Only for own messages */}
          {isOwnMessage && (
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
              title="More"
            >
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>
      )}

      {/* Quick Emoji Picker */}
      {showQuickEmojis && (
        <div
          className={`absolute ${
            isOwnMessage ? 'right-0' : 'left-0'
          } -top-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl px-2 py-2 flex items-center space-x-1 z-20`}
        >
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className="text-2xl hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={() => {
              setShowQuickEmojis(false);
              setShowEmojiPicker(true);
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            title="More emojis"
          >
            <span className="text-xl">➕</span>
          </button>
        </div>
      )}

      {/* Full Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className={`absolute ${
            isOwnMessage ? 'right-0' : 'left-0'
          } -top-96 z-30`}
        >
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="absolute -top-2 -right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              theme={theme === 'dark' ? 'dark' : 'light'}
              width={300}
              height={400}
              searchPlaceHolder="Search emoji..."
              previewConfig={{ showPreview: false }}
            />
          </div>
        </div>
      )}

      {/* More Menu (Edit/Delete) */}
      {showMoreMenu && (
        <div
          ref={moreMenuRef}
          className={`absolute ${
            isOwnMessage ? 'right-0' : 'left-0'
          } -top-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[180px] z-20`}
        >
          {/* Edit - Only for text messages */}
          {isTextMessage && (
            <button
              onClick={handleEdit}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 text-gray-700 dark:text-gray-200 transition"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Message</span>
            </button>
          )}

          {/* Delete Options */}
          <button
            onClick={() => handleDelete('forEveryone')}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 text-red-600 dark:text-red-400 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Unsend for Everyone</span>
          </button>

          <button
            onClick={() => handleDelete('forMe')}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 text-gray-700 dark:text-gray-200 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete for Me</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageActions;