# Design Document

## Overview

This design implements a comprehensive profile privacy system for CodeChat that allows users to control the visibility of their profile information at both field and global levels. The system ensures profile data persists in forms after updates and provides clear visual feedback about privacy settings.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Profile Page Component                                      │
│  ├── Profile Form (with current values)                     │
│  ├── Privacy Toggle Components                              │
│  ├── Global Visibility Switch                               │
│  └── Visual Privacy Indicators                              │
├─────────────────────────────────────────────────────────────┤
│                     State Management                         │
├─────────────────────────────────────────────────────────────┤
│  useAuthStore (Zustand)                                      │
│  ├── User profile data                                       │
│  ├── Privacy settings                                        │
│  └── Update methods                                          │
├─────────────────────────────────────────────────────────────┤
│                     Backend Layer                            │
├─────────────────────────────────────────────────────────────┤
│  User Model (MongoDB)                                        │
│  ├── Profile fields                                          │
│  ├── Privacy settings object                                 │
│  └── Global visibility flag                                  │
├─────────────────────────────────────────────────────────────┤
│  Profile Controller                                          │
│  ├── Update profile endpoint                                 │
│  ├── Update privacy settings endpoint                        │
│  └── Get public profile endpoint                             │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. User Model Extension

**File**: `backend/src/models/User.js`

Add privacy settings to the User schema:

```javascript
privacySettings: {
  globalVisibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },
  fields: {
    fullName: { type: String, enum: ['public', 'private'], default: 'private' },
    email: { type: String, enum: ['public', 'private'], default: 'private' },
    phoneNumber: { type: String, enum: ['public', 'private'], default: 'private' },
    gender: { type: String, enum: ['public', 'private'], default: 'private' },
    dateOfBirth: { type: String, enum: ['public', 'private'], default: 'private' },
    bloodGroup: { type: String, enum: ['public', 'private'], default: 'private' },
    location: { type: String, enum: ['public', 'private'], default: 'private' },
    bio: { type: String, enum: ['public', 'private'], default: 'public' },
    avatar: { type: String, enum: ['public', 'private'], default: 'public' },
    socialLinks: { type: String, enum: ['public', 'private'], default: 'private' },
    studentInfo: { type: String, enum: ['public', 'private'], default: 'private' },
    teacherInfo: { type: String, enum: ['public', 'private'], default: 'private' }
  }
}
```

### 2. Profile Controller Updates

**File**: `backend/src/controllers/profileController.js`

**New Endpoints**:

1. `PUT /api/profile/privacy` - Update privacy settings
2. `GET /api/users/:id/public-profile` - Get filtered public profile

**Privacy Filtering Logic**:
```javascript
function filterProfileByPrivacy(user, viewerId) {
  // If viewing own profile, return all data
  if (user._id.toString() === viewerId) {
    return user;
  }
  
  // If global visibility is private, return minimal data
  if (user.privacySettings.globalVisibility === 'private') {
    return {
      _id: user._id,
      username: user.username,
      role: user.role,
      avatar: user.avatar // Always show avatar
    };
  }
  
  // Filter fields based on individual privacy settings
  const filteredUser = { ...user.toObject() };
  Object.keys(user.privacySettings.fields).forEach(field => {
    if (user.privacySettings.fields[field] === 'private') {
      delete filteredUser[field];
    }
  });
  
  return filteredUser;
}
```

### 3. Frontend Profile Component

**File**: `frontend/src/pages/Profile.jsx`

**Key Features**:
- Form fields populated with current user data
- Privacy toggle next to each field
- Global visibility switch at the top
- Visual indicators (lock/unlock icons)
- Real-time updates without page refresh

**Component Structure**:
```jsx
<ProfilePage>
  <GlobalVisibilityToggle />
  <ProfileForm>
    <FormField 
      name="fullName" 
      value={user.fullName}
      privacy={privacySettings.fields.fullName}
      onPrivacyChange={handlePrivacyChange}
    />
    {/* Repeat for each field */}
  </ProfileForm>
  <PrivacySummary />
</ProfilePage>
```

### 4. Privacy Toggle Component

**File**: `frontend/src/components/profile/PrivacyToggle.jsx`

