import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import toast, { Toaster } from 'react-hot-toast';
import { 
  User, Mail, Lock, Camera, Save, ArrowLeft, 
  School, GraduationCap, Droplet, Calendar, Shield
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Profile Info State
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    institution: user?.institution || '',
    grade: user?.grade || '',
    bloodGroup: user?.bloodGroup || '',
    profilePicture: user?.avatar || null,
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'
  const [previewImage, setPreviewImage] = useState(user?.avatar || null);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Handle Profile Picture Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (min 50KB, max 2MB)
    const minSize = 50 * 1024; // 50KB
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (file.size < minSize) {
      toast.error('Image is too small. Minimum size is 50KB');
      return;
    }

    if (file.size > maxSize) {
      toast.error('Image is too large. Maximum size is 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setProfileData({ ...profileData, profilePicture: file });
    };
    reader.readAsDataURL(file);
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Username validation (can only change after 1 week)
      if (profileData.username !== user.username) {
        const lastUsernameChange = user.lastUsernameChange || user.createdAt;
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        if (new Date(lastUsernameChange) > oneWeekAgo) {
          toast.error('You can only change username once per week');
          setLoading(false);
          return;
        }
      }

      // Simulate API call (replace with actual API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Profile updated successfully! 🎉');
      // Update auth store with new data
      // await updateProfile(profileData);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call (replace with actual API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Password changed successfully! 🎉');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      // await changePassword(passwordData);
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const grades = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '12+'
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className={`min-h-screen pt-20 pb-12 px-4 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
    }`}>
      <Toaster position="top-right" />

      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 mb-4 transition ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className={`text-3xl md:text-4xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            My Profile
          </h1>
          <p className={`mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage your account settings and personal information
          </p>
        </div>

        {/* Tabs */}
        <div className={`flex gap-2 mb-6 p-1 rounded-lg ${
          theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-white border border-gray-200'
        }`}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'profile'
                ? theme === 'dark'
                  ? 'bg-purple-600 text-white'
                  : 'bg-teal-500 text-white'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profile Info</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'security'
                ? theme === 'dark'
                  ? 'bg-purple-600 text-white'
                  : 'bg-teal-500 text-white'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>Security</span>
          </button>
        </div>

        {/* Content Card */}
        <div className={`rounded-2xl shadow-xl overflow-hidden ${
          theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-white border border-gray-200'
        }`}>
          
          {/* Profile Info Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="p-6 md:p-8">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${
                    theme === 'dark'
                      ? 'border-purple-600'
                      : 'border-teal-500'
                  }`}>
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        theme === 'dark'
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                          : 'bg-gradient-to-br from-teal-500 to-emerald-500'
                      }`}>
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`absolute bottom-0 right-0 p-2 rounded-full shadow-lg transition ${
                      theme === 'dark'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-teal-500 hover:bg-teal-600'
                    } text-white`}
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <p className={`mt-3 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Click to upload profile picture (50KB - 2MB)
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Username
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      name="username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                      className={`w-full pl-11 pr-4 py-3 rounded-lg transition ${
                        theme === 'dark'
                          ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                          : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                      } focus:outline-none`}
                      placeholder="Your username"
                    />
                  </div>
                  <p className={`mt-1 text-xs ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    Can be changed once per week
                  </p>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className={`w-full pl-11 pr-4 py-3 rounded-lg opacity-60 cursor-not-allowed ${
                        theme === 'dark'
                          ? 'bg-[#2d2d3d] border border-gray-700 text-gray-400'
                          : 'bg-gray-100 border border-gray-300 text-gray-600'
                      }`}
                    />
                  </div>
                  <p className={`mt-1 text-xs ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    Email cannot be changed
                  </p>
                </div>

                {/* Institution */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Institution Name
                  </label>
                  <div className="relative">
                    <School className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      name="institution"
                      value={profileData.institution}
                      onChange={handleProfileChange}
                      className={`w-full pl-11 pr-4 py-3 rounded-lg transition ${
                        theme === 'dark'
                          ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                          : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                      } focus:outline-none`}
                      placeholder="Your school/college"
                    />
                  </div>
                </div>

                {/* Grade */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Current Grade
                  </label>
                  <div className="relative">
                    <GraduationCap className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <select
                      name="grade"
                      value={profileData.grade}
                      onChange={handleProfileChange}
                      className={`w-full pl-11 pr-4 py-3 rounded-lg transition ${
                        theme === 'dark'
                          ? 'bg-[#2d2d3d] border border-gray-700 text-white focus:border-purple-500'
                          : 'bg-gray-50 border border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                      } focus:outline-none`}
                    >
                      <option value="">Select grade</option>
                      {grades.map((grade) => (
                        <option key={grade} value={grade} className={theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-white'}>
                          Grade {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Blood Group */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Blood Group
                  </label>
                  <div className="relative">
                    <Droplet className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <select
                      name="bloodGroup"
                      value={profileData.bloodGroup}
                      onChange={handleProfileChange}
                      className={`w-full pl-11 pr-4 py-3 rounded-lg transition ${
                        theme === 'dark'
                          ? 'bg-[#2d2d3d] border border-gray-700 text-white focus:border-purple-500'
                          : 'bg-gray-50 border border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                      } focus:outline-none`}
                    >
                      <option value="">Select blood group</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group} className={theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-white'}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Role
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      value={user?.role || 'Student'}
                      disabled
                      className={`w-full pl-11 pr-4 py-3 rounded-lg opacity-60 cursor-not-allowed capitalize ${
                        theme === 'dark'
                          ? 'bg-[#2d2d3d] border border-gray-700 text-gray-400'
                          : 'bg-gray-100 border border-gray-300 text-gray-600'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    theme === 'dark'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="p-6 md:p-8">
              <h2 className={`text-2xl font-bold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Change Password
              </h2>

              <div className="space-y-6 max-w-lg">
                {/* Old Password */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className={`w-full pl-11 pr-4 py-3 rounded-lg transition ${
                        theme === 'dark'
                          ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                          : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                      } focus:outline-none`}
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full pl-11 pr-4 py-3 rounded-lg transition ${
                        theme === 'dark'
                          ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                          : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                      } focus:outline-none`}
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className={`mt-1 text-xs ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    Minimum 6 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full pl-11 pr-4 py-3 rounded-lg transition ${
                        theme === 'dark'
                          ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                          : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                      } focus:outline-none`}
                      placeholder="Re-enter new password"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    theme === 'dark'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Changing Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>

              {/* Security Tips */}
              <div className={`mt-8 p-4 rounded-lg ${
                theme === 'dark'
                  ? 'bg-purple-900/20 border border-purple-800'
                  : 'bg-teal-50 border border-teal-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-teal-700'
                }`}>
                  Password Security Tips:
                </h3>
                <ul className={`text-sm space-y-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  <li>• Use at least 6 characters</li>
                  <li>• Mix uppercase and lowercase letters</li>
                  <li>• Include numbers and special characters</li>
                  <li>• Don't use common words or personal information</li>
                </ul>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
