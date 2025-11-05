const ReplyDisplay = ({ replyTo, isOwnMessage }) => {
  if (!replyTo) return null;

  const getReplyContent = () => {
    if (replyTo.type === 'image') {
      return '📷 Image';
    } else if (replyTo.type === 'file') {
      return `📎 ${replyTo.fileName}`;
    } else if (replyTo.type === 'code') {
      return '💻 Code snippet';
    } else {
      return replyTo.content?.substring(0, 50) || 'Message';
    }
  };

  return (
    <div 
      className={`mb-2 pl-3 border-l-3 ${
        isOwnMessage 
          ? 'border-blue-300' 
          : 'border-gray-400 dark:border-gray-500'
      }`}
    >
      <p className={`text-xs font-semibold ${
        isOwnMessage 
          ? 'text-blue-100' 
          : 'text-gray-600 dark:text-gray-400'
      }`}>
        {replyTo.sender?.username}
      </p>
      <p className={`text-xs ${
        isOwnMessage 
          ? 'text-blue-50 opacity-90' 
          : 'text-gray-500 dark:text-gray-400'
      } truncate`}>
        {getReplyContent()}
      </p>
    </div>
  );
};

export default ReplyDisplay;