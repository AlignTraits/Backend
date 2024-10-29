import multer from 'multer';
import { getUserById, updateUser } from '../models/userModel';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import cloudinary from '../config/cloudinary';
import path from 'path';
import sharp from 'sharp';

// Use memory storage for Multer
export const upload = multer({
  storage: multer.memoryStorage(),
});

const uploadToCloudinary = async ({
  id,
  folder,
  file,
}: {
  id: string;
  folder: string;
  file: Express.Multer.File;
}): Promise<UploadApiErrorResponse | UploadApiResponse | undefined> => {
  try {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        },
      );
      stream.end(file.buffer);
    });
  } catch (e) {
    throw e;
  }
};

export const uploadProfilePicService = async (
  userId: string,
  file: Express.Multer.File | undefined,
) => {
  try {
    const existingUser = await getUserById(userId);

    if (!existingUser)
      return {
        ok: false,
        status: 403,
        message: 'User not found',
        errors: [{ message: 'User does not exist' }],
      };

    if (!file) {
      return {
        ok: false,
        status: 403,
        message: 'File upload failed',
        errors: [{ message: 'No file uploaded' }],
      };
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension))
      return {
        ok: false,
        status: 403,
        message: 'File upload failed',
        errors: [
          { message: 'Invalid file type. Only JPG, JPEG & PNG are allowed.' },
        ],
      };

    // Resize the image using sharp
    const resizedBuffer = await sharp(file.buffer)
      .resize(400, 400, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .toBuffer();

    // const url = await uploadToCloudinary(existingUser.id, file);
    const uploadResponse = await uploadToCloudinary({
      id: userId,
      folder: `profile-pics/${userId}`,
      file: { ...file, buffer: resizedBuffer },
    });

    if (!uploadResponse)
      return {
        ok: false,
        status: 500,
        message: 'Update failed',
        errors: [
          {
            message: 'Server error. Something went wrong at uploadUserPicture',
          },
        ],
      };

    // update the user profile picture in db
    const [updatedUser] = await Promise.all([
      updateUser(userId, { image: uploadResponse?.url }),
      // user.image && deleteFromGCS({url: user.image})
    ]);

    return {
      ok: true,
      status: 200,
      message: 'sucessful',
      data: {
        id: updatedUser.id,
        image: updatedUser.image,
        updatedAt: updatedUser.updatedAt,
      },
    };
  } catch (e) {
    throw e;
  }
};

// export { upload, uploadProfilePic,formKeyUpload };
