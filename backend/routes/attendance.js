import express from 'express';
import Attendance from '../models/Attendance.js';
import Classroom from '../models/Classroom.js';
import { protect, teacherOnly } from '../middleware/auth.js';

const router = express.Router();

// Helper to get formatted YYYY-MM-DD
const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// POST /attendance/:classroomId/record - Teacher records or updates attendance
router.post('/:classroomId/record', protect, teacherOnly, async (req, res) => {
    try {
        const { classroomId } = req.params;
        const { date, records } = req.body;

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ success: false, msg: 'Classroom not found' });
        }

        if (classroom.teacher.toString() !== req.user.id) {
            return res.status(403).json({ success: false, msg: 'Not authorized for this classroom' });
        }

        const sessionDate = date || getTodayDateString();

        if (!Array.isArray(records)) {
            return res.status(400).json({ success: false, msg: 'Records array is required' });
        }

        const formattedRecords = records.map(r => ({
            student: r.studentId || r.student,
            status: ['Present', 'Absent', 'Late'].includes(r.status) ? r.status : 'Present',
            remarks: r.remarks || ''
        }));

        const attendance = await Attendance.findOneAndUpdate(
            { classroom: classroomId, date: sessionDate },
            {
                classroom: classroomId,
                date: sessionDate,
                takenBy: req.user.id,
                records: formattedRecords,
                updatedAt: new Date()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).populate('records.student', 'username email');

        res.status(200).json({
            success: true,
            msg: `Attendance recorded for ${sessionDate}`,
            attendance
        });
    } catch (err) {
        console.error('Record attendance error:', err);
        res.status(500).json({ success: false, msg: 'Server error saving attendance' });
    }
});

// GET /attendance/:classroomId/session and /:classroomId/session/:date - Get attendance for a specific date
const handleGetSession = async (req, res) => {
    try {
        const { classroomId, date } = req.params;
        const sessionDate = date || req.query.date || getTodayDateString();

        const attendance = await Attendance.findOne({ classroom: classroomId, date: sessionDate })
            .populate('records.student', 'username email')
            .populate('takenBy', 'username');

        res.json({
            success: true,
            date: sessionDate,
            attendance: attendance || null
        });
    } catch (err) {
        console.error('Fetch session attendance error:', err);
        res.status(500).json({ success: false, msg: 'Server error fetching attendance' });
    }
};

router.get('/:classroomId/session', protect, handleGetSession);
router.get('/:classroomId/session/:date', protect, handleGetSession);

// GET /attendance/:classroomId/history - Teacher view all attendance sessions
router.get('/:classroomId/history', protect, teacherOnly, async (req, res) => {
    try {
        const { classroomId } = req.params;

        const sessions = await Attendance.find({ classroom: classroomId })
            .populate('records.student', 'username email')
            .sort({ date: -1 });

        const historySummary = sessions.map(s => {
            const total = s.records.length;
            const present = s.records.filter(r => r.status === 'Present').length;
            const late = s.records.filter(r => r.status === 'Late').length;
            const absent = s.records.filter(r => r.status === 'Absent').length;
            const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

            return {
                id: s._id,
                date: s.date,
                totalStudents: total,
                presentCount: present,
                lateCount: late,
                absentCount: absent,
                attendanceRate: rate,
                records: s.records
            };
        });

        res.json({
            success: true,
            totalSessions: sessions.length,
            history: historySummary
        });
    } catch (err) {
        console.error('Fetch attendance history error:', err);
        res.status(500).json({ success: false, msg: 'Server error fetching history' });
    }
});

// GET /attendance/:classroomId/my-attendance - Student view own attendance record
router.get('/:classroomId/my-attendance', protect, async (req, res) => {
    try {
        const { classroomId } = req.params;

        // Fetch all attendance sheets for this classroom
        const sessions = await Attendance.find({ classroom: classroomId }).sort({ date: -1 });

        let presentCount = 0;
        let lateCount = 0;
        let absentCount = 0;
        const myLogs = [];

        sessions.forEach(session => {
            const myRecord = session.records.find(
                r => r.student.toString() === req.user.id
            );

            if (myRecord) {
                if (myRecord.status === 'Present') presentCount++;
                else if (myRecord.status === 'Late') lateCount++;
                else if (myRecord.status === 'Absent') absentCount++;

                myLogs.push({
                    date: session.date,
                    status: myRecord.status,
                    remarks: myRecord.remarks || ''
                });
            }
        });

        const totalRecordedClasses = myLogs.length;
        const attendancePercentage = totalRecordedClasses > 0
            ? Math.round(((presentCount + (lateCount * 0.5)) / totalRecordedClasses) * 100)
            : 100;

        res.json({
            success: true,
            totalClasses: totalRecordedClasses,
            present: presentCount,
            late: lateCount,
            absent: absentCount,
            percentage: attendancePercentage,
            logs: myLogs
        });
    } catch (err) {
        console.error('Fetch student attendance error:', err);
        res.status(500).json({ success: false, msg: 'Server error fetching student attendance' });
    }
});

export default router;
