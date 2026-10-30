import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    title : {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    classroom:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
    }],
    totalMarks: {
        type: Number,
        default: 30,
    },
    timeLimitMinutes: {
        type: Number,
        default: 30,
    },
    startTime: {
        type: Date,
    },
    endTime:{
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
},{ timestamps: true });

quizSchema.pre('save', async function(){
    if(this.isModified('questions')){
        const Question = mongoose.model('Question');

        const allQuestionsInQuiz = await Question.find({
            _id : { $in: this.questions }
        });

        let total=0;
        for( const ques of allQuestionsInQuiz ){
            total = total + (ques.marks||1);
        }
        this.totalMarks = total;

    }
});

export default mongoose.model('Quiz',quizSchema);


