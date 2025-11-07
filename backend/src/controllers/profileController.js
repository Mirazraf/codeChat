const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get user profile with completion percentage
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profileCompletion = user.getProfileCompletion();

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        profileCompletion,
      },
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const updateData = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is being changed
    if (updateData.username && updateData.username !== user.username) {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      if (user.lastUsernameChange && new Date(user.lastUsernameChange) > oneWeekAgo) {
        return res.status(400).json({ 
          message: 'You can only change username once per week' 
        });
      }

      const usernameExists = await User.findOne({ username: updateData.username });
      if (usernameExists && usernameExists._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      user.username = updateData.username;
      user.lastUsernameChange = Date.now();
    }

    // Update universal fields
    if (updateData.fullName !== undefined) user.fullName = updateData.fullName;
    if (updateData.phoneNumber !== undefined) user.phoneNumber = updateData.phoneNumber;
    if (updateData.countryCode !== undefined) user.countryCode = updateData.countryCode;
    if (updateData.gender !== undefined) user.gender = updateData.gender;
    if (updateData.dateOfBirth !== undefined) user.dateOfBirth = updateData.dateOfBirth;
    if (updateData.bloodGroup !== undefined) user.bloodGroup = updateData.bloodGroup;
    if (updateData.bio !== undefined) user.bio = updateData.bio;
    
    // Update location
    if (updateData.location) {
      user.location = {
        city: updateData.location.city || user.location.city,
        country: updateData.location.country || user.location.country,
        fullLocation: updateData.location.fullLocation || user.location.fullLocation,
      };
    }
    
    // Update social links
    if (updateData.socialLinks) {
      user.socialLinks = {
        linkedin: updateData.socialLinks.linkedin || user.socialLinks.linkedin,
        github: updateData.socialLinks.github || user.socialLinks.github,
        portfolio: updateData.socialLinks.portfolio || user.socialLinks.portfolio,
        facebook: updateData.socialLinks.facebook || user.socialLinks.facebook,
        twitter: updateData.socialLinks.twitter || user.socialLinks.twitter,
      };
    }
    
    // Update role-specific fields
    if (user.role === 'student' && updateData.studentInfo) {
      user.studentInfo = {
        institution: updateData.studentInfo.institution || user.studentInfo.institution,
        educationLevel: updateData.studentInfo.educationLevel || user.studentInfo.educationLevel,
        major: updateData.studentInfo.major || user.studentInfo.major,
        preferredTopics: updateData.studentInfo.preferredTopics || user.studentInfo.preferredTopics,
      };
    } else if (user.role === 'teacher' && updateData.teacherInfo) {
      user.teacherInfo = {
        education: updateData.teacherInfo.education || user.teacherInfo.education,
        expertise: updateData.teacherInfo.expertise || user.teacherInfo.expertise,
        experienceYears: updateData.teacherInfo.experienceYears !== undefined 
          ? updateData.teacherInfo.experienceYears 
          : user.teacherInfo.experienceYears,
      };
    }

    await user.save();

    const profileCompletion = user.getProfileCompletion();

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        profileCompletion,
      },
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload profile picture
// @route   POST /api/profile/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    console.log('📸 Avatar upload request received');

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar from cloudinary if it exists
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      try {
        const urlParts = user.avatar.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        const publicIdWithExtension = lastPart.split('.')[0];
        const publicId = `codechat/avatars/${publicIdWithExtension}`;
        
        await cloudinary.uploader.destroy(publicId);
        console.log('✅ Old avatar deleted');
      } catch (err) {
        console.error('⚠️ Error deleting old avatar:', err.message);
      }
    }

    user.avatar = req.file.path;
    await user.save();

    console.log('✅ Avatar updated successfully');

    const profileCompletion = user.getProfileCompletion();

    res.json({
      success: true,
      data: {
        avatar: user.avatar,
        profileCompletion,
      },
    });
  } catch (error) {
    console.error('❌ Upload avatar error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Please provide old and new password' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters' 
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(oldPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    console.log('✅ Password changed for user:', user.username);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
};
