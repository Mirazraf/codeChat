import { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import CodeSnippet from './CodeSnippet';
import MessageReactions from './MessageReactions';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);
  const { user } = useAuthStore();
  const { activeRoom, socket } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle reaction updates from socket
  useEffect(() => {
    if (!socket) return;

    const handleReactionUpdate = ({ messageId, reactions }) => {
      // Update message reactions in the store
      useChatStore.getState().updateMessageReactions(messageId, reactions);
    };

    socket.on('reactionUpdate', handleReactionUpdate);

    return () => {
      socket.off('reactionUpdate', handleReactionUpdate);
    };
  }, [socket]);

  const handleAddReaction = (messageId, emoji) => {
    if (socket && activeRoom && user) {
      socket.emit('addReaction', {
        messageId,
        userId: user._id,
        emoji,
        roomId: activeRoom._id,
      });
    }
  };

  const handleRemoveReaction = (messageId, emoji) => {
    if (socket && activeRoom && user) {
      socket.emit('removeReaction', {
        messageId,
        userId: user._id,
        emoji,
        roomId: activeRoom._id,
      });
    }
  };

  const renderMessage = (message) => {
    const isOwnMessage = message.sender?._id === user?._id;

    // System messages
    if (message.type === 'system') {
      return (
        <div className="flex justify-center my-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {message.content}
          </span>
        </div>
      );
    }

    // Regular messages
    return (
      <div
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[70%]`}>
          {/* Avatar */}
          {!isOwnMessage && (
            <img
              src={message.sender?.avatar || 'https://via.placeholder.com/40'}
              alt={message.sender?.username}
              className="w-8 h-8 rounded-full mr-2"
            />
          )}

          {/* Message content */}
          <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
            {/* Sender name and timestamp */}
            {!isOwnMessage && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {message.sender?.username}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {message.sender?.role === 'teacher' && (
                    <span className="bg-purple-500 text-white px-2 py-0.5 rounded text-xs mr-1">
                      Teacher
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Message bubble */}
            <div
              className={`rounded-lg p-3 ${
                isOwnMessage
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              {/* Text message */}
              {message.type === 'text' && (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              )}

              {/* Code snippet */}
              {message.type === 'code' && (
                <CodeSnippet
                  code={message.content}
                  language={message.codeLanguage || 'javascript'}
                />
              )}

              {/* Image message */}
              {message.type === 'image' && (
                <div>
                  <img
                    src={message.fileUrl}
                    alt={message.fileName}
                    className="max-w-full rounded-lg mb-2"
                  />
                  {message.content && (
                    <p className="text-sm mt-2">{message.content}</p>
                  )}
                </div>
              )}

              {/* File message */}
              {message.type === 'file' && (
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8" />
                  <div className="flex-1">
                    <p className="font-medium">{message.fileName}</p>
                    <p className="text-xs opacity-75">
                      {(message.fileSize / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <a
                    href={message.fileUrl}
                    download={message.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              )}
            </div>

            {/* Reactions */}
            <MessageReactions
              messageId={message._id}
              reactions={message.reactions || []}
              currentUserId={user?._id}
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
            />

            {/* Timestamp */}
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message) => (
        <div key={message._id || message.createdAt}>{renderMessage(message)}</div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
