import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';

const CodeSnippet = ({ code, language = 'javascript' }) => {
  const [copied, setCopied] = useState(false);
  const { theme } = useThemeStore();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      // Fallback for older browsers
      fallbackCopy(code);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="relative group my-2 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-1 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Display */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={theme === 'dark' ? vscDarkPlus : vs}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          }}
          showLineNumbers={true}
          wrapLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeSnippet;