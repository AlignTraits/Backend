import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // previously 5MB file size limit
});

// Specific Multer for school upload (2MB)
// const schoolUpload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
//   fileFilter: (req, file, cb) => {
//     if (!file.mimetype.startsWith('image/')) {
//       return cb(new Error('Please upload an image file'));
//     }
//     cb(null, true);
//   },
// });

// Make error handling middleware for file uploads
export const receiveUserProfileUpload = (fileName: string) => {
  try {
    return upload.single(fileName);
  } catch (error) {
    throw new Error(`Error receiving user profile upload: ${error}`);
  }
};
