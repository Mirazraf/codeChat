import { Lock, LockOpen, Shield, Globe } from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';
import useAuthStore from '../../store/useAuthStore';

const PrivacySummary = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();

  const privacySettings = user?.privacySettings || {
    globalVisibility: 'private',
    fields: {},
  };

  const isGlobalPublic = privacySettings.globalVisibility === 'public';

  // Define all profile fields with their display names
  const profileFields = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone Number' },
    { key: 'gender', label: 'Gender' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    { key: 'bloodGroup', label: 'Blood Group' },
    { key: 'location', label: 'Location' },
    { key: 'bio', label: 'Bio' },
    { key: 'avatar', label: 'Profile Picture' },
    { key: 'socialLinks', label: 'Social Links' },
    { key: 'studentInfo', label: 'Student Information' },
    { key: 'teacherInfo', label: 'Teacher Information' },
  ];

  // Filter fields based on user role
  const relevantFields = profileFields.filter(field => {
    if (field.key === 'studentInfo' && user?.role !== 'student') return false;
    if (field.key === 'teacherInfo' && user?.role !== 'teacher') return false;
    return true;
  });

  // Count public and private fields
  const publicFieldsCount = relevantFields.filter(
    field => privacySettings.fields[field.key] === 'public'
  ).length;
  const privateFieldsCount = relevantFields.length - publicFieldsCount;

  return (
    <div className={`mt-6 p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-[#2d2d3d] border-gray-700 shadow-lg'
        : 'bg-gray-50 border-gray-200 shadow-md'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Privacy Settings Summary
        </h3>
        
        {/* Global Status Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm ${
          isGlobalPublic
            ? theme === 'dark'
              ? 'bg-blue-900/30 text-blue-400 border border-blue-700'
              : 'bg-blue-50 text-blue-700 border border-blue-300'
            : theme === 'dark'
              ? 'bg-orange-900/30 text-orange-400 border border-orange-700'
              : 'bg-orange-50 text-orange-700 border border-orange-300'
        }`}>
          {isGlobalPublic ? (
            <>
              <Globe className="w-4 h-4" />
              <span>Public Profile</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>Private Profile</span>
            </>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className={`p-3 sm:p-4 rounded-lg transition-all duration-300 hover:scale-105 ${
          theme === 'dark'
            ? 'bg-green-900/20 border border-green-700 hover:shadow-lg hover:shadow-green-900/20'
            : 'bg-green-50 border border-green-200 hover:shadow-md hover:shadow-green-200/50'
        }`}>
          <div className={`text-xl sm:text-2xl font-bold ${
            theme === 'dark' ? 'text-green-400' : 'text-green-700'
          }`}>
            {publicFieldsCount}
          </div>
          <div className={`text-xs sm:text-sm ${
            theme === 'dark' ? 'text-green-300' : 'text-green-600'
          }`}>
            Public Fields
          </div>
        </div>
        
        <div className={`p-3 sm:p-4 rounded-lg transition-all duration-300 hover:scale-105 ${
          theme === 'dark'
            ? 'bg-orange-900/20 border border-orange-700 hover:shadow-lg hover:shadow-orange-900/20'
            : 'bg-orange-50 border border-orange-200 hover:shadow-md hover:shadow-orange-200/50'
        }`}>
          <div className={`text-xl sm:text-2xl font-bold ${
            theme === 'dark' ? 'text-orange-400' : 'text-orange-700'
          }`}>
            {privateFieldsCount}
          </div>
          <div className={`text-xs sm:text-sm ${
            theme === 'dark' ? 'text-orange-300' : 'text-orange-600'
          }`}>
            Private Fields
          </div>
        </div>
      </div>

      {/* Global Visibility Warning */}
      {!isGlobalPublic && (
        <div className={`mb-4 p-3 rounded-lg flex items-start gap-3 ${
          theme === 'dark'
            ? 'bg-orange-900/20 border border-orange-700'
            : 'bg-orange-50 border border-orange-200'
        }`}>
          <Shield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
            theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
          }`} />
          <div>
            <p className={`text-sm font-medium ${
              theme === 'dark' ? 'text-orange-300' : 'text-orange-700'
            }`}>
              Your profile is completely private
            </p>
            <p className={`text-xs mt-1 ${
              theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
            }`}>
              Other users cannot see any of your information, regardless of individual field settings.
            </p>
          </div>
        </div>
      )}

      {/* Fields List */}
      <div className="space-y-2">
        <h4 className={`text-sm font-semibold mb-3 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Field Privacy Status
        </h4>
        
        <div className={`max-h-64 overflow-y-auto space-y-2 pr-2 ${
          theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'
        }`}>
          {relevantFields.map((field) => {
            const isPublic = privacySettings.fields[field.key] === 'public';
            const effectivelyPrivate = !isGlobalPublic || !isPublic;
            
            return (
              <div
                key={field.key}
                className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                  theme === 'dark'
                    ? 'bg-[#1e1e2d] hover:bg-[#252535] hover:shadow-md'
                    : 'bg-white hover:bg-gray-50 border border-gray-200 hover:shadow-sm'
                }`}
              >
                <span className={`text-xs sm:text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {field.label}
                </span>
                
                <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                  effectivelyPrivate
                    ? theme === 'dark'
                      ? 'bg-orange-900/30 text-orange-400 border border-orange-700/50'
                      : 'bg-orange-100 text-orange-700 border border-orange-300'
                    : theme === 'dark'
                      ? 'bg-green-900/30 text-green-400 border border-green-700/50'
                      : 'bg-green-100 text-green-700 border border-green-300'
                }`}>
                  {effectivelyPrivate ? (
                    <>
                      <Lock className="w-3 h-3" />
                      <span className="hidden sm:inline">Private</span>
                    </>
                  ) : (
                    <>
                      <LockOpen className="w-3 h-3" />
                      <span className="hidden sm:inline">Public</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Footer */}
      <div className={`mt-4 pt-4 border-t ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <p className={`text-xs ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
        }`}>
          💡 Tip: You can change individual field privacy settings by clicking the toggle buttons next to each field in your profile.
        </p>
      </div>
    </div>
  );
};

export default PrivacySummary;
