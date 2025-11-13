const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: 'https://ui-avatars.com/api/?name=User&background=random&size=200',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    
    // PERSONAL INFO (Universal)
    fullName: {
      type: String,
      trim: true,
      default: '',
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    countryCode: {
      type: String,
      default: '+880', // Bangladesh default
    },
    gender: {
      type: String,
      enum: ['', 'male', 'female', 'other', 'prefer-not-to-say'],
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    bloodGroup: {
      type: String,
      enum: ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      default: '',
    },
    location: {
      city: { type: String, default: '' },
      country: { type: String, default: '' },
      fullLocation: { type: String, default: '' },
    },
    
    // SOCIAL LINKS (Universal)
    socialLinks: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    
    // STUDENT-SPECIFIC FIELDS
    studentInfo: {
      institution: { type: String, default: '' },
      educationLevel: { 
        type: String, 
        enum: ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'BSc', 'BA', 'MA', 'MSc', 'PhD', 'Diploma', 'Other'],
        default: '' 
      },
      major: { type: String, default: '' },
      preferredTopics: [{ type: String }], // Array of learning topics
    },
    
    // TEACHER-SPECIFIC FIELDS
    teacherInfo: {
      education: [{
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true },
        field: { type: String, default: '' },
      }],
      expertise: [{ type: String }], // Array of expertise subjects
      experienceYears: { type: Number, default: 0 },
    },
    
    lastUsernameChange: {
      type: Date,
      default: Date.now,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    lastReadMessages: [{
      room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
      },
      message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    }],
    
    // PRIVACY SETTINGS
    privacySettings: {
      globalVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'private',
      },
      fields: {
        fullName: { 
          type: String, 
          enum: ['public', 'private'], 
          default: 'private' 
        },
        email: { 
          type: String, 
          enum: ['public', 'private'], 
          default: 'private' 
        },
        phoneNumber: { 
          type: String, 
          enum: ['public', 'private'], 
          default: 'private' 
        },
        gender: { 
          type: String, 
          enum: ['public', 'private'], 
          default: 'private' 
        },
        dateOfBirth: { 
          type: String, 
          enum: ['public', 'private'], 
          default: 'private' 
        },
        bloodGroup: { 
          type: String, 
          enum: ['public', 'private'], 
          default: 'private' 
        },
        location: { 
          type: String, 
          enum: ['public', 'private'], 
          default: 'private' 
        },
        bio: { 
          type: String, 
          enum: ['public', 'private'], 
          default: 'public' 
        },
        avatar: { 
          type: String, 
          enum: ['public', 'private'], 
          default: 'public' 
        },
        socialLinks: { 
          type: String, 
          enum: ['public', 'private'], 
          default: 'private' 
        },
        studentInfo: { 
          type: String, 
          enum: ['public', 'private'], 
          default: 'private' 
        },
        teacherInfo: { 
          type: String, 
          enum: ['public', 'private'], 
          default: 'private' 
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check if password matches
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to calculate profile completion
userSchema.methods.getProfileCompletion = function () {
  let totalFields = 0;
  let filledFields = 0;

  // Universal fields (10 fields)
  const universalFields = [
    this.fullName,
    this.avatar && !this.avatar.includes('ui-avatars'),
    this.phoneNumber,
    this.gender,
    this.dateOfBirth,
    this.bloodGroup,
    this.location.fullLocation,
    this.socialLinks.linkedin || this.socialLinks.github || this.socialLinks.portfolio,
  ];

  totalFields += 8;
  filledFields += universalFields.filter(f => f).length;

  // Role-specific fields
  if (this.role === 'student') {
    const studentFields = [
      this.studentInfo.institution,
      this.studentInfo.educationLevel,
      this.studentInfo.major,
      this.studentInfo.preferredTopics.length > 0,
    ];
    totalFields += 4;
    filledFields += studentFields.filter(f => f).length;
  } else if (this.role === 'teacher') {
    const teacherFields = [
      this.teacherInfo.education.length > 0,
      this.teacherInfo.expertise.length > 0,
      this.teacherInfo.experienceYears > 0,
    ];
    totalFields += 3;
    filledFields += teacherFields.filter(f => f).length;
  }

  return Math.round((filledFields / totalFields) * 100);
};

module.exports = mongoose.model('User', userSchema);
