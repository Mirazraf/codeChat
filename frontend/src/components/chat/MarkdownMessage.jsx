import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import useThemeStore from '../../store/useThemeStore';

const MarkdownMessage = ({ content, isOwnMessage }) => {
  const { theme } = useThemeStore();

  try {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className={`markdown-content ${isOwnMessage ? 'markdown-own' : 'markdown-other'}`}
        components={{
          // Code blocks
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={theme === 'dark' ? vscDarkPlus : vs}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  margin: '0.5rem 0',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code
                className={`${
                  isOwnMessage
                    ? 'bg-blue-700 text-blue-100'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                } px-1.5 py-0.5 rounded text-sm font-mono`}
                {...props}
              >
                {children}
              </code>
            );
          },
          // Paragraphs
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>;
          },
          // Links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${
                  isOwnMessage
                    ? 'text-blue-100 hover:text-white underline'
                    : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline'
                }`}
              >
                {children}
              </a>
            );
          },
          // Bold
          strong({ children }) {
            return <strong className="font-bold">{children}</strong>;
          },
          // Italic
          em({ children }) {
            return <em className="italic">{children}</em>;
          },
          // Lists
          ul({ children }) {
            return (
              <ul className="list-disc list-inside mb-2 space-y-1">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="list-decimal list-inside mb-2 space-y-1">
                {children}
              </ol>
            );
          },
          // Blockquotes
          blockquote({ children }) {
            return (
              <blockquote
                className={`border-l-4 pl-3 py-1 my-2 italic ${
                  isOwnMessage
                    ? 'border-blue-300'
                    : 'border-gray-400 dark:border-gray-500'
                }`}
              >
                {children}
              </blockquote>
            );
          },
          // Headings
          h1({ children }) {
            return <h1 className="text-xl font-bold mb-2">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg font-bold mb-2">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base font-bold mb-1">{children}</h3>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  } catch (error) {
    console.error('Markdown render error:', error);
    // Fallback to plain text
    return (
      <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
        {content}
      </p>
    );
  }
};

export default MarkdownMessage;