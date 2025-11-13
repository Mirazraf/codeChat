import { Lock, LockOpen } from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';

const PrivacyFieldWrapper = ({ children, isPublic, fieldName, showIndicator = false }) => {
  const { theme } = useThemeStore();

  return (
    <div className={`privacy-field-wrapper ${isPublic ? 'privacy-field-public' : 'privacy-field-private'}`}>
      {showIndicator && (
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`privacy-indicator ${
              isPublic ? 'privacy-indicator-public' : 'privacy-indicator-private'
            }`}
          >
            {isPublic ? (
              <>
                <LockOpen className="w-3 h-3" />
                <span>Visible to others</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                <span>Hidden from others</span>
              </>
            )}
          </span>
        </div>
      )}
      {children}
    </div>
  );
};

export default PrivacyFieldWrapper;
