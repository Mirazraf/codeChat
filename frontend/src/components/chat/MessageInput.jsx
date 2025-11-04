import { useState, useRef, useEffect } from 'react';
import { Send, Code, Smile, Paperclip } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import socketService from '../../services/socketService';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('text');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { currentRoom, sendMessage } = useChatStore();
  const { user } = useAuthStore();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleTyping = () => {
    socketService.emitTyping(currentRoom._id, user.username, true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emitTyping(currentRoom._id, user.username, false);
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim() || !currentRoom) return;

    // Stop typing indicator
    socketService.emitTyping(currentRoom._id, user.username, false);

    // Send message
    sendMessage({
      roomId: currentRoom._id,
      userId: user._id,
      content: message.trim(),
      type: messageType,
      codeLanguage: messageType === 'code' ? codeLanguage : undefined,
    });

    // Clear input
    setMessage('');
    setMessageType('text');
    setShowCodeInput(false);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey && !showCodeInput) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleCodeInput = () => {
    setShowCodeInput(!showCodeInput);
    setMessageType(showCodeInput ? 'text' : 'code');
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Code Options */}
      {showCodeInput && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <select
            value={codeLanguage}
            onChange={(e) => setCodeLanguage(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
          </select>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Code snippet mode
          </span>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end space-x-2">
          {/* Left Actions */}
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={toggleCodeInput}
              className={`p-2 rounded-lg transition ${
                showCodeInput
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              title="Code snippet"
            >
              <Code className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-600 dark:text-gray-300"
              title="Emoji (coming soon)"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-600 dark:text-gray-300"
              title="Attach file (coming soon)"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          {/* Text Input */}
          <div className="flex-1">
            {showCodeInput ? (
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Paste your code here..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm placeholder-gray-400 dark:placeholder-gray-500"
                style={{ minHeight: '60px', maxHeight: '120px' }}
              />
            ) : (
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder-gray-400 dark:placeholder-gray-500"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                rows="1"
              />
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-3 bg-primary hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
