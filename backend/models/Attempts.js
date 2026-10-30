import mongoose from 'mongoose';

const attemptSchema=new mongoose.Schema({
    student: {
        type : mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Quiz',
        required:true,
    },
    answers:[{
        question:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required:true
        },selectedOptionIndex: {
            type:Number,
            required:true,
        },
    }],
    score:{
        type:Number,
        default:0,
    },
    totalMarks:{
        type: Number,
        required: true,
    },
    startedAt: {
        type: Date,
        default:Date.now()
    },
    submittedAt: {
        type: Date,
    },
    isSubmitted: {
        type:Boolean,
        default:false,
    },
    },{timestamps:true});

export default mongoose.model('Attempt',attemptSchema);
