import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ["google_meet", "quiz", "announcement", "material"],
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    meetLink: {
        type: String,
        required: function () { return this.type === "google_meet"; },
    },
    quiz_id: {
        type: String,
        required: function () { return this.type === "quiz"; },
    },
    material_URL: {
        type: String,
        required: false,
    },
    attachments: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Post", postSchema);
