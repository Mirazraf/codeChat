/**
 * Privacy Filter Utility
 * Filters user profile data based on privacy settings and viewer context
 */

/**
 * Filters a user profile based on privacy settings and viewer identity
 * @param {Object} user - The user object to filter
 * @param {String} viewerId - The ID of the user viewing the profile
 * @returns {Object} Filtered user profile
 */
const filterProfileByPrivacy = (user, viewerId) => {
  // If viewing own profile, return all data
  if (user._id.toString() === viewerId?.toString()) {
    return user;
  }

  // If global visibility is private, return minimal data
  if (user.privacySettings?.globalVisibility === 'private') {
    return {
      _id: user._id,
      username: user.username,
      role: user.role,
      avatar: user.avatar // Always show avatar
    };
  }

  // Filter individual fields based on privacy settings
  const filteredUser = { ...user.toObject() };
  
  // If privacy settings exist, filter fields
  if (user.privacySettings?.fields) {
    Object.keys(user.privacySettings.fields).forEach(field => {
      if (user.privacySettings.fields[field] === 'private') {
        delete filteredUser[field];
      }
    });
  }

  // Always include basic identification fields
  filteredUser._id = user._id;
  filteredUser.username = user.username;
  filteredUser.role = user.role;

  return filteredUser;
};

module.exports = {
  filterProfileByPrivacy
};
