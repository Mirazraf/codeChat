const { cloudinary } = require('../config/cloudinary');

// Upload file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // File info from Cloudinary
    const fileInfo = {
      url: req.file.path,
      publicId: req.file.filename,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      resourceType: req.file.resource_type,
    };

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: fileInfo,
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message,
    });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message,
    });
  }
};

module.exports = {
  uploadFile,
  deleteFile,
};