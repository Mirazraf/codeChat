// Simply re-export the avatar upload from cloudinary config
const { avatarUpload } = require('../config/cloudinary');

module.exports = avatarUpload;
