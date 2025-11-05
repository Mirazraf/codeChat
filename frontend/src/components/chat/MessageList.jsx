import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import CodeSnippet from './CodeSnippet';
import FileMessage from './FileMessage';

const MessageList = () => {
  const { messages } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderMessageContent = (message, isOwnMessage) => {
    // Code snippets
    if (message.type === 'code') {
      return (
        <CodeSnippet 
          code={message.content} 
          language={message.codeLanguage || 'javascript'} 
        />
      );
    }

    // File or Image messages
    if (message.type === 'file' || message.type === 'image') {
      return (
        <>
          {message.content && (
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words mb-2">
              {message.content}
            </p>
          )}
          <FileMessage
            fileUrl={message.fileUrl}
            fileName={message.fileName}
            fileType={message.fileType}
            fileSize={message.fileSize}
            isOwnMessage={isOwnMessage}
          />
        </>
      );
    }

    // System messages
    if (message.type === 'system') {
      return (
        <div className="text-center py-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {message.content}
          </span>
        </div>
      );
    }

    // Regular text message
    return (
      <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
        {message.content}
      </p>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">
            No messages yet. Start the conversation!
          </p>
        </div>
      ) : (
        messages.map((message) => {
          const isOwnMessage = message.sender?._id === user._id;
          const isSystemMessage = message.type === 'system';
          const isFileOrImage = message.type === 'file' || message.type === 'image';

          if (isSystemMessage) {
            return (
              <div key={message._id}>
                {renderMessageContent(message, false)}
              </div>
            );
          }

          return (
            <div
              key={message._id}
              className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
            >
              {/* Sender name (only for others' messages) */}
              {!isOwnMessage && (
                <div className="mb-1 px-3">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {message.sender?.username || 'Unknown'}
                  </span>
                </div>
              )}

              {/* Message bubble - Borderless for images */}
              <div
                className={`max-w-[70%] ${
                  isFileOrImage && !message.content
                    ? '' // No background/padding for standalone images
                    : isOwnMessage
                    ? 'bg-primary text-white rounded-2xl px-4 py-2'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl px-4 py-2'
                }`}
              >
                {/* Message content */}
                <div className={message.type === 'code' ? '' : ''}>
                  {renderMessageContent(message, isOwnMessage)}
                </div>
              </div>

              {/* Timestamp - Outside bubble */}
              <div className={`mt-1 px-2 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(message.createdAt), 'HH:mm')}
                </span>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;