import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Reply } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import socketService from '../../services/socketService';
import CodeSnippet from './CodeSnippet';
import FileMessage from './FileMessage';
import MessageReactions from './MessageReactions';
import { highlightMentions, isUserMentioned } from '../../utils/mentionUtils';

const MessageList = () => {
  const { messages, updateMessageReactions, currentRoom, setReplyingTo } = useChatStore();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const previousMessageCountRef = useRef(messages.length);

  // Scroll to bottom function
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Check if user is near bottom
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100;
  };

  // Handle scroll event
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const nearBottom = isNearBottom();
    
    if (!nearBottom) {
      setIsUserScrolling(true);
    } else {
      setIsUserScrolling(false);
    }
  };

  // Auto-scroll logic
  useEffect(() => {
    const messageCountChanged = messages.length !== previousMessageCountRef.current;
    previousMessageCountRef.current = messages.length;

    if (messageCountChanged) {
      if (!isUserScrolling || isNearBottom()) {
        scrollToBottom('smooth');
      }
    }
  }, [messages.length, isUserScrolling]);

  // Auto-scroll when room changes
  useEffect(() => {
    if (currentRoom) {
      setIsUserScrolling(false);
      scrollToBottom('auto');
    }
  }, [currentRoom?._id]);

  // Listen for reaction updates
  useEffect(() => {
    const handleReactionUpdate = ({ messageId, reactions }) => {
      updateMessageReactions(messageId, reactions);
    };

    socketService.onReactionUpdate(handleReactionUpdate);

    return () => {};
  }, [updateMessageReactions]);

  // Handle add reaction
  const handleAddReaction = (messageId, emoji) => {
    if (currentRoom && user) {
      socketService.addReaction(messageId, user._id, emoji, currentRoom._id);
    }
  };

  // Handle remove reaction
  const handleRemoveReaction = (messageId, emoji) => {
    if (currentRoom && user) {
      socketService.removeReaction(messageId, user._id, emoji, currentRoom._id);
    }
  };

  // Handle reply button click
  const handleReply = (message) => {
    setReplyingTo(message);
  };

  // Render replied message preview
  const renderRepliedMessage = (replyTo) => {
    if (!replyTo) return null;

    return (
      <div className={`mb-2 pl-3 border-l-2 rounded p-2 ${
        theme === 'dark'
          ? 'border-purple-500 bg-purple-900/20'
          : 'border-teal-500 bg-teal-50'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <Reply className={`w-3 h-3 ${
            theme === 'dark' ? 'text-purple-400' : 'text-teal-600'
          }`} />
          <span className={`text-xs font-semibold ${
            theme === 'dark' ? 'text-purple-400' : 'text-teal-700'
          }`}>
            {replyTo.sender?.username || 'Unknown'}
          </span>
        </div>
        <p className={`text-xs truncate ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {replyTo.type === 'code' ? '📝 Code snippet' : 
           replyTo.type === 'image' ? '🖼️ Image' :
           replyTo.type === 'file' ? '📎 File' :
           replyTo.content}
        </p>
      </div>
    );
  };

  // Render text with mentions highlighted
  const renderTextWithMentions = (content, isOwnMessage) => {
    const currentUserMentioned = isUserMentioned(content, user?.username);
    const highlightedContent = highlightMentions(content, user?.username);

    return (
      <div
        className="whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
      />
    );
  };

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
            <div className={isOwnMessage ? 'text-white' : theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
              {renderTextWithMentions(message.content, isOwnMessage)}
            </div>
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
          <span className={`text-xs px-3 py-1 rounded-full ${
            theme === 'dark'
              ? 'text-gray-400 bg-gray-800'
              : 'text-gray-500 bg-gray-100'
          }`}>
            {message.content}
          </span>
        </div>
      );
    }

    // Regular text message with mentions
    return (
      <div className={isOwnMessage ? 'text-white' : theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
        {renderTextWithMentions(message.content, isOwnMessage)}
      </div>
    );
  };

  return (
    <div 
      data-messages-container
      className={`flex-1 overflow-y-auto p-4 space-y-4 relative ${
        theme === 'dark'
          ? 'bg-[#2d2d3d]'
          : 'bg-gradient-to-br from-[#d4e8e0] via-[#c8dfd6] to-[#bfd9cc]'
      }`}
      ref={messagesContainerRef} 
      onScroll={handleScroll}
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            No messages yet. Start the conversation!
          </p>
        </div>
      ) : (
        <>
          {messages.map((message) => {
            const isOwnMessage = message.sender?._id === user._id;
            const isSystemMessage = message.type === 'system';
            const isFileOrImage = message.type === 'file' || message.type === 'image';
            const isMentioned = !isOwnMessage && isUserMentioned(message.content, user?.username);

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
                className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} group`}
              >
                {/* Sender name (only for others' messages) */}
                {!isOwnMessage && (
                  <div className="mb-1 px-3">
                    <span className={`text-xs font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {message.sender?.username || 'Unknown'}
                    </span>
                  </div>
                )}

                {/* Message bubble */}
                <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`${
                      isFileOrImage && !message.content
                        ? ''
                        : isOwnMessage
                        ? theme === 'dark'
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl px-4 py-2'
                          : 'bg-gray-800 text-white rounded-2xl px-4 py-2'
                        : isMentioned
                        ? theme === 'dark'
                          ? 'bg-orange-900/30 border-2 border-orange-600 text-gray-100 rounded-2xl px-4 py-2'
                          : 'bg-orange-100 border-2 border-orange-400 text-gray-900 rounded-2xl px-4 py-2'
                        : theme === 'dark'
                          ? 'bg-[#1e1e2d] text-gray-100 border border-gray-700 rounded-2xl px-4 py-2'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-2xl px-4 py-2 shadow-sm'
                    }`}
                  >
                    {/* Show replied message if exists */}
                    {message.replyTo && renderRepliedMessage(message.replyTo)}

                    {/* Message content */}
                    <div className={message.type === 'code' ? '' : ''}>
                      {renderMessageContent(message, isOwnMessage)}
                    </div>
                  </div>

                  {/* Reply Button - Shows on hover */}
                  <button
                    onClick={() => handleReply(message)}
                    className={`mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-purple-400'
                        : 'text-gray-500 hover:text-teal-600'
                    }`}
                    title="Reply to this message"
                  >
                    <Reply className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                </div>

                {/* Reactions */}
                <MessageReactions
                  messageId={message._id}
                  reactions={message.reactions || []}
                  currentUserId={user._id}
                  onAddReaction={handleAddReaction}
                  onRemoveReaction={handleRemoveReaction}
                  isOwnMessage={isOwnMessage}
                />

                {/* Timestamp */}
                <div className={`mt-1 px-2 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    {format(new Date(message.createdAt), 'HH:mm')}
                  </span>
                </div>
              </div>
            );
          })}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
