import dotenv from 'dotenv';
import { Storage } from '@google-cloud/storage';

dotenv.config();

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});
const bucketName = process.env.GCP_BUCKET_NAME; 
const bucket = storage.bucket(bucketName);

export { bucket };