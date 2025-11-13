const User = require('../models/User');

// @desc    Get user's public profile
// @route   GET /api/users/:id/public-profile
// @access  Private
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If viewing own profile, return all data
    if (user._id.toString() === req.user.id) {
      return res.json({
        success: true,
        data: user,
      });
    }

    // Check global visibility
    if (user.privacySettings?.globalVisibility === 'private') {
      return res.json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          role: user.role,
          avatar: user.avatar,
          privacySettings: {
            globalVisibility: 'private',
          },
        },
      });
    }

    // Filter fields based on privacy settings
    const filteredUser = {
      _id: user._id,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      privacySettings: user.privacySettings,
    };

    const privacyFields = user.privacySettings?.fields || {};

    // Add fields based on privacy settings
    if (privacyFields.fullName === 'public') filteredUser.fullName = user.fullName;
    if (privacyFields.email === 'public') filteredUser.email = user.email;
    if (privacyFields.phoneNumber === 'public') {
      filteredUser.phoneNumber = user.phoneNumber;
      filteredUser.countryCode = user.countryCode;
    }
    if (privacyFields.gender === 'public') filteredUser.gender = user.gender;
    if (privacyFields.dateOfBirth === 'public') filteredUser.dateOfBirth = user.dateOfBirth;
    if (privacyFields.bloodGroup === 'public') filteredUser.bloodGroup = user.bloodGroup;
    if (privacyFields.location === 'public') filteredUser.location = user.location;
    if (privacyFields.bio === 'public') filteredUser.bio = user.bio;
    if (privacyFields.socialLinks === 'public') filteredUser.socialLinks = user.socialLinks;
    if (privacyFields.studentInfo === 'public') filteredUser.studentInfo = user.studentInfo;
    if (privacyFields.teacherInfo === 'public') filteredUser.teacherInfo = user.teacherInfo;

    res.json({
      success: true,
      data: filteredUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPublicProfile,
};