```jsx
<PrivacyToggle>
  <button onClick={togglePrivacy}>
    {isPublic ? <UnlockIcon /> : <LockIcon />}
    <span>{isPublic ? 'Public' : 'Private'}</span>
  </button>
  <Tooltip>
    {isPublic 
      ? 'This field is visible to others' 
      : 'This field is hidden from others'}
  </Tooltip>
</PrivacyToggle>
```

## Data Models

### User Privacy Settings Schema

```javascript
{
  privacySettings: {
    globalVisibility: 'private', // 'public' | 'private'
    fields: {
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
      teacherInfo: 'private'
    }
  }
}
```

### API Request/Response Examples

**Update Privacy Settings**:
```javascript
// Request
PUT /api/profile/privacy
{
  "globalVisibility": "public",
  "fields": {
    "fullName": "public",
    "email": "private",
    "bio": "public"
  }
}

// Response
{
  "success": true,
  "message": "Privacy settings updated",
  "data": {
    "privacySettings": { /* updated settings */ }
  }
}
```

**Get Public Profile**:
```javascript
// Request
GET /api/users/123/public-profile

// Response (if global visibility is public)
{
  "success": true,
  "data": {
    "_id": "123",
    "username": "john_doe",
    "role": "student",
    "avatar": "url",
    "bio": "Hello world", // public field
    // email, phone, etc. excluded (private fields)
  }
}
```

## Error Handling

### Validation Errors
- Invalid privacy values (not 'public' or 'private')
- Missing required fields
- Unauthorized access attempts

### Error Responses
```javascript
{
  "success": false,
  "message": "Invalid privacy setting value",
  "errors": {
    "field": "fullName",
    "value": "invalid",
    "expected": "public or private"
  }
}
```

## Testing Strategy

### Unit Tests
1. Privacy filtering logic
2. Privacy settings validation
3. Default privacy settings on user creation

### Integration Tests
1. Update profile with privacy settings
2. Fetch public profile with various privacy configurations
3. Global visibility override behavior

### Frontend Tests
1. Form persistence after update
2. Privacy toggle functionality
3. Visual indicator rendering
4. Real-time updates

## Security Considerations

1. **Authorization**: Only users can update their own privacy settings
2. **Validation**: Server-side validation of all privacy values
3. **Default Privacy**: All fields private by default for new users
4. **Sensitive Data**: Email and phone always require explicit public setting
5. **Profile Viewing**: Enforce privacy filters on all profile view endpoints

## Performance Considerations

1. **Caching**: Cache privacy settings in frontend state
2. **Batch Updates**: Allow updating multiple privacy settings in one request
3. **Optimistic Updates**: Update UI immediately, rollback on error
4. **Indexing**: Add index on `privacySettings.globalVisibility` for queries

## UI/UX Design

### Visual Indicators
- 🔒 Lock icon = Private field
- 🔓 Unlock icon = Public field
- 🌐 Globe icon = Global visibility public
- 🔐 Shield icon = Global visibility private

### Color Coding
- **Private**: Red/Orange tint
- **Public**: Green/Blue tint
- **Neutral**: Gray for unchanged

### Tooltips
- Hover/tap on icons shows explanation
- "This field is visible to other users"
- "This field is hidden from other users"
- "Your entire profile is private"

### Success Messages
- "Profile updated successfully"
- "Privacy settings saved"
- "Your profile is now public/private"

## Migration Strategy

For existing users without privacy settings:

1. Run migration script to add default privacy settings
2. Set `globalVisibility: 'private'`
3. Set all fields to `'private'` except `avatar` and `bio`
4. Log migration results

```javascript
// Migration script
db.users.updateMany(
  { privacySettings: { $exists: false } },
  {
    $set: {
      'privacySettings.globalVisibility': 'private',
      'privacySettings.fields': {
        fullName: 'private',
        email: 'private',
        // ... all fields private except:
        avatar: 'public',
        bio: 'public'
      }
    }
  }
);
```

## Future Enhancements

1. **Custom Privacy Groups**: Create groups of users who can see certain fields
2. **Privacy Presets**: Quick templates (Fully Public, Fully Private, Professional)
3. **Privacy History**: Log of privacy setting changes
4. **Bulk Privacy Actions**: "Make all fields public/private" button
5. **Privacy Recommendations**: Suggest privacy settings based on role
