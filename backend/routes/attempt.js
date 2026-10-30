import express from 'express';
import Attempt from '../models/Attempts.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Classroom from '../models/Classroom.js';
import { protect, teacherOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/:quizId/start', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate('questions');
        if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

        const existing = await Attempt.findOne({
            student: req.user.id,
            quiz: quiz._id,
            isSubmitted: true,
        });
        if (existing) return res.status(400).json({ msg: 'Already submitted this quiz' });

        const attempt = new Attempt({
            student: req.user.id,
            quiz: quiz._id,
            totalMarks: quiz.totalMarks,
        });

        await attempt.save();

        const safeQuestions = quiz.questions.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            option: q.options.map(opt => ({ text: opt.text })),
            marks: q.marks,
        }));

        res.json({
            attemptId: attempt._id,
            quizTitle: quiz.title,
            questions: safeQuestions,
            timeLimitMinutes: quiz.timeLimitMinutes,
        });

    } catch (err) {
        console.error('Start quiz error:', err);
        res.status(500).json({ msg: 'Server error starting quiz' });
    }
});

router.post('/:attemptId/submit', protect, async (req, res) => {
    try {
        const { answers } = req.body;

        const attempt = await Attempt.findById(req.params.attemptId);
        if (!attempt) return res.status(404).json({ msg: 'Attempt not found' });

        if (attempt.student.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not your attempt' });
        }

        if (attempt.isSubmitted) {
            return res.status(400).json({ msg: 'Already Submitted' });
        }

        const questionIds = (answers || []).map(a => a.question);
        const questions = await Question.find({ _id: { $in: questionIds } });

        let score = 0;
        (answers || []).forEach(ans => {
            const q = questions.find(qq => qq._id.toString() === ans.question.toString());
            if (q && q.correctOptionIndex === ans.selectedOptionIndex) {
                score += q.marks || 1;
            }
        });

        attempt.answers = (answers || []).map(a => ({
            question: a.question,
            selectedOptionIndex: a.selectedOptionIndex
        }));

        attempt.score = score;
        attempt.submittedAt = new Date();
        attempt.isSubmitted = true;

        await attempt.save();
        res.json({
            msg: 'Quiz submitted successfully',
            score,
            totalMarks: attempt.totalMarks,
        });
    } catch (err) {
        console.error('Submit quiz error:', err);
        res.status(500).json({ msg: 'Server error submitting quiz' });
    }
});

// GET /attempts/quiz/:quizId/all - Teacher view all results for a quiz (Leaderboard & Class stats)
router.get('/quiz/:quizId/all', protect, teacherOnly, async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        const classroom = await Classroom.findById(quiz.classroom);
        const isCreator = quiz.createdBy && quiz.createdBy.toString() === req.user.id;
        const isTeacherOfClass = classroom && classroom.teacher.toString() === req.user.id;

        if (!isCreator && !isTeacherOfClass) {
            return res.status(403).json({ msg: 'Not authorized to view results for this quiz' });
        }

        const attempts = await Attempt.find({ quiz: quizId, isSubmitted: true })
            .populate('student', 'username email')
            .populate({
                path: 'answers.question',
                select: 'questionText options correctOptionIndex marks'
            })
            .sort({ score: -1, submittedAt: 1 });

        res.json({
            success: true,
            attempts,
            quizTitle: quiz.title,
            quizDescription: quiz.description,
            totalMarks: quiz.totalMarks,
            classroomId: quiz.classroom
        });
    } catch (err) {
        console.error('Teacher fetch all attempts error:', err);
        res.status(500).json({ msg: 'Server error fetching quiz results' });
    }
});

// GET /attempts/:quizId/my-result - Student view own quiz result
router.get('/:quizId/my-result', protect, async (req, res) => {
    try {
        const { quizId } = req.params;
        const attempt = await Attempt.findOne({
            student: req.user.id,
            quiz: quizId,
            isSubmitted: true
        })
        .populate('quiz', 'title totalMarks timeLimitMinutes classroom')
        .populate({
            path: 'answers.question',
            select: 'questionText options correctOptionIndex marks explanation'
        })
        .sort({ submittedAt: -1 });

        if (!attempt) {
            return res.status(404).json({ msg: 'No submitted attempt found for this quiz' });
        }

        res.json({
            success: true,
            attempt
        });
    } catch (err) {
        console.error('Student fetch my-result error:', err);
        res.status(500).json({ msg: 'Server error fetching your result' });
    }
});

export default router;
