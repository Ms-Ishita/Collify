import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Accept PDF files based on mimetype or file extension
        const isPdfMime = file.mimetype === 'application/pdf';
        const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');
        if (isPdfMime || isPdfExt) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF documents are allowed for class materials'), false);
        }
    },
});

export { upload, cloudinary };
