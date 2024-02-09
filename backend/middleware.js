
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from './config.js';

const authMiddleware = (req,res,next)=>{
    const authHeader = req.headers.authorization
    // console.log(authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(403).json({});
    }

    const token = authHeader.split(' ')[1];
    // console.log(token);

    try{

        const decoded = jwt.verify(token,JWT_SECRET)
        req.userId = decoded.userId
        // console.log(req.userId);
        next()

    }catch(err){
        return res.status(403).json({});
    }

}

export default authMiddleware