import { useState } from 'react';
import { Shield, Globe } from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const GlobalVisibilityToggle = () => {
  const { theme } = useThemeStore();
  const { user, updatePrivacySettings } = useAuthStore();
  const [isToggling, setIsToggling] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const isPublic = user?.privacySettings?.globalVisibility === 'public';

  const handleToggle = async () => {
    const newVisibility = isPublic ? 'private' : 'public';
    
    // Show warning when setting to private
    if (newVisibility === 'private') {
      const confirmed = window.confirm(
        '⚠️ Setting your profile to private will hide all your information from other users, regardless of individual field settings. Are you sure?'
      );
      
      if (!confirmed) {
        toast.info('ℹ️ Profile visibility change cancelled', {
          duration: 2000,
        });
        return;
      }
    }

    setIsToggling(true);
    
    try {
      await updatePrivacySettings({
        globalVisibility: newVisibility,
        fields: user?.privacySettings?.fields || {},
      });
      
      // Show detailed confirmation message
      if (newVisibility === 'public') {
        toast.success('✅ Profile is now PUBLIC! Others can view your information based on individual field settings.', {
          duration: 4000,
          icon: '🌐',
        });
      } else {
        toast.success('🔒 Profile is now PRIVATE! All your information is hidden from other users.', {
          duration: 4000,
          icon: '🛡️',
        });
      }
    } catch (error) {
      // Enhanced error handling
      const errorMessage = error.message || 'Failed to update visibility settings';
      
      if (errorMessage.includes('validation')) {
        toast.error('❌ Validation Error: ' + errorMessage, {
          duration: 5000,
        });
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        toast.error('❌ Network Error: Please check your connection and try again', {
          duration: 5000,
        });
      } else {
        toast.error('❌ Failed to update visibility: ' + errorMessage, {
          duration: 4000,
        });
      }
    } finally {
      setIsToggling(false);
    }
  };

  const tooltipText = isPublic
    ? 'Your profile is visible to others based on field settings'
    : 'Your entire profile is hidden from other users';

  return (
    <div className={`p-4 sm:p-6 rounded-xl mb-6 border-2 transition-all duration-300 ${
      isPublic
        ? theme === 'dark'
          ? 'bg-blue-900/20 border-blue-700 shadow-lg shadow-blue-900/10'
          : 'bg-blue-50 border-blue-300 shadow-md shadow-blue-200/30'
        : theme === 'dark'
          ? 'bg-orange-900/20 border-orange-700 shadow-lg shadow-orange-900/10'
          : 'bg-orange-50 border-orange-300 shadow-md shadow-orange-200/30'
    }`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`p-2 sm:p-3 rounded-full transition-all duration-300 ${
            isPublic
              ? theme === 'dark'
                ? 'bg-blue-900/50'
                : 'bg-blue-100'
              : theme === 'dark'
                ? 'bg-orange-900/50'
                : 'bg-orange-100'
          }`}>
            {isPublic ? (
              <Globe className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            ) : (
              <Shield className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${
                theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
              }`} />
            )}
          </div>
          
          <div>
            <h3 className={`text-base sm:text-lg font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Global Profile Visibility
            </h3>
            <p className={`text-xs sm:text-sm mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {isPublic ? (
                <>
                  <span className={`font-semibold ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    Public
                  </span>
                  <span className="hidden sm:inline">{' - Others can view your profile based on individual field settings'}</span>
                </>
              ) : (
                <>
                  <span className={`font-semibold ${
                    theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                  }`}>
                    Private
                  </span>
                  <span className="hidden sm:inline">{' - Your profile is completely hidden from other users'}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-auto">
          <button
            type="button"
            onClick={handleToggle}
            disabled={isToggling}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onTouchStart={() => setShowTooltip(true)}
            onTouchEnd={() => setTimeout(() => setShowTooltip(false), 2000)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
              isPublic
                ? theme === 'dark'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl'
                : theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
            }`}
            aria-label="Toggle global profile visibility"
          >
            {isToggling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                {isPublic ? (
                  <>
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Make Private</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Make Public</span>
                  </>
                )}
              </>
            )}
          </button>

          {/* Tooltip */}
          {showTooltip && !isToggling && (
            <div
              className={`hidden sm:block absolute z-50 px-3 py-2 text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none animate-fade-in
                ${theme === 'dark'
                  ? 'bg-gray-800 text-gray-200 border border-gray-700'
                  : 'bg-gray-900 text-white'
                }
                bottom-full right-0 mb-2
              `}
            >
              {tooltipText}
              {/* Tooltip arrow */}
              <div
                className={`absolute top-full right-4 transform -mt-px
                  border-4 border-transparent
                  ${theme === 'dark' ? 'border-t-gray-800' : 'border-t-gray-900'}
                `}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalVisibilityToggle;
