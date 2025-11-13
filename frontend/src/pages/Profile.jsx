import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import toast, { Toaster } from 'react-hot-toast';
import PageTitle from '../components/PageTitle';
import GlobalVisibilityToggle from '../components/profile/GlobalVisibilityToggle';
import PrivacyToggle from '../components/profile/PrivacyToggle';
import '../styles/profile.css';

import { 
  User, Mail, Lock, Camera, Save, ArrowLeft, 
  School, GraduationCap, Droplet, Shield, Globe,
  Phone, Calendar, MapPin, Linkedin, Github, 
  Facebook, Twitter, ExternalLink, Plus, X, Briefcase
} from 'lucide-react';
import {
  countryCodes,
  educationLevels,
  programmingTopics,
  expertiseSubjects,
  bloodGroups,
  genderOptions,
  degreeTypes,
} from '../utils/profileData';

const Profile = () => {
  const { user, updateProfile, uploadAvatar, changePassword } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [previewImage, setPreviewImage] = useState(user?.avatar || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Personal Info State
  const [personalData, setPersonalData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    countryCode: user?.countryCode || '+880',
    gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    bloodGroup: user?.bloodGroup || '',
    location: user?.location?.fullLocation || '',
    bio: user?.bio || '',
  });

  // Social Links State
  const [socialLinks, setSocialLinks] = useState({
    linkedin: user?.socialLinks?.linkedin || '',
    github: user?.socialLinks?.github || '',
    portfolio: user?.socialLinks?.portfolio || '',
    facebook: user?.socialLinks?.facebook || '',
    twitter: user?.socialLinks?.twitter || '',
  });

  // Student Info State
  const [studentInfo, setStudentInfo] = useState({
    institution: user?.studentInfo?.institution || '',
    educationLevel: user?.studentInfo?.educationLevel || '',
    major: user?.studentInfo?.major || '',
    preferredTopics: user?.studentInfo?.preferredTopics || [],
  });

  // Teacher Info State
  const [teacherInfo, setTeacherInfo] = useState({
    education: user?.teacherInfo?.education || [],
    expertise: user?.teacherInfo?.expertise || [],
    experienceYears: user?.teacherInfo?.experienceYears || 0,
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({
    globalVisibility: user?.privacySettings?.globalVisibility || 'private',
    fields: user?.privacySettings?.fields || {
      fullName: 'private',
      email: 'private',
      phoneNumber: 'private',
      gender: 'private',
      dateOfBirth: 'private',
      bloodGroup: 'private',
      location: 'private',
      bio: 'public',
      avatar: 'public',
      socialLinks: 'private',
      studentInfo: 'private',
      teacherInfo: 'private',
    },
  });

  // Calculate profile completion on mount and update form when user changes
  useEffect(() => {
    calculateProfileCompletion();
    
    // Update form fields when user data changes
    if (user) {
      setPersonalData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        countryCode: user.countryCode || '+880',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        bloodGroup: user.bloodGroup || '',
        location: user.location?.fullLocation || '',
        bio: user.bio || '',
      });
      
      setSocialLinks({
        linkedin: user.socialLinks?.linkedin || '',
        github: user.socialLinks?.github || '',
        portfolio: user.socialLinks?.portfolio || '',
        facebook: user.socialLinks?.facebook || '',
        twitter: user.socialLinks?.twitter || '',
      });
      
      if (user.role === 'student') {
        setStudentInfo({
          institution: user.studentInfo?.institution || '',
          educationLevel: user.studentInfo?.educationLevel || '',
          major: user.studentInfo?.major || '',
          preferredTopics: user.studentInfo?.preferredTopics || [],
        });
      } else if (user.role === 'teacher') {
        setTeacherInfo({
          education: user.teacherInfo?.education || [],
          expertise: user.teacherInfo?.expertise || [],
          experienceYears: user.teacherInfo?.experienceYears || 0,
        });
      }
      
      setPreviewImage(user.avatar || null);
      
      // Update privacy settings
      if (user.privacySettings) {
        setPrivacySettings({
          globalVisibility: user.privacySettings.globalVisibility || 'private',
          fields: user.privacySettings.fields || privacySettings.fields,
        });
      }
    }
  }, [user]);

  // Handle privacy field changes
  const handlePrivacyChange = async (fieldName, newValue) => {
    const updatedFields = {
      ...privacySettings.fields,
      [fieldName]: newValue,
    };
    
    // Optimistically update UI
    const previousSettings = { ...privacySettings };
    setPrivacySettings({
      ...privacySettings,
      fields: updatedFields,
    });
    
    // Save to backend
    try {
      await updateProfile({
        privacySettings: {
          globalVisibility: privacySettings.globalVisibility,
          fields: updatedFields,
        },
      });
      
      // Show success message with icon and descriptive text
      const icon = newValue === 'public' ? '🔓' : '🔒';
      const visibilityText = newValue === 'public' 
        ? 'visible to others' 
        : 'hidden from others';
      
      toast.success(`${icon} ${fieldName} is now ${visibilityText}`, {
        duration: 2500,
        style: {
          borderRadius: '10px',
          background: theme === 'dark' ? '#2d2d3d' : '#fff',
          color: theme === 'dark' ? '#fff' : '#333',
        },
      });
    } catch (error) {
      // Enhanced error handling with specific messages
      const errorMessage = error.message || 'Failed to update privacy setting';
      
      toast.error(`❌ Privacy Update Failed: ${errorMessage}`, {
        duration: 4000,
        style: {
          borderRadius: '10px',
          background: theme === 'dark' ? '#2d2d3d' : '#fff',
          color: theme === 'dark' ? '#fff' : '#333',
        },
      });
      
      // Revert on error
      setPrivacySettings(previousSettings);
    }
  };

  const calculateProfileCompletion = () => {
    let total = 0;
    let filled = 0;

    // Personal fields (10)
    const personalFields = [
      personalData.fullName,
      previewImage && !previewImage.includes('ui-avatars'),
      personalData.phoneNumber,
      personalData.gender,
      personalData.dateOfBirth,
      personalData.bloodGroup,
      personalData.location,
      personalData.bio,
    ];
    total += 8;
    filled += personalFields.filter(f => f).length;

    // Social links (at least one)
    if (Object.values(socialLinks).some(link => link)) {
      filled += 1;
    }
    total += 1;

    // Role-specific
    if (user?.role === 'student') {
      const studentFields = [
        studentInfo.institution,
        studentInfo.educationLevel,
        studentInfo.major,
        studentInfo.preferredTopics.length > 0,
      ];
      total += 4;
      filled += studentFields.filter(f => f).length;
    } else if (user?.role === 'teacher') {
      const teacherFields = [
        teacherInfo.education.length > 0,
        teacherInfo.expertise.length > 0,
        teacherInfo.experienceYears > 0,
      ];
      total += 3;
      filled += teacherFields.filter(f => f).length;
    }

    const percentage = Math.round((filled / total) * 100);
    setProfileCompletion(percentage);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const minSize = 50 * 1024;
    const maxSize = 2 * 1024 * 1024;

    // Enhanced validation error messages
    if (file.size < minSize) {
      toast.error('❌ Image is too small. Minimum size is 50KB', {
        duration: 4000,
        icon: '📏',
      });
      return;
    }

    if (file.size > maxSize) {
      toast.error('❌ Image is too large. Maximum size is 2MB', {
        duration: 4000,
        icon: '📦',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('❌ Please upload a valid image file (JPG, PNG, GIF, etc.)', {
        duration: 4000,
        icon: '🖼️',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setSelectedFile(file);
      toast.success('✅ Image selected! Click "Save Changes" to upload.', {
        duration: 3000,
        icon: '📸',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload avatar if selected
      if (selectedFile) {
        toast.loading('Uploading profile picture...', { id: 'avatar' });
        await uploadAvatar(selectedFile);
        toast.success('✅ Profile picture updated successfully!', { 
          id: 'avatar',
          duration: 3000,
        });
        setSelectedFile(null);
      }

      // Prepare update data
      const updateData = {
        fullName: personalData.fullName,
        username: personalData.username,
        phoneNumber: personalData.phoneNumber,
        countryCode: personalData.countryCode,
        gender: personalData.gender,
        dateOfBirth: personalData.dateOfBirth || null,
        bloodGroup: personalData.bloodGroup,
        bio: personalData.bio,
        location: {
          fullLocation: personalData.location,
          city: '', // Can be extracted from fullLocation
          country: '',
        },
        socialLinks: socialLinks,
        privacySettings: privacySettings, // Include privacy settings
      };

      // Add role-specific data
      if (user?.role === 'student') {
        updateData.studentInfo = studentInfo;
      } else if (user?.role === 'teacher') {
        updateData.teacherInfo = teacherInfo;
      }

      await updateProfile(updateData);
      calculateProfileCompletion();
      
      toast.success('✅ Profile updated successfully! Your changes have been saved.', {
        duration: 3000,
        icon: '🎉',
      });
    } catch (error) {
      // Enhanced error handling with specific messages
      const errorMessage = error.message || 'Failed to update profile';
      
      if (errorMessage.includes('username')) {
        toast.error('❌ Username Error: ' + errorMessage, {
          duration: 5000,
        });
      } else if (errorMessage.includes('privacy')) {
        toast.error('❌ Privacy Settings Error: ' + errorMessage, {
          duration: 5000,
        });
      } else if (errorMessage.includes('validation')) {
        toast.error('❌ Validation Error: ' + errorMessage, {
          duration: 5000,
        });
      } else {
        toast.error('❌ ' + errorMessage, {
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation with enhanced error messages
    if (passwordData.newPassword.length < 6) {
      toast.error('❌ Password must be at least 6 characters long', {
        duration: 4000,
        icon: '🔒',
      });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('❌ New passwords do not match. Please try again.', {
        duration: 4000,
        icon: '⚠️',
      });
      setLoading(false);
      return;
    }

    try {
      await changePassword(passwordData);
      toast.success('✅ Password changed successfully! Your account is now more secure.', {
        duration: 4000,
        icon: '🔐',
      });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      // Enhanced error handling for password change
      const errorMessage = error.message || 'Failed to change password';
      
      if (errorMessage.includes('incorrect') || errorMessage.includes('wrong')) {
        toast.error('❌ Current password is incorrect. Please try again.', {
          duration: 5000,
          icon: '🔒',
        });
      } else {
        toast.error('❌ ' + errorMessage, {
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Add education entry (for teachers)
  const addEducation = () => {
    setTeacherInfo({
      ...teacherInfo,
      education: [
        ...teacherInfo.education,
        { degree: '', institution: '', year: new Date().getFullYear(), field: '' }
      ]
    });
  };

  const removeEducation = (index) => {
    setTeacherInfo({
      ...teacherInfo,
      education: teacherInfo.education.filter((_, i) => i !== index)
    });
  };

  const updateEducation = (index, field, value) => {
    const updated = [...teacherInfo.education];
    updated[index][field] = value;
    setTeacherInfo({ ...teacherInfo, education: updated });
  };

  // Toggle topic/expertise selection
  const toggleTopic = (topic) => {
    if (studentInfo.preferredTopics.includes(topic)) {
      setStudentInfo({
        ...studentInfo,
        preferredTopics: studentInfo.preferredTopics.filter(t => t !== topic)
      });
    } else {
      setStudentInfo({
        ...studentInfo,
        preferredTopics: [...studentInfo.preferredTopics, topic]
      });
    }
  };

  const toggleExpertise = (subject) => {
    if (teacherInfo.expertise.includes(subject)) {
      setTeacherInfo({
        ...teacherInfo,
        expertise: teacherInfo.expertise.filter(s => s !== subject)
      });
    } else {
      setTeacherInfo({
        ...teacherInfo,
        expertise: [...teacherInfo.expertise, subject]
      });
    }
  };

  return (
  <>
  <PageTitle title="My Profile" description={`${user?.username}'s profile`} />
    <div className={`min-h-screen pt-20 pb-12 px-4 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
    }`}>
      <Toaster position="top-right" />

      <div className="container mx-auto max-w-6xl">
        {/* Header with Back Button */}
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
          
          <div className="flex items-center justify-between">
            <div>
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

            {/* Profile Completion Badge */}
            <div className={`hidden md:block px-6 py-3 rounded-xl ${
              theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-white border border-gray-200'
            }`}>
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  profileCompletion >= 80 
                    ? 'text-green-500' 
                    : profileCompletion >= 50 
                      ? 'text-yellow-500' 
                      : 'text-red-500'
                }`}>
                  {profileCompletion}%
                </div>
                <div className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Complete
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className={`w-full h-2 rounded-full overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                className={`h-full transition-all duration-500 ${
                  profileCompletion >= 80 
                    ? 'bg-green-500' 
                    : profileCompletion >= 50 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`}
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            <p className={`text-xs mt-1 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
            }`}>
              {profileCompletion < 100 
                ? `Complete your profile to unlock all features` 
                : `🎉 Your profile is complete!`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex flex-wrap gap-2 mb-6 p-2 rounded-xl ${
          theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-white border border-gray-200'
        }`}>
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-sm ${
              activeTab === 'personal'
                ? theme === 'dark'
                  ? 'bg-purple-600 text-white'
                  : 'bg-teal-500 text-white'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-[#2d2d3d]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal</span>
          </button>
          
          <button
            onClick={() => setActiveTab('professional')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-sm ${
              activeTab === 'professional'
                ? theme === 'dark'
                  ? 'bg-purple-600 text-white'
                  : 'bg-teal-500 text-white'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-[#2d2d3d]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {user?.role === 'teacher' ? <Briefcase className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
            <span>{user?.role === 'teacher' ? 'Professional' : 'Education'}</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-sm ${
              activeTab === 'social'
                ? theme === 'dark'
                  ? 'bg-purple-600 text-white'
                  : 'bg-teal-500 text-white'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-[#2d2d3d]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Social Links</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-sm ${
              activeTab === 'security'
                ? theme === 'dark'
                  ? 'bg-purple-600 text-white'
                  : 'bg-teal-500 text-white'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-[#2d2d3d]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </button>
        </div>

        {/* Content Card */}
        <div className={`rounded-2xl shadow-xl overflow-hidden ${
          theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-white border border-gray-200'
        }`}>

          {/* PERSONAL INFO TAB */}
          {activeTab === 'personal' && (
            <form onSubmit={handleProfileSubmit} className="p-6 md:p-8">
              {/* Global Visibility Toggle */}
              <GlobalVisibilityToggle />
              
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${
                    theme === 'dark' ? 'border-purple-600' : 'border-teal-500'
                  }`}>
                    {previewImage ? (
                      <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
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
                <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Click to upload profile picture (50KB - 2MB)
                </p>
                {selectedFile && (
                  <p className={`mt-2 text-sm font-medium ${
                    theme === 'dark' ? 'text-purple-400' : 'text-teal-600'
                  }`}>
                    ✓ New image selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Personal Information
              </h3>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="privacy-field-wrapper">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <PrivacyToggle
                      isPublic={privacySettings.fields.fullName === 'public'}
                      onChange={handlePrivacyChange}
                      fieldName="fullName"
                    />
                  </div>
                  <input
                    type="text"
                    value={personalData.fullName}
                    onChange={(e) => setPersonalData({ ...personalData, fullName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg privacy-input-transition focus:outline-none ${
                      privacySettings.fields.fullName === 'public'
                        ? 'privacy-input-public'
                        : 'privacy-input-private'
                    } ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border text-white placeholder-gray-500'
                        : 'bg-gray-50 border text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="John Doe"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={personalData.username}
                    onChange={(e) => setPersonalData({ ...personalData, username: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                    } focus:outline-none`}
                    placeholder="johndoe"
                  />
                  <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
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
                  <input
                    type="email"
                    value={personalData.email}
                    disabled
                    className={`w-full px-4 py-3 rounded-lg opacity-60 cursor-not-allowed ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border border-gray-700 text-gray-400'
                        : 'bg-gray-100 border border-gray-300 text-gray-600'
                    }`}
                  />
                </div>

                {/* Phone Number */}
                <div className="privacy-field-wrapper">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Phone Number
                    </label>
                    <PrivacyToggle
                      isPublic={privacySettings.fields.phoneNumber === 'public'}
                      onChange={handlePrivacyChange}
                      fieldName="phoneNumber"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={personalData.countryCode}
                      onChange={(e) => setPersonalData({ ...personalData, countryCode: e.target.value })}
                      className={`w-32 px-2 py-3 rounded-lg privacy-input-transition focus:outline-none ${
                        privacySettings.fields.phoneNumber === 'public'
                          ? 'privacy-input-public'
                          : 'privacy-input-private'
                      } ${
                        theme === 'dark'
                          ? 'bg-[#2d2d3d] border text-white'
                          : 'bg-gray-50 border text-gray-900'
                      }`}
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code} className={theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-white'}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={personalData.phoneNumber}
                      onChange={(e) => setPersonalData({ ...personalData, phoneNumber: e.target.value })}
                      className={`flex-1 px-4 py-3 rounded-lg privacy-input-transition focus:outline-none ${
                        privacySettings.fields.phoneNumber === 'public'
                          ? 'privacy-input-public'
                          : 'privacy-input-private'
                      } ${
                        theme === 'dark'
                          ? 'bg-[#2d2d3d] border text-white placeholder-gray-500'
                          : 'bg-gray-50 border text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="privacy-field-wrapper">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Gender
                    </label>
                    <PrivacyToggle
                      isPublic={privacySettings.fields.gender === 'public'}
                      onChange={handlePrivacyChange}
                      fieldName="gender"
                    />
                  </div>
                  <select
                    value={personalData.gender}
                    onChange={(e) => setPersonalData({ ...personalData, gender: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg privacy-input-transition focus:outline-none ${
                      privacySettings.fields.gender === 'public'
                        ? 'privacy-input-public'
                        : 'privacy-input-private'
                    } ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border text-white'
                        : 'bg-gray-50 border text-gray-900'
                    }`}
                  >
                    <option value="">Select gender</option>
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value} className={theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-white'}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date of Birth */}
                <div className="privacy-field-wrapper">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Date of Birth
                    </label>
                    <PrivacyToggle
                      isPublic={privacySettings.fields.dateOfBirth === 'public'}
                      onChange={handlePrivacyChange}
                      fieldName="dateOfBirth"
                    />
                  </div>
                  <input
                    type="date"
                    value={personalData.dateOfBirth}
                    onChange={(e) => setPersonalData({ ...personalData, dateOfBirth: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 rounded-lg privacy-input-transition focus:outline-none ${
                      privacySettings.fields.dateOfBirth === 'public'
                        ? 'privacy-input-public'
                        : 'privacy-input-private'
                    } ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border text-white'
                        : 'bg-gray-50 border text-gray-900'
                    }`}
                  />
                </div>

                {/* Blood Group */}
                <div className="privacy-field-wrapper">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Blood Group
                    </label>
                    <PrivacyToggle
                      isPublic={privacySettings.fields.bloodGroup === 'public'}
                      onChange={handlePrivacyChange}
                      fieldName="bloodGroup"
                    />
                  </div>
                  <select
                    value={personalData.bloodGroup}
                    onChange={(e) => setPersonalData({ ...personalData, bloodGroup: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg privacy-input-transition focus:outline-none ${
                      privacySettings.fields.bloodGroup === 'public'
                        ? 'privacy-input-public'
                        : 'privacy-input-private'
                    } ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border text-white'
                        : 'bg-gray-50 border text-gray-900'
                    }`}
                  >
                    <option value="">Select blood group</option>
                    {bloodGroups.map((group) => (
                      <option key={group} value={group} className={theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-white'}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div className="md:col-span-2 privacy-field-wrapper">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Location
                    </label>
                    <PrivacyToggle
                      isPublic={privacySettings.fields.location === 'public'}
                      onChange={handlePrivacyChange}
                      fieldName="location"
                    />
                  </div>
                  <input
                    type="text"
                    value={personalData.location}
                    onChange={(e) => setPersonalData({ ...personalData, location: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg privacy-input-transition focus:outline-none ${
                      privacySettings.fields.location === 'public'
                        ? 'privacy-input-public'
                        : 'privacy-input-private'
                    } ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border text-white placeholder-gray-500'
                        : 'bg-gray-50 border text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="City, Country (e.g., Dhaka, Bangladesh)"
                  />
                </div>

                {/* Bio */}
                <div className="md:col-span-2 privacy-field-wrapper">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Bio
                    </label>
                    <PrivacyToggle
                      isPublic={privacySettings.fields.bio === 'public'}
                      onChange={handlePrivacyChange}
                      fieldName="bio"
                    />
                  </div>
                  <textarea
                    value={personalData.bio}
                    onChange={(e) => setPersonalData({ ...personalData, bio: e.target.value })}
                    rows="4"
                    maxLength="500"
                    className={`w-full px-4 py-3 rounded-lg privacy-input-transition resize-none focus:outline-none ${
                      privacySettings.fields.bio === 'public'
                        ? 'privacy-input-public'
                        : 'privacy-input-private'
                    } ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border text-white placeholder-gray-500'
                        : 'bg-gray-50 border text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                  <p className={`text-xs mt-1 text-right ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                    {personalData.bio.length}/500
                  </p>
                </div>
              </div>

              {/* Save Button */}
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
                      <span>Saving...</span>
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

                    {/* PROFESSIONAL/EDUCATION TAB */}
          {activeTab === 'professional' && (
            <form onSubmit={handleProfileSubmit} className="p-6 md:p-8">
              {user?.role === 'student' ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Educational Information
                    </h3>
                    <PrivacyToggle
                      isPublic={privacySettings.fields.studentInfo === 'public'}
                      onChange={handlePrivacyChange}
                      fieldName="studentInfo"
                    />
                  </div>

                  <div className="space-y-6">
                    {/* Institution */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Current Institution <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={studentInfo.institution}
                        onChange={(e) => setStudentInfo({ ...studentInfo, institution: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg transition ${
                          theme === 'dark'
                            ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                            : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                        } focus:outline-none`}
                        placeholder="e.g., Dhaka University"
                      />
                    </div>

                    {/* Education Level */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Current Education Level <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={studentInfo.educationLevel}
                        onChange={(e) => setStudentInfo({ ...studentInfo, educationLevel: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg transition ${
                          theme === 'dark'
                            ? 'bg-[#2d2d3d] border border-gray-700 text-white focus:border-purple-500'
                            : 'bg-gray-50 border border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                        } focus:outline-none`}
                      >
                        <option value="">Select level</option>
                        {educationLevels.map((level) => (
                          <option key={level.value} value={level.value} className={theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-white'}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Major/Field of Study */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Major / Field of Study
                      </label>
                      <input
                        type="text"
                        value={studentInfo.major}
                        onChange={(e) => setStudentInfo({ ...studentInfo, major: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg transition ${
                          theme === 'dark'
                            ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                            : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                        } focus:outline-none`}
                        placeholder="e.g., Computer Science"
                      />
                    </div>

                    {/* Preferred Learning Topics */}
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Preferred Learning Topics (Select multiple)
                      </label>
                      <div className="max-h-96 overflow-y-auto border rounded-lg p-4 space-y-2 ${
                        theme === 'dark' ? 'border-gray-700 bg-[#2d2d3d]' : 'border-gray-300 bg-gray-50'
                      }">
                        {programmingTopics.map((topic) => (
                          <label
                            key={topic}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                              studentInfo.preferredTopics.includes(topic)
                                ? theme === 'dark'
                                  ? 'bg-purple-900/30 border-2 border-purple-500'
                                  : 'bg-teal-50 border-2 border-teal-500'
                                : theme === 'dark'
                                  ? 'hover:bg-gray-700 border-2 border-transparent'
                                  : 'hover:bg-gray-100 border-2 border-transparent'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={studentInfo.preferredTopics.includes(topic)}
                              onChange={() => toggleTopic(topic)}
                              className={`w-4 h-4 rounded ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500'
                                  : 'bg-white border-gray-300 text-teal-600 focus:ring-teal-500'
                              }`}
                            />
                            <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>
                              {topic}
                            </span>
                          </label>
                        ))}
                      </div>
                      <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                        Selected: {studentInfo.preferredTopics.length} topics
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Professional Information
                    </h3>
                    <PrivacyToggle
                      isPublic={privacySettings.fields.teacherInfo === 'public'}
                      onChange={handlePrivacyChange}
                      fieldName="teacherInfo"
                    />
                  </div>

                  <div className="space-y-6">
                    {/* Education History */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className={`block text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Education History <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={addEducation}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                            theme === 'dark'
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'bg-teal-500 hover:bg-teal-600 text-white'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          Add Education
                        </button>
                      </div>

                      <div className="space-y-4">
                        {teacherInfo.education.map((edu, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-2 ${
                              theme === 'dark'
                                ? 'bg-[#2d2d3d] border-gray-700'
                                : 'bg-gray-50 border-gray-300'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className={`text-sm font-semibold ${
                                theme === 'dark' ? 'text-purple-400' : 'text-teal-600'
                              }`}>
                                Education #{index + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeEducation(index)}
                                className="text-red-500 hover:text-red-600 transition"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  Degree
                                </label>
                                <select
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg text-sm ${
                                    theme === 'dark'
                                      ? 'bg-gray-700 border border-gray-600 text-white'
                                      : 'bg-white border border-gray-300 text-gray-900'
                                  } focus:outline-none`}
                                >
                                  <option value="">Select degree</option>
                                  {degreeTypes.map((degree) => (
                                    <option key={degree} value={degree} className={theme === 'dark' ? 'bg-gray-700' : 'bg-white'}>
                                      {degree}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className={`block text-xs font-medium mb-1 ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  Institution
                                </label>
                                <input
                                  type="text"
                                  value={edu.institution}
                                  onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg text-sm ${
                                    theme === 'dark'
                                      ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-500'
                                      : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none`}
                                  placeholder="University name"
                                />
                              </div>

                              <div>
                                <label className={`block text-xs font-medium mb-1 ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  Year
                                </label>
                                <input
                                  type="number"
                                  value={edu.year}
                                  onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value))}
                                  min="1950"
                                  max={new Date().getFullYear()}
                                  className={`w-full px-3 py-2 rounded-lg text-sm ${
                                    theme === 'dark'
                                      ? 'bg-gray-700 border border-gray-600 text-white'
                                      : 'bg-white border border-gray-300 text-gray-900'
                                  } focus:outline-none`}
                                />
                              </div>

                              <div>
                                <label className={`block text-xs font-medium mb-1 ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  Field of Study
                                </label>
                                <input
                                  type="text"
                                  value={edu.field}
                                  onChange={(e) => updateEducation(index, 'field', e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg text-sm ${
                                    theme === 'dark'
                                      ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-500'
                                      : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none`}
                                  placeholder="e.g., Computer Science"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {teacherInfo.education.length === 0 && (
                          <p className={`text-sm text-center py-4 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                            No education added yet. Click "Add Education" to start.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Expertise Subjects */}
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Expertise Subjects <span className="text-red-500">*</span> (Select multiple)
                      </label>
                      <div className={`max-h-96 overflow-y-auto border rounded-lg p-4 space-y-2 ${
                        theme === 'dark' ? 'border-gray-700 bg-[#2d2d3d]' : 'border-gray-300 bg-gray-50'
                      }`}>
                        {expertiseSubjects.map((subject) => (
                          <label
                            key={subject}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                              teacherInfo.expertise.includes(subject)
                                ? theme === 'dark'
                                  ? 'bg-purple-900/30 border-2 border-purple-500'
                                  : 'bg-teal-50 border-2 border-teal-500'
                                : theme === 'dark'
                                  ? 'hover:bg-gray-700 border-2 border-transparent'
                                  : 'hover:bg-gray-100 border-2 border-transparent'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={teacherInfo.expertise.includes(subject)}
                              onChange={() => toggleExpertise(subject)}
                              className={`w-4 h-4 rounded ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500'
                                  : 'bg-white border-gray-300 text-teal-600 focus:ring-teal-500'
                              }`}
                            />
                            <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>
                              {subject}
                            </span>
                          </label>
                        ))}
                      </div>
                      <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                        Selected: {teacherInfo.expertise.length} subjects
                      </p>
                    </div>

                    {/* Years of Experience */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Years of Teaching Experience
                      </label>
                      <input
                        type="number"
                        value={teacherInfo.experienceYears}
                        onChange={(e) => setTeacherInfo({ ...teacherInfo, experienceYears: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="50"
                        className={`w-full px-4 py-3 rounded-lg transition ${
                          theme === 'dark'
                            ? 'bg-[#2d2d3d] border border-gray-700 text-white focus:border-purple-500'
                            : 'bg-gray-50 border border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                        } focus:outline-none`}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Save Button */}
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
                      <span>Saving...</span>
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

          {/* SOCIAL LINKS TAB */}
          {activeTab === 'social' && (
            <form onSubmit={handleProfileSubmit} className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Social Media Links
                  </h3>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Connect your social media profiles to enhance your profile visibility
                  </p>
                </div>
                <PrivacyToggle
                  isPublic={privacySettings.fields.socialLinks === 'public'}
                  onChange={handlePrivacyChange}
                  fieldName="socialLinks"
                />
              </div>

              <div className="space-y-4">
                {/* LinkedIn */}
                <div>
                  <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                    } focus:outline-none`}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                {/* GitHub */}
                <div>
                  <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Github className="w-5 h-5" />
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    value={socialLinks.github}
                    onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                    } focus:outline-none`}
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                {/* Portfolio */}
                <div>
                  <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <ExternalLink className="w-5 h-5 text-green-600" />
                    Personal Website / Portfolio
                  </label>
                  <input
                    type="url"
                    value={socialLinks.portfolio}
                    onChange={(e) => setSocialLinks({ ...socialLinks, portfolio: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                    } focus:outline-none`}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                {/* Facebook */}
                <div>
                  <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Facebook className="w-5 h-5 text-blue-500" />
                    Facebook Profile
                  </label>
                  <input
                    type="url"
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                    } focus:outline-none`}
                    placeholder="https://facebook.com/yourprofile"
                  />
                </div>

                {/* Twitter/X */}
                <div>
                  <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Twitter className="w-5 h-5 text-sky-500" />
                    Twitter / X Profile
                  </label>
                  <input
                    type="url"
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                    } focus:outline-none`}
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>
              </div>

              {/* Save Button */}
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
                      <span>Saving...</span>
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

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="p-6 md:p-8">
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Change Password
              </h3>

              <div className="space-y-6 max-w-lg">
                {/* Current Password */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                    } focus:outline-none`}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                    } focus:outline-none`}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                    Minimum 6 characters
                  </p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                    } focus:outline-none`}
                    placeholder="Re-enter new password"
                    required
                  />
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
                <h4 className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-teal-700'
                }`}>
                  Password Security Tips:
                </h4>
                <ul className={`text-sm space-y-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  <li>• Use at least 6 characters</li>
                  <li>• Mix uppercase and lowercase letters</li>
                  <li>• Include numbers and special characters</li>
                  <li>• Don't use common words or personal information</li>
                  <li>• Change your password regularly</li>
                </ul>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
    </>
  );
};

export default Profile;