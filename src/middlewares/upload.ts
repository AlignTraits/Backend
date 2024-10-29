import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// Make error handling middleware for file uploads
export const receiveUserProfileUpload = (fileName: string) => {
  try {
    return upload.single(fileName);
  } catch (error) {
    throw new Error(`Error receiving user profile upload: ${error}`);
  }
};
