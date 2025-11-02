import { NextFunction, Request, Response } from 'express';
import { File, IncomingForm } from 'formidable';

// Extend Express Request interface for type safety
declare module 'express' {
  interface Request {
    avatar?: File;
    file?: File;
    files?: File | File[];
  }
}

export const uploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const form = new IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return next(err);
    }
    // console.log('Parsed files:', files); // Debug log to verify file parsing

    // Check if files.avatar exists before proceeding
    const avatarFile = files.avatar;
    if (avatarFile) {
      const file = Array.isArray(avatarFile) ? avatarFile[0] : avatarFile;
      req.avatar = file; // Attach the file to req.avatar
    }
    next();
  });
};

export const uploadCSVMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const form = new IncomingForm({
    maxFileSize: 10 * 1024 * 1024, // 10MB max file size
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(400).json({
        success: false,
        message: 'File parsing error',
        error: err.message,
      });
    }

    // Attach fields to req.body
    Object.keys(fields).forEach(key => {
      const value = fields[key];
      req.body[key] = Array.isArray(value) ? value[0] : value;
    });

    // Handle the CSV file
    const csvFile = files.file;
    if (csvFile) {
      const file = Array.isArray(csvFile) ? csvFile[0] : csvFile;
      req.file = file;
    }

    next();
  });
};

export const uploadFilesMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const form = new IncomingForm({
    multiples: true, // Allow multiple files
    maxFileSize: 10 * 1024 * 1024, // 10MB max file size
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(400).json({
        success: false,
        message: 'File parsing error',
        error: err.message,
      });
    }

    console.log('Parsed files:', files);
    console.log('Parsed fields:', fields);

    // Attach fields to req.body
    req.body = { ...req.body, ...fields };

    // Handle the 'files' field specifically
    const uploadedFiles = files.files;
    if (uploadedFiles) {
      req.files = uploadedFiles;
    }

    next();
  });
};
