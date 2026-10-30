import express from 'express';
import Classroom from '../models/Classroom.js';
import { protect,teacherOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/get',protect,async(req,res)=>{
    try{
        let classroom;
        if(req.user.role==='teacher'){
            classroom=await Classroom.find({ teacher:req.user.id}).populate('students','username email').sort({createdAt: -1});
        }
        else{
            classroom=await Classroom.find({ students: req.user.id }).populate('teacher','username email').sort({createdAt: -1});
        }
        res.json({
            success: true,
            role: req.user.role,
            classroom
        });
    }catch(error){
        console.log('Error fetching classrooms: ',error);
        res.status(500).json({
            success:false,
            msg:"Server error"
        });
    }
})

router.get('/:id',protect,async(req,res)=>{
    const classRoomId = req.params.id;
    try{
        const classroom = await Classroom.findById(classRoomId).populate('teacher','username email').populate('students','username email');
        if(!classroom){
            return res.status(404).json({
                msg:"Classroom not Found",
            });
        }
        const isTeacher = classroom.teacher._id.toString()===req.user.id;
        const isStudent = classroom.students.some(s=>s._id.toString()=== req.user.id);
        if(!isTeacher&&!isStudent){
            return res.status(403).json({msg:'Not Authorized to view this Classroom '});
        }

        return res.json({
            success:true,
            classroom,
            role:isTeacher?'teacher':'student'
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            msg:"Server Error",
        })
    }
})

router.post('/create',protect,teacherOnly,async (req,res)=>{
    try{
        const { name } = req.body;

        const classroom=new Classroom({
            name,
            teacher:req.user.id,
        });

        await classroom.save();

        res.status(201).json({
            msg:"Classroom Created",
            classroom: {
                id : classroom._id,
                name : classroom.name,
                joinCode : classroom.joinCode,
            },
        });
    }catch(err){
        console.log(err);
        res.status(500).json({msg:"Server error"});
    }
});

router.post('/join',protect,async(req,res)=>{
    try{
        const { joinCode } = req.body;

        const classroom = await Classroom.findOne( { joinCode } );
        
        if(!classroom){
            return res.status(404).json({msg: "Invalid Join Code"});
        }

        if(classroom.students.includes(req.user.id)){
            return res.status(400).json({ msg : " User Already Enrolled "});
        }

        classroom.students.push(req.user.id);
        await classroom.save();

        res.json({msg : "Joined Classroom Successfully!!",classroom:{id:classroom._id,name:classroom.name,joinCode:classroom.joinCode}});
    }catch(err){
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE /:id - delete classroom (teacher only)
router.delete('/:id', protect, teacherOnly, async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ msg: 'Classroom not found' });
        }

        if (classroom.teacher.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to delete this classroom' });
        }

        await Classroom.findByIdAndDelete(req.params.id);

        res.json({ success: true, msg: 'Classroom deleted' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

export default router;
