import express from 'express';
import Post from '../models/Post.js';
import Classroom from '../models/Classroom.js';
import { protect, teacherOnly } from '../middleware/auth.js';
import { upload, cloudinary } from '../middleware/upload.js';

const router = express.Router();

router.get("/:classRoomId/get", protect, async (req, res) => {
    try {
        const { classRoomId } = req.params;
        const classroom = await Classroom.findById(classRoomId);
        if (!classroom) return res.status(404).json({ msg: 'Classroom not found' });

        const isTeacher = classroom.teacher.toString() === req.user.id;
        const isStudent = classroom.students.some(s => s.toString() === req.user.id);

        if (!isTeacher && !isStudent) {
            return res.status(403).json({ msg: "Not Authorized" });
        }

        const posts = await Post.find({ classroom: classRoomId })
            .populate('author', 'username email')
            .populate('quiz_id')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            posts
        });
    } catch (err) {
        console.error('Fetch posts error:', err);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
});

// Helper middleware for handling multer upload errors gracefully
const handleUpload = (req, res, next) => {
    const uploadMiddleware = upload.array('attachments', 5);
    uploadMiddleware(req, res, (err) => {
        if (err) {
            console.error('Multer upload error:', err.message);
            return res.status(400).json({ success: false, msg: err.message || 'File upload error. Only PDFs up to 10MB are allowed.' });
        }
        next();
    });
};

router.post("/:classRoomId/create", protect, teacherOnly, handleUpload, async (req, res) => {
    try {
        const { classRoomId } = req.params;
        const { type, title, content, meetLink, quiz_id, material_URL } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, msg: 'Title and content are required' });
        }

        const classroom = await Classroom.findById(classRoomId);
        if (!classroom) {
            return res.status(404).json({ success: false, msg: "Classroom Not Found" });
        }

        if (classroom.teacher.toString() !== req.user.id) {
            return res.status(403).json({ success: false, msg: "Not Authorized" });
        }

        if (type === 'google_meet' && !meetLink) {
            return res.status(400).json({ success: false, msg: "Google Meet link is required" });
        }

        let attachmentUrls = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream(
                            { resource_type: 'raw', folder: 'collify_materials' },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        ).end(file.buffer);
                    });

                    if (result && result.secure_url) {
                        attachmentUrls.push(result.secure_url);
                    }
                } catch (cloudErr) {
                    console.error('Cloudinary upload failure:', cloudErr.message || cloudErr);
                    return res.status(500).json({
                        success: false,
                        msg: 'Failed to upload attachments to Cloudinary. Please check file format and size.'
                    });
                }
            }
        }

        const effectiveMaterialUrl = material_URL || (attachmentUrls.length > 0 ? attachmentUrls[0] : undefined);

        const post = new Post({
            classroom: classRoomId,
            author: req.user.id,
            type: type || 'announcement',
            title: title.trim(),
            content: content.trim(),
            meetLink: type === "google_meet" ? meetLink.trim() : undefined,
            quiz_id: type === "quiz" ? quiz_id : undefined,
            material_URL: type === "material" ? effectiveMaterialUrl : undefined,
            attachments: attachmentUrls,
        });

        await post.save();
        await post.populate('author', 'username email');

        res.status(201).json({
            success: true,
            msg: "Post created successfully",
            post
        });
    } catch (err) {
        console.error('Create post error:', err);
        return res.status(500).json({
            success: false,
            msg: err.message || "Internal Server error"
        });
    }
});

export default router;
