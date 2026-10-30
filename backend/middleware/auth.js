import jwt from 'jsonwebtoken';

export const protect=(req,res,next)=>{
    const token = req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).json({ msg: 'No Token, authorization denied' });
    }

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }
    catch(err){
        res.status(401).json({msg : "Token is not Valid"});
    }
};

export const teacherOnly=(req,res,next)=>{
    if(req.user.role!=='teacher'){
        return res.status(403).json({ msg : "Access Denied: Teacher Only Section"});
    }
    next();
}

