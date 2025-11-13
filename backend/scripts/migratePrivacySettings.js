#!/usr/bin/env node

/**
 * Migration Script: Add Default Privacy Settings to Existing Users
 * 
 * This script adds default privacy settings to users who don't have them.
 * - Sets globalVisibility to 'private'
 * - Sets all fields to 'private' except 'avatar' and 'bio' (which are 'public')
 * 
 * Usage: node backend/scripts/migratePrivacySettings.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

// Default privacy settings
const DEFAULT_PRIVACY_SETTINGS = {
  globalVisibility: 'private',
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
    teacherInfo: 'private',
  },
};

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Run the migration
 */
const runMigration = async () => {
  console.log('\n🚀 Starting Privacy Settings Migration...\n');

  try {
    // Find users without privacy settings
    const usersWithoutPrivacy = await User.find({
      $or: [
        { privacySettings: { $exists: false } },
        { 'privacySettings.globalVisibility': { $exists: false } },
        { 'privacySettings.fields': { $exists: false } },
      ],
    });

    console.log(`📊 Found ${usersWithoutPrivacy.length} users without complete privacy settings\n`);

    if (usersWithoutPrivacy.length === 0) {
      console.log('✅ All users already have privacy settings. No migration needed.\n');
      return { updated: 0, failed: 0 };
    }

    let updated = 0;
    let failed = 0;
    const errors = [];

    // Update each user
    for (const user of usersWithoutPrivacy) {
      try {
        // Update privacy settings
        const result = await User.updateOne(
          { _id: user._id },
          {
            $set: {
              'privacySettings.globalVisibility': DEFAULT_PRIVACY_SETTINGS.globalVisibility,
              'privacySettings.fields': DEFAULT_PRIVACY_SETTINGS.fields,
            },
          }
        );

        if (result.modifiedCount > 0) {
          updated++;
          console.log(`✅ Updated user: ${user.username} (${user.email})`);
        } else {
          console.log(`⚠️  No changes for user: ${user.username} (${user.email})`);
        }
      } catch (error) {
        failed++;
        const errorMsg = `Failed to update user ${user.username}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   Total users found: ${usersWithoutPrivacy.length}`);
    console.log(`   Successfully updated: ${updated}`);
    console.log(`   Failed: ${failed}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err}`);
      });
    }

    return { updated, failed };
  } catch (error) {
    console.error(`\n❌ Migration failed: ${error.message}`);
    throw error;
  }
};

/**
 * Main execution
 */
const main = async () => {
  let connection;

  try {
    // Connect to database
    connection = await connectDB();

    // Run migration
    const result = await runMigration();

    // Success message
    if (result.failed === 0) {
      console.log('\n✅ Migration completed successfully!\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Migration completed with errors.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    if (connection) {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed.\n');
    }
  }
};

// Run the script
main();
