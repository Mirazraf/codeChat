import { useState } from 'react';
import { Lock, LockOpen } from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';

const PrivacyToggle = ({ isPublic, onChange, fieldName }) => {
  const { theme } = useThemeStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    onChange(fieldName, isPublic ? 'private' : 'public');
    setTimeout(() => setIsAnimating(false), 300);
  };

  const tooltipText = isPublic
    ? 'This field is visible to other users'
    : 'This field is hidden from other users';

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={() => setShowTooltip(true)}
        onTouchEnd={() => setTimeout(() => setShowTooltip(false), 2000)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform ${
          isAnimating ? 'scale-95' : 'scale-100'
        } ${
          isPublic
            ? theme === 'dark'
              ? 'bg-green-900/30 text-green-400 border border-green-700 hover:bg-green-900/50 hover:shadow-lg hover:shadow-green-900/20'
              : 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100 hover:shadow-md hover:shadow-green-200/50'
            : theme === 'dark'
              ? 'bg-orange-900/30 text-orange-400 border border-orange-700 hover:bg-orange-900/50 hover:shadow-lg hover:shadow-orange-900/20'
              : 'bg-orange-50 text-orange-700 border border-orange-300 hover:bg-orange-100 hover:shadow-md hover:shadow-orange-200/50'
        }`}
        aria-label={`Toggle privacy for ${fieldName}`}
      >
        {isPublic ? (
          <LockOpen className={`w-4 h-4 transition-transform duration-300 ${isAnimating ? 'rotate-12' : ''}`} />
        ) : (
          <Lock className={`w-4 h-4 transition-transform duration-300 ${isAnimating ? 'rotate-12' : ''}`} />
        )}
        <span className="hidden sm:inline">{isPublic ? 'Public' : 'Private'}</span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className={`absolute z-50 px-3 py-2 text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none animate-fade-in
            ${theme === 'dark'
              ? 'bg-gray-800 text-gray-200 border border-gray-700'
              : 'bg-gray-900 text-white'
            }
            bottom-full left-1/2 transform -translate-x-1/2 mb-2
          `}
        >
          {tooltipText}
          {/* Tooltip arrow */}
          <div
            className={`absolute top-full left-1/2 transform -translate-x-1/2 -mt-px
              border-4 border-transparent
              ${theme === 'dark' ? 'border-t-gray-800' : 'border-t-gray-900'}
            `}
          />
        </div>
      )}
    </div>
  );
};

export default PrivacyToggle;
