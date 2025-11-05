const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on file mimetype
    let resourceType = 'auto';
    let format = null;
    let transformation = [];

    // Images should be stored as 'image' with optimization
    if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
      // Auto-optimize images: compress, auto format, and auto quality
      transformation = [
        { quality: 'auto:good' }, // Automatic quality adjustment
        { fetch_format: 'auto' }, // Automatically deliver best format (WebP, AVIF, etc.)
      ];
    } 
    // PDFs and documents should be stored as 'raw'
    else if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'text/plain' ||
      file.mimetype === 'application/zip'
    ) {
      resourceType = 'raw';
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    
    return {
      folder: 'codechat',
      resource_type: resourceType,
      public_id: `${file.fieldname}-${uniqueSuffix}`,
      access_mode: 'public',
      format: format,
      transformation: transformation.length > 0 ? transformation : undefined,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'zip'],
    };
  },
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, documents, and ZIP files are allowed.'), false);
  }
};

// Configure Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

module.exports = { cloudinary, upload };