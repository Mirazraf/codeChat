import { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';

const EditMessageModal = ({ message, onSave, onCancel }) => {
  const [editedContent, setEditedContent] = useState(message?.content || '');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleSave = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      onSave(message._id, editedContent.trim());
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Message
          </h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows="4"
            placeholder="Edit your message..."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Press Enter to save, Shift+Enter for new line, Esc to cancel
          </p>
        </div>

        <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!editedContent.trim()}
            className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMessageModal;