import { useState } from 'react';
import { MoreVertical, Reply, Copy, Trash2, Smile } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Message = ({ message }) => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState(message.reactions || []);

  const isOwnMessage = message.sender._id === user._id;

  const handleReaction = (emoji) => {
    const existingReaction = reactions.find(r => r.emoji === emoji && r.userId === user._id);
    
    if (existingReaction) {
      setReactions(reactions.filter(r => !(r.emoji === emoji && r.userId === user._id)));
    } else {
      setReactions([...reactions, { emoji, userId: user._id, username: user.username }]);
    }
    setShowReactions(false);
  };

  const availableReactions = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group relative`}>
      <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwnMessage && (
          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
              : 'bg-gradient-to-br from-teal-500 to-emerald-500'
          }`}>
            {message.sender.username?.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Message Content */}
        <div className="flex flex-col gap-1">
          {/* Sender Name */}
          {!isOwnMessage && (
            <span className={`text-xs font-medium ml-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {message.sender.username}
            </span>
          )}

          {/* Message Bubble */}
          <div className="relative">
            <div
              className={`px-4 py-2 rounded-2xl ${
                isOwnMessage
                  ? theme === 'dark'
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                    : 'bg-gray-800 text-white'
                  : theme === 'dark'
                    ? 'bg-[#1e1e2d] text-white border border-gray-700'
                    : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
              }`}
            >
              {/* Text Message */}
              {message.type === 'text' && (
                <ReactMarkdown
                  className="prose prose-sm max-w-none"
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={theme === 'dark' ? vscDarkPlus : vs}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg my-2"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={`${
                          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                        } px-1 py-0.5 rounded text-sm`} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}

              {/* Image Message */}
              {message.type === 'image' && (
                <div>
                  <img
                    src={message.fileUrl}
                    alt="Shared"
                    className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition"
                    onClick={() => window.open(message.fileUrl, '_blank')}
                  />
                  {message.content && (
                    <p className="mt-2 text-sm">{message.content}</p>
                  )}
                </div>
              )}

              {/* File Message */}
              {message.type === 'file' && (
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 ${
                    isOwnMessage
                      ? 'text-white hover:text-gray-100'
                      : theme === 'dark'
                        ? 'text-purple-400 hover:text-purple-300'
                        : 'text-teal-600 hover:text-teal-700'
                  }`}
                >
                  <span>📎</span>
                  <span className="underline">{message.content}</span>
                </a>
              )}
            </div>

            {/* Message Menu */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`absolute top-1 ${
                isOwnMessage ? 'left-0 -translate-x-8' : 'right-0 translate-x-8'
              } opacity-0 group-hover:opacity-100 p-1 rounded transition ${
                theme === 'dark'
                  ? 'hover:bg-[#2d2d3d] text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className={`absolute ${
                isOwnMessage ? 'right-0' : 'left-0'
              } top-8 rounded-lg shadow-xl py-1 z-10 min-w-[150px] ${
                theme === 'dark'
                  ? 'bg-[#2d2d3d] border border-gray-700'
                  : 'bg-white border border-gray-200'
              }`}>
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition ${
                    theme === 'dark'
                      ? 'hover:bg-[#1e1e2d] text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Smile className="w-4 h-4" />
                  React
                </button>
                <button
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition ${
                    theme === 'dark'
                      ? 'hover:bg-[#1e1e2d] text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(message.content);
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition ${
                    theme === 'dark'
                      ? 'hover:bg-[#1e1e2d] text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                {isOwnMessage && (
                  <button
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition ${
                      theme === 'dark'
                        ? 'hover:bg-[#1e1e2d] text-red-400'
                        : 'hover:bg-red-50 text-red-600'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            )}

            {/* Reaction Picker */}
            {showReactions && (
              <div className={`absolute ${
                isOwnMessage ? 'right-0' : 'left-0'
              } top-8 rounded-lg shadow-xl p-2 z-20 flex gap-2 ${
                theme === 'dark'
                  ? 'bg-[#2d2d3d] border border-gray-700'
                  : 'bg-white border border-gray-200'
              }`}>
                {availableReactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="text-2xl hover:scale-125 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reactions Display */}
          {reactions.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              {Object.entries(
                reactions.reduce((acc, r) => {
                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                  return acc;
                }, {})
              ).map(([emoji, count]) => (
                <span
                  key={emoji}
                  className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                    theme === 'dark'
                      ? 'bg-[#1e1e2d] border border-gray-700'
                      : 'bg-gray-100 border border-gray-300'
                  }`}
                >
                  {emoji} {count}
                </span>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <span className={`text-xs ${
            isOwnMessage ? 'text-right mr-2' : 'ml-2'
          } ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Message;
