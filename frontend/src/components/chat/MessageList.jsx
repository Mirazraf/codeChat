import { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '../../store/useAuthStore';

const MessageList = ({ messages }) => {
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    // Scroll within the container only, not the entire page
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isOwnMessage = (message) => {
    return message.sender?._id === user._id;
  };

  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50 dark:bg-gray-900"
      style={{ scrollBehavior: 'smooth', overscrollBehavior: 'contain' }}
    >
      {messages.map((message, index) => {
        if (message.type === 'system') {
          return (
            <div key={index} className="text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                {message.content}
              </span>
            </div>
          );
        }

        const isOwn = isOwnMessage(message);

        return (
          <div
            key={message._id || index}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 max-w-[85%] md:max-w-2xl`}>
              {/* Avatar */}
              {!isOwn && (
                <img
                  src={message.sender?.avatar || 'https://via.placeholder.com/40'}
                  alt={message.sender?.username}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
              )}

              {/* Message Bubble */}
              <div className={isOwn ? 'mr-2' : 'ml-2'}>
                {!isOwn && (
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center space-x-2">
                    <span>{message.sender?.username}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-normal bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {message.sender?.role}
                    </span>
                  </div>
                )}
                
                <div
                  className={`px-4 py-2 rounded-lg break-words ${
                    isOwn
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {message.type === 'code' ? (
                    <div className="overflow-x-auto">
                      <pre className="text-sm">
                        <code className="text-xs">{message.content}</code>
                      </pre>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {message.content}
                    </p>
                  )}
                  
                  {message.codeLanguage && (
                    <div className={`text-xs mt-2 opacity-70 border-t pt-1 ${
                      isOwn ? 'border-white border-opacity-20' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      Language: {message.codeLanguage}
                    </div>
                  )}
                </div>

                <div className={`text-xs text-gray-400 dark:text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                  {formatTime(message.createdAt)}
                </div>
              </div>

              {/* Own Avatar */}
              {isOwn && (
                <img
                  src={user?.avatar || 'https://via.placeholder.com/40'}
                  alt="You"
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
              )}
            </div>
          </div>
        );
      })}
      
      {messages.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
          <p className="text-lg">No messages yet</p>
          <p className="text-sm mt-2">Be the first to say something! 👋</p>
        </div>
      )}
      
      {/* Invisible element at the bottom for reference */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
