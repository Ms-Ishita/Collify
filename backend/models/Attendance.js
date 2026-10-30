import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late'],
        default: 'Present'
    },
    remarks: {
        type: String,
        default: ''
    }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    takenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    records: [attendanceRecordSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Unique index to ensure one attendance sheet per classroom per date
attendanceSchema.index({ classroom: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
