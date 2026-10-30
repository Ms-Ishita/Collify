import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

dotenv.config();



import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


import authRoutes from './routes/auth.js';
import classroomRoutes from './routes/classroom.js';
import quizRoutes from './routes/quiz.js';
import attemptRoutes from './routes/attempt.js';
import postRoutes from './routes/Post.js';
import attendanceRoutes from './routes/attendance.js';
// import { protect,teacherOnly } from './middleware/auth.js';
// import Question from './models/Question.js'; 


connectDB();

const app = express();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

app.get('/',(req,res)=>{
    res.send("API Running");
});

// app.post('/api/test-question', async (req, res) => {
//   try {
//     const question = new Question({
//       classroom: '697a00aa6b322431e7e79157',
//       createdBy: '6979f230b53056904e1ff5d4',
//       type: 'mcq',
//       questionText: 'What is 2+2?',
//       options: [
//         { text: '3', isCorrect: false },
//         { text: '4', isCorrect: true },
//         { text: '5', isCorrect: false },
//       ],
//       correctOptionIndex: 1,
//       marks: 2,
//     });
//     await question.save();
//     res.json({ msg: 'Test question created', question });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get('/api/protected',protect,(req,res)=>{
//     res.json({msg:`Hello ${req.user.role}! and your user id is ${req.user.id}`});
// })

app.use('/auth',authRoutes);
app.use('/classroom',classroomRoutes);
app.use('/quizzes',quizRoutes);
app.use('/attempts',attemptRoutes);
app.use('/post',postRoutes);
app.use('/attendance', attendanceRoutes);

app.listen(process.env.PORT, ()=>console.log(`Server on port ${process.env.PORT}`));