// File upload rules for the admin bulk tools.
// Only the expected file type is accepted, and files have a size cap, so an
// upload cannot fill the server's memory or slip in a different kind of file.
import multer from 'multer';
import path from 'path';
import { NextFunction, Request, RequestHandler, Response } from 'express';

const MB = 1024 * 1024;

class FileTypeError extends Error {
  code = 'FILE_TYPE';
}

const csvOnly: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() === '.csv') return cb(null, true);
  cb(new FileTypeError('Only .csv files are allowed'));
};

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const imagesOnly: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (IMAGE_EXTENSIONS.includes(ext) && /^image\/(png|jpe?g|webp)$/.test(file.mimetype)) {
    return cb(null, true);
  }
  cb(new FileTypeError('Only PNG, JPG or WEBP images are allowed'));
};

// Turns upload problems into a clear 400 reply instead of a server error.
const friendly = (handler: RequestHandler): RequestHandler => (req: Request, res: Response, next: NextFunction) =>
  handler(req, res, (err?: any) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'This file is too large' : err.message;
      return res.status(400).json({ ok: false, message });
    }
    if (err instanceof FileTypeError) {
      return res.status(400).json({ ok: false, message: err.message });
    }
    return next(err);
  });

export const csvUpload = (field: string) =>
  friendly(
    multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 20 * MB, files: 1 },
      fileFilter: csvOnly,
    }).single(field)
  );

export const imageUploads = (field: string, maxFiles: number) =>
  friendly(
    multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * MB, files: maxFiles },
      fileFilter: imagesOnly,
    }).array(field, maxFiles)
  );
