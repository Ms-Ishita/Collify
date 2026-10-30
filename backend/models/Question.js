import mongoose from 'mongoose';

const questionSchema=new mongoose.Schema({
    classroom:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true,
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type:{
        type: String,
        enum: ['mcq','coding'],
        required: true,
    },
    questionText: {
        type: String,
        required: true,
        trim :true,
    },
    options:[{
        text: { type: String,required: true },
        isCorrect: {type: Boolean,default: false }, 
    }],
    correctOptionIndex:{
        type:Number,
        min:0,
        max:3,
    },
    marks:{
        type:Number,
        default: 1,
        min: 1,
    },
    testCases: [{
        input: String,
        expectedOutput: String,
        isHidden: {type: Boolean, default: true},
    }],
},{timestamps:true});

export default mongoose.model('Question',questionSchema);