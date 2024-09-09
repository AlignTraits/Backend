import dotenv from 'dotenv';
import { getUserById, updateUser } from '../models/User.js';
import { uploadProfilePic } from '../helpers/upload.js';
import sharp from 'sharp';
import path from 'path';


dotenv.config();

const getUserData = async (req, res) => {
    const userId = req.params.id;
    const details = req.query;
    
    console.log('details', details);

    if(!userId) return res.status(400).json({
        status: 'error',
        message: 'Invalid request',
        errors: [{ message: 'User ID is required' }]
    });

    // security measurements
    const user = await getUserById(userId);

    if (!user) return res.status(404).json({ 
        status: 'error',
        message: 'User not found',
        errors: [{ message: 'User does not exist' }] 
    });

    res.status(200).json({ 
        status: 'success',
        message: 'User found',
        data: { user }
    });
}

const updateUserProfile = async (req, res) => {
    const { userId, data: { id, image, updatedAt, createdAt, emailVerified, role, ...filteredData }  } = req.body;
    
    // security measurements
    const updatedUser = await updateUser(userId, filteredData);

    if (!updatedUser) return res.status(500).json({ 
        status: 'error',
        message: 'Update failed',
        errors: [{ message: 'Server error. Something went wrong at updateUserProfile' }] 
    });

    res.status(200).json({ 
        status: 'success',
        message: 'User updated successfully',
        data: { updatedUser }
    });
}

const uploadUserPicture = async (req, res) => {
    const { userId } = req.body;

    if (!req.file) {
        return res.status(400).json({
            status: 'error',
            message: 'File upload failed',
            errors: [{ message: 'No file uploaded' }]
        });
    }


    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({
            status: 'error',
            message: 'File upload failed',
            errors: [{ message: 'Invalid file type. Only JPG, JPEG & PNG are allowed.' }]
        });
    }


    const existingUser = await getUserById(userId);
    if (!existingUser) {
        return res.status(404).json({
            status: 'error',
            message: 'User not found',
            errors: [{ message: 'User does not exist' }]
        });
    }

    
    // Resize the image using sharp
    const resizedBuffer = await sharp(req.file.buffer)
        .resize(400, 400, {
            fit: sharp.fit.inside,
            withoutEnlargement: true
        })
        .toBuffer();

    // Save the resized picture to GCS
    const uploadRes = await uploadProfilePic(existingUser.id, { ...req.file, buffer: resizedBuffer });

    if (!uploadRes) {
        return res.status(500).json({
            status: 'error',
            message: 'Update failed',
            errors: [{ message: 'Server error. Something went wrong at uploadUserPicture' }]
        });
    }

    res.status(200).json({
        status: 'success',
        message: 'User picture uploaded successfully',
        data: {
            id: uploadRes.id,
            image: uploadRes.image,
            updatedAt: uploadRes.updatedAt
        }
    });
};

export {
    getUserData,
    updateUserProfile,
    uploadUserPicture
}