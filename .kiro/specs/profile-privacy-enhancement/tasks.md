# Implementation Plan

- [x] 1. Update User Model with Privacy Settings
  - Add `privacySettings` object to User schema with `globalVisibility` and `fields` properties
  - Set default values: `globalVisibility: 'private'`, all fields private except `avatar` and `bio`
  - Add validation for privacy values (must be 'public' or 'private')
  - _Requirements: 2.4, 3.2, 5.1, 5.2_

- [x] 2. Create Privacy Filtering Utility
  - Create `utils/privacyFilter.js` with `filterProfileByPrivacy(user, viewerId)` function
  - Implement logic: return all data if viewing own profile
  - Implement logic: return minimal data if global visibility is private
  - Implement logic: filter individual fields based on privacy settings
  - _Requirements: 2.2, 2.3, 3.2, 3.3_

- [x] 3. Update Profile Controller
  - [x] 3.1 Modify `updateProfile` endpoint to accept and save privacy settings
    - Validate privacy settings structure
    - Update user's privacy settings in database
    - Return updated user with privacy settings
    - _Requirements: 2.4, 4.1, 4.3_
  
  - [x] 3.2 Create `updatePrivacySettings` endpoint (PUT /api/profile/privacy)
    - Accept `globalVisibility` and `fields` in request body
    - Validate all privacy values
    - Update user's privacy settings
    - Return success response with updated settings
    - _Requirements: 2.4, 3.4, 4.1, 4.3_
  
  - [x] 3.3 Create `getPublicProfile` endpoint (GET /api/users/:id/public-profile)
    - Fetch user by ID
    - Apply privacy filtering using utility function
    - Return filtered profile data
    - _Requirements: 2.2, 2.3, 3.2, 3.3_
  
  - [x] 3.4 Modify `getProfile` endpoint to return privacy settings
    - Include `privacySettings` in response for own profile
    - _Requirements: 2.5, 6.5_

- [x] 4. Add Privacy Routes
  - Add route: `PUT /api/profile/privacy` → `updatePrivacySettings`
  - Add route: `GET /api/users/:id/public-profile` → `getPublicProfile`
  - Protect routes with authentication middleware
  - _Requirements: 2.4, 4.1_

- [x] 5. Update Auth Store (Frontend)
  - [x] 5.1 Add privacy settings to user state
    - Include `privacySettings` in user object
    - _Requirements: 4.2_
  
  - [x] 5.2 Create `updatePrivacySettings` action
    - Call privacy update API endpoint
    - Update local state with new privacy settings
    - Show success/error toast
    - _Requirements: 2.4, 4.1, 4.3_
  
  - [x] 5.3 Modify `updateProfile` action to handle privacy settings
    - Accept privacy settings in update payload
    - Update local user state after successful update
    - _Requirements: 1.1, 1.2, 4.2_

- [x] 6. Create Privacy Toggle Component
  - Create `frontend/src/components/profile/PrivacyToggle.jsx`
  - Accept props: `isPublic`, `onChange`, `fieldName`
  - Render lock icon for private, unlock icon for public
  - Show tooltip on hover/tap with explanation
  - Handle click to toggle privacy
  - Apply color coding (red/orange for private, green/blue for public)
  - _Requirements: 2.1, 6.1, 6.2, 6.3, 6.4_

- [x] 7. Create Global Visibility Toggle Component
  - Create `frontend/src/components/profile/GlobalVisibilityToggle.jsx`
  - Display current global visibility status prominently
  - Render shield icon for private, globe icon for public
  - Handle toggle between public/private
  - Show confirmation message when changed
  - Display warning when setting to private
  - _Requirements: 3.1, 3.4, 3.5, 6.1, 6.2_

- [x] 8. Update Profile Page Component
  - [x] 8.1 Populate form fields with current user data
    - Set input values from `user` state
    - Use controlled components with value prop
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 8.2 Add GlobalVisibilityToggle at top of page
    - Pass current global visibility state
    - Handle toggle changes
    - _Requirements: 3.1, 3.4_
  
  - [x] 8.3 Add PrivacyToggle next to each form field
    - Pass field name and current privacy setting
    - Handle privacy changes for each field
    - _Requirements: 2.1, 2.5_
  
  - [x] 8.4 Update form submission handler
    - Keep form values after successful update
    - Show success message
    - Update local state with new values
    - _Requirements: 1.1, 1.3, 4.3_
  
  - [x] 8.5 Add visual privacy indicators
    - Show lock/unlock icons next to fields
    - Apply color coding based on privacy status
    - Add tooltips explaining privacy state
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 9. Create Privacy Summary Component
  - Create `frontend/src/components/profile/PrivacySummary.jsx`
  - Display list of all fields with their privacy status
  - Show global visibility status
  - Provide quick overview of privacy settings
  - _Requirements: 6.5_

- [x] 10. Add Privacy Service (Frontend)
  - Create `frontend/src/services/privacyService.js`
  - Add `updatePrivacySettings(settings)` function
  - Add `getPublicProfile(userId)` function
  - Handle API calls and error responses
  - _Requirements: 2.4, 4.1_

- [x] 11. Update Profile Form Styling
  - Add visual distinction for public vs private fields
  - Style privacy toggles consistently
  - Ensure mobile responsiveness
  - Add smooth transitions for privacy changes
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 12. Add Success/Error Notifications
  - Show toast on successful profile update
  - Show toast on successful privacy settings update
  - Show error messages for validation failures
  - Display confirmation for global visibility changes
  - _Requirements: 1.3, 4.3_

- [x] 13. Create Migration Script for Existing Users
  - Create `backend/scripts/migratePrivacySettings.js`
  - Add default privacy settings to users without them
  - Set `globalVisibility: 'private'`
  - Set all fields to private except `avatar` and `bio`
  - Log migration results
  - _Requirements: 5.1, 5.2_

- [x] 14. Add Privacy Settings Documentation
  - Create user guide explaining privacy features
  - Document what each privacy setting means
  - Provide examples of public vs private profiles
  - _Requirements: 5.4_
