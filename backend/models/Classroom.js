import mongoose from "mongoose";
import { nanoid } from "nanoid";
const generateJoinCode = ()=>{
    // return Math.random().toString(36).split(2,8).toUpperCase(); 
    // It can rearely but generate same joinCode so used a external library that gives unique id Everytime
    return nanoid(6).toUpperCase();
}

const classroomSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    teacher:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
    },
    students:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }],
    joinCode:{
        type:String,
        unique: true,
        default: generateJoinCode,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('Classroom',classroomSchema);
