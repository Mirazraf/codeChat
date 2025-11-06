const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { username, institution, grade, bloodGroup } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is being changed
    if (username && username !== user.username) {
      // Check if enough time has passed (1 week)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      if (user.lastUsernameChange && new Date(user.lastUsernameChange) > oneWeekAgo) {
        return res.status(400).json({ 
          message: 'You can only change username once per week' 
        });
      }

      // Check if username is already taken
      const usernameExists = await User.findOne({ username });
      if (usernameExists && usernameExists._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      user.username = username;
      user.lastUsernameChange = Date.now();
    }

    // Update other fields
    if (institution !== undefined) user.institution = institution;
    if (grade !== undefined) user.grade = grade;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        institution: user.institution,
        grade: user.grade,
        bloodGroup: user.bloodGroup,
        lastUsernameChange: user.lastUsernameChange,
      },
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload profile picture to Cloudinary
// @route   POST /api/profile/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    console.log('📸 Avatar upload request received');
    console.log('👤 User ID:', req.user._id);
    console.log('📁 File info:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'NO FILE');

    if (!req.file) {
      console.log('❌ No file received');
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User found:', user.username);
    console.log('📤 Uploaded to Cloudinary:', req.file.path);

    // Delete old avatar from cloudinary if it exists
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      try {
        // Extract public_id from cloudinary URL
        const urlParts = user.avatar.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        const publicIdWithExtension = lastPart.split('.')[0];
        const publicId = `codechat/avatars/${publicIdWithExtension}`;
        
        console.log('🗑️ Attempting to delete old avatar:', publicId);
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('✅ Old avatar deletion result:', result);
      } catch (err) {
        console.error('⚠️ Error deleting old avatar:', err.message);
        // Continue even if deletion fails
      }
    }

    // Update user avatar
    const oldAvatar = user.avatar;
    user.avatar = req.file.path; // Cloudinary URL
    await user.save();

    console.log('✅ Avatar updated in database');
    console.log('🔄 Old:', oldAvatar);
    console.log('🆕 New:', user.avatar);

    res.json({
      success: true,
      data: {
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('❌ Upload avatar error:', error);
    console.error('Stack:', error.stack);
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

    // Check if old password matches
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
  updateProfile,
  uploadAvatar,
  changePassword,
};
