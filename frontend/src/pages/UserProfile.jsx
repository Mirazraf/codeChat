import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Droplet, Globe, Github, Linkedin, Facebook, Twitter, Lock } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import PageTitle from '../components/PageTitle';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${userId}/public-profile`);
      
      if (response.data.success) {
        setProfile(response.data.data);
        setIsPrivate(response.data.data.privacySettings?.globalVisibility === 'private');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-20 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-screen pt-20 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              User not found
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-purple-600 hover:text-purple-700"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If profile is private, show limited info
  if (isPrivate) {
    return (
      <>
        <PageTitle title={`${profile.username}'s Profile`} />
        <div className={`min-h-screen pt-20 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <div className="max-w-4xl mx-auto px-4 py-8">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 mb-6 ${
                theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className={`rounded-lg p-8 text-center ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="w-24 h-24 mx-auto mb-4">
                <img
                  src={profile.avatar || 'https://ui-avatars.com/api/?name=' + profile.username}
                  alt={profile.username}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {profile.username}
              </h1>
              <p className={`text-sm mb-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {profile.role}
              </p>

              <div className={`flex items-center justify-center gap-2 p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Lock className="w-5 h-5 text-gray-500" />
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  This profile is private
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title={`${profile.username}'s Profile`} />
      <div className={`min-h-screen pt-20 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 mb-6 ${
              theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Profile Header */}
          <div className={`rounded-lg p-6 mb-6 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24">
                <img
                  src={profile.avatar || 'https://ui-avatars.com/api/?name=' + profile.username}
                  alt={profile.username}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h1 className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {profile.fullName || profile.username}
                </h1>
                <p className={`text-lg mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  @{profile.username}
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  theme === 'dark'
                    ? 'bg-purple-900 text-purple-200'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {profile.role}
                </span>
              </div>
            </div>

            {profile.bio && (
              <p className={`mt-4 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Contact Information */}
          {(profile.email || profile.phoneNumber || profile.location?.fullLocation) && (
            <div className={`rounded-lg p-6 mb-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Contact Information
              </h2>
              <div className="space-y-3">
                {profile.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {profile.email}
                    </span>
                  </div>
                )}
                {profile.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {profile.countryCode} {profile.phoneNumber}
                    </span>
                  </div>
                )}
                {profile.location?.fullLocation && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {profile.location.fullLocation}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Personal Information */}
          {(profile.gender || profile.dateOfBirth || profile.bloodGroup) && (
            <div className={`rounded-lg p-6 mb-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.gender && (
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Gender
                    </p>
                    <p className={`font-medium capitalize ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                      {profile.gender}
                    </p>
                  </div>
                )}
                {profile.dateOfBirth && (
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Date of Birth
                    </p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                      {new Date(profile.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {profile.bloodGroup && (
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Blood Group
                    </p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                      {profile.bloodGroup}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Links */}
          {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) && (
            <div className={`rounded-lg p-6 mb-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Social Links
              </h2>
              <div className="flex flex-wrap gap-3">
                {profile.socialLinks.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Github className="w-5 h-5" />
                    GitHub
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Linkedin className="w-5 h-5" />
                    LinkedIn
                  </a>
                )}
                {profile.socialLinks.portfolio && (
                  <a
                    href={profile.socialLinks.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                    Portfolio
                  </a>
                )}
                {profile.socialLinks.facebook && (
                  <a
                    href={profile.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Facebook className="w-5 h-5" />
                    Facebook
                  </a>
                )}
                {profile.socialLinks.twitter && (
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Twitter className="w-5 h-5" />
                    Twitter
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Student/Teacher Info */}
          {profile.role === 'student' && profile.studentInfo && (
            <div className={`rounded-lg p-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Student Information
              </h2>
              <div className="space-y-3">
                {profile.studentInfo.institution && (
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Institution
                    </p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                      {profile.studentInfo.institution}
                    </p>
                  </div>
                )}
                {profile.studentInfo.educationLevel && (
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Education Level
                    </p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                      {profile.studentInfo.educationLevel}
                    </p>
                  </div>
                )}
                {profile.studentInfo.major && (
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Major
                    </p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                      {profile.studentInfo.major}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {profile.role === 'teacher' && profile.teacherInfo && (
            <div className={`rounded-lg p-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Teacher Information
              </h2>
              <div className="space-y-3">
                {profile.teacherInfo.experienceYears > 0 && (
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Experience
                    </p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                      {profile.teacherInfo.experienceYears} years
                    </p>
                  </div>
                )}
                {profile.teacherInfo.expertise && profile.teacherInfo.expertise.length > 0 && (
                  <div>
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Expertise
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.teacherInfo.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm ${
                            theme === 'dark'
                              ? 'bg-purple-900 text-purple-200'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfile;
