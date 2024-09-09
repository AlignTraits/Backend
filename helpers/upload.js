import multer from 'multer';
import { bucket } from '../config/gcs.js'; // Import the bucket from your GCS configuration
import { getUserById, updateUser } from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

// Use memory storage for Multer
const upload = multer({
  storage: multer.memoryStorage()
})

function removeBucketBaseUrl(url) {
  const baseUrl = `https://storage.googleapis.com/${process.env.GCP_BUCKET_NAME}/`;
  if (url.startsWith(baseUrl)) {
    return url.slice(baseUrl.length);
  }
  return url;
}

const uploadToGCS = async ({file, path, filename}) => {
  const { originalname, buffer } = file;

  const blob = bucket.file(`${path ? `${path}/` : ''}${filename??originalname}`);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype
    },
    resumable: false,
  });

  return new Promise((resolve, reject) => {
    blobStream.on('finish', async () => {
      // Make the object publicly accessible
      await blob.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    })
    .on('error', (err) => {
      reject(err);
    })
    .end(buffer);
  });
};

const deleteFromGCS = async ({url, filename}) => { 
  console.log('deleting from GCS', url); 
  const file = bucket.file(filename ?? removeBucketBaseUrl(url));

  return file.delete();
}

const uploadProfilePic = async (userId, file) => {
  const uniqueId = uuidv4();

  const [user, url] = await Promise.all([
    getUserById(userId),
    uploadToGCS({
      file, 
      path: 'profile-pics', 
      filename: uniqueId
    })
  ]);

  // update the user profile picture in db
  const [ updatedUser ] = await Promise.all([
    updateUser(userId, { image: url }),
    user.image && deleteFromGCS({url: user.image})
  ]);

  return updatedUser;
}

export { upload, uploadProfilePic };