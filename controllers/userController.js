import dotenv from 'dotenv';
import { getUserById, updateUser } from '../models/User.js';
import { uploadProfilePic } from '../helpers/upload.js';
import sharp from 'sharp';
import path from 'path';
import bcrypt from 'bcryptjs';

dotenv.config();

const getUserData = async (req, res) => {
    const userId = req.params.id ?? req.user.id ?? '';
    // const details = req.query;
    
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
        data: { 
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            image: user.image,
            role: user.role,
            gender: user.gender,
            dob: user.dob,
            region: user.region,
            bio: user.bio,
         }
    });
}

const updateUserProfile = async (req, res) => {
    const { data: { id, image, email, updatedAt, createdAt, emailVerified, role, ...filteredData }  } = req.body;
    const userId = req.body.userId ?? req.user.id ?? '';
    console.log('Heloo: ', userId, req.user.id)

    if(!userId) return res.status(403).json({
        status: 'error',
        message: 'Update failed',
        errors: [{ message: 'Invalid user ID'}]
    })

    const existingUser = await getUserById(userId);
    if (!existingUser) {
        return res.status(404).json({
            status: 'error',
            message: 'User not found',
            errors: [{ message: 'User does not exist' }]
        });
    }
    
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
        data: { 
            id: updatedUser.id,
            firstname: updatedUser.firstname,
            lastname: updatedUser.lastname,
            email: updatedUser.email,
            image: updatedUser.image,
            role: updatedUser.role,
            gender: updatedUser.gender,
            dob: updatedUser.dob,
            region: updatedUser.region,
            bio: updatedUser.bio,
         }
    });
}

const updateUserPassword = async (req, res) => {
    const { newPassword } = req.body;
    const userId = req.user.id ?? '';
    console.log('Heloo: ', userId, req.user.id)

    if(!userId) return res.status(403).json({
        status: 'error',
        message: 'Update failed',
        errors: [{ message: 'Invalid user ID'}]
    })

    const existingUser = await getUserById(userId);
    if (!existingUser) {
        return res.status(404).json({
            status: 'error',
            message: 'User not found',
            errors: [{ message: 'User does not exist' }]
        });
    }
    
    // security measurements\
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await updateUser(userId, { password: hashedPassword });

    if (!updatedUser) return res.status(500).json({ 
        status: 'error',
        message: 'Update failed',
        errors: [{ message: 'Server error. Something went wrong at updateUserProfile' }] 
    });

    res.status(200).json({ 
        status: 'success',
        message: 'User password updated successfully',
        data: { 
            id: updatedUser.id,
            password: updatedUser.password
        }
    });
}

const uploadUserPicture = async (req, res) => {
    const userId  = req.body?.userId ?? req?.user?.id ?? '';
    console.log(userId)

    if(!userId){
        return res.status(403).json({
            status: 'error',
            message: 'File upload failed',
            errors: [{ message: 'User ID not found.' }]
        })
    }

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
    uploadUserPicture,
    updateUserPassword
}