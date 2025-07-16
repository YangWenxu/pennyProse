import multer from 'multer';
import path from 'path';
import fs from 'fs';

export class UploadService {
  constructor() {
    // Ensure upload directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    const uploadDirs = [
      'public/uploads',
      'public/uploads/images',
      'public/uploads/markdown',
      'public/uploads/avatars'
    ];

    uploadDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Configure multer for different file types
  getMulterConfig(fileType = 'general') {
    const configs = {
      markdown: {
        storage: multer.memoryStorage(),
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB limit
        },
        fileFilter: (req, file, cb) => {
          if (file.mimetype === 'text/markdown' || file.originalname.endsWith('.md')) {
            cb(null, true);
          } else {
            cb(new Error('Only Markdown files are allowed'), false);
          }
        }
      },
      
      image: {
        storage: multer.diskStorage({
          destination: (req, file, cb) => {
            cb(null, 'public/uploads/images');
          },
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
          }
        }),
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB limit
        },
        fileFilter: (req, file, cb) => {
          const allowedTypes = /jpeg|jpg|png|gif|webp/;
          const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
          const mimetype = allowedTypes.test(file.mimetype);

          if (mimetype && extname) {
            return cb(null, true);
          } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
          }
        }
      },

      avatar: {
        storage: multer.diskStorage({
          destination: (req, file, cb) => {
            cb(null, 'public/uploads/avatars');
          },
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
          }
        }),
        limits: {
          fileSize: 2 * 1024 * 1024, // 2MB limit
        },
        fileFilter: (req, file, cb) => {
          const allowedTypes = /jpeg|jpg|png|webp/;
          const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
          const mimetype = allowedTypes.test(file.mimetype);

          if (mimetype && extname) {
            return cb(null, true);
          } else {
            cb(new Error('Only image files are allowed for avatars (jpeg, jpg, png, webp)'), false);
          }
        }
      }
    };

    return configs[fileType] || configs.general;
  }

  // Get multer middleware for specific file type
  getUploadMiddleware(fileType = 'general', fieldName = 'file', multiple = false) {
    const config = this.getMulterConfig(fileType);
    const upload = multer(config);

    if (multiple) {
      return upload.array(fieldName, 10); // Max 10 files
    } else {
      return upload.single(fieldName);
    }
  }

  // Handle file upload errors
  handleUploadError(error, req, res, next) {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large',
          message: 'File size exceeds the allowed limit'
        });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: 'Too many files',
          message: 'Number of files exceeds the allowed limit'
        });
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          error: 'Unexpected field',
          message: 'Unexpected file field'
        });
      }
    }

    if (error.message) {
      return res.status(400).json({
        error: 'Upload error',
        message: error.message
      });
    }

    next(error);
  }

  // Process uploaded image and return URL
  processImageUpload(file) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const fileUrl = `${baseUrl}/uploads/images/${file.filename}`;

    return {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: fileUrl,
      path: file.path
    };
  }

  // Process uploaded avatar and return URL
  processAvatarUpload(file) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const fileUrl = `${baseUrl}/uploads/avatars/${file.filename}`;

    return {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: fileUrl,
      path: file.path
    };
  }

  // Delete uploaded file
  deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Get file info
  getFileInfo(filename, type = 'images') {
    const filePath = path.join('public/uploads', type, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    const stats = fs.statSync(filePath);
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

    return {
      filename,
      size: stats.size,
      url: `${baseUrl}/uploads/${type}/${filename}`,
      path: filePath,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    };
  }

  // List uploaded files
  listFiles(type = 'images', page = 1, limit = 20) {
    const uploadDir = path.join('public/uploads', type);
    
    if (!fs.existsSync(uploadDir)) {
      return {
        files: [],
        pagination: { page, limit, total: 0, pages: 0 }
      };
    }

    const allFiles = fs.readdirSync(uploadDir)
      .filter(file => {
        const filePath = path.join(uploadDir, file);
        return fs.statSync(filePath).isFile();
      })
      .map(filename => {
        const filePath = path.join(uploadDir, filename);
        const stats = fs.statSync(filePath);
        const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

        return {
          filename,
          size: stats.size,
          url: `${baseUrl}/uploads/${type}/${filename}`,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = allFiles.length;
    const skip = (page - 1) * limit;
    const files = allFiles.slice(skip, skip + limit);

    return {
      files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Clean up old files (older than specified days)
  cleanupOldFiles(type = 'images', daysOld = 30) {
    const uploadDir = path.join('public/uploads', type);
    
    if (!fs.existsSync(uploadDir)) {
      return { deleted: 0, errors: [] };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const files = fs.readdirSync(uploadDir);
    let deleted = 0;
    const errors = [];

    files.forEach(filename => {
      try {
        const filePath = path.join(uploadDir, filename);
        const stats = fs.statSync(filePath);

        if (stats.isFile() && stats.birthtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deleted++;
        }
      } catch (error) {
        errors.push({ filename, error: error.message });
      }
    });

    return { deleted, errors };
  }
}
