import { X } from 'lucide-react';

const ReplyPreview = ({ replyingTo, onCancel }) => {
  if (!replyingTo) return null;

  const getPreviewContent = () => {
    if (replyingTo.type === 'image') {
      return '📷 Image';
    } else if (replyingTo.type === 'file') {
      return `📎 ${replyingTo.fileName}`;
    } else if (replyingTo.type === 'code') {
      return '💻 Code snippet';
    } else {
      return replyingTo.content?.substring(0, 100) || 'Message';
    }
  };

  return (
    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-start space-x-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Replying to {replyingTo.sender?.username}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
            {getPreviewContent()}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
};

export default ReplyPreview;