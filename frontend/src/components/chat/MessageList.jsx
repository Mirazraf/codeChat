import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { ArrowDown } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import socketService from '../../services/socketService';
import CodeSnippet from './CodeSnippet';
import FileMessage from './FileMessage';
import MessageReactions from './MessageReactions';

const MessageList = () => {
  const { messages, updateMessageReactions, currentRoom } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
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
    return scrollHeight - scrollTop - clientHeight < 100; // Within 100px of bottom
  };

  // Handle scroll event
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const nearBottom = isNearBottom();
    setShowScrollButton(!nearBottom);
    
    // If user manually scrolled, mark as scrolling
    if (!nearBottom) {
      setIsUserScrolling(true);
    } else {
      setIsUserScrolling(false);
    }
  };

  // Auto-scroll ONLY when:
  // 1. New message arrives (messages.length changes)
  // 2. User is already near the bottom
  // 3. Room just changed
  useEffect(() => {
    const messageCountChanged = messages.length !== previousMessageCountRef.current;
    previousMessageCountRef.current = messages.length;

    // Only auto-scroll if:
    // - New message arrived AND user is near bottom OR not manually scrolling
    if (messageCountChanged) {
      if (!isUserScrolling || isNearBottom()) {
        scrollToBottom('smooth');
      }
    }
  }, [messages.length, isUserScrolling]);

  // Auto-scroll when room changes (initial load)
  useEffect(() => {
    if (currentRoom) {
      setIsUserScrolling(false);
      scrollToBottom('auto'); // Instant scroll on room change
    }
  }, [currentRoom?._id]);

  // Listen for reaction updates from socket
  useEffect(() => {
    const handleReactionUpdate = ({ messageId, reactions }) => {
      updateMessageReactions(messageId, reactions);
      // DON'T auto-scroll on reactions
    };

    socketService.onReactionUpdate(handleReactionUpdate);

    return () => {
      // Cleanup listener if needed
    };
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

  // Handle scroll to bottom button click
  const handleScrollToBottom = () => {
    setIsUserScrolling(false);
    scrollToBottom('smooth');
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
    <div className="flex-1 overflow-y-auto p-4 space-y-4 relative" ref={messagesContainerRef} onScroll={handleScroll}>
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

              {/* Reactions */}
              <MessageReactions
                messageId={message._id}
                reactions={message.reactions || []}
                currentUserId={user._id}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
                isOwnMessage={isOwnMessage}
              />

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

      {/* Scroll to Bottom Button - Fixed to viewport, centered */}
      {showScrollButton && (
        <button
          onClick={handleScrollToBottom}
          className="fixed bottom-28 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full p-2 shadow-lg transition-all hover:scale-110 active:scale-95 border border-gray-200 dark:border-gray-600 z-[100]"
          style={{
            marginLeft: 'calc((100vw - 100%) / 2)',
          }}
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default MessageList;
