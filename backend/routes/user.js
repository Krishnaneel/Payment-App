import express from 'express'
import zod, { intersection } from 'zod'
import { User,Account } from '../db.js'
import { JWT_SECRET } from '../config.js';
import authMiddleware from '../middleware.js'
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/signup',async (req,res)=>{

    const signupBody = zod.object({
        username: zod.string(),
        password: zod.string(),
        firstName: zod.string(),
        lastName: zod.string()
    })
      
    const { success } = signupBody.safeParse(req.body)

    if(!success){
        res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if(existingUser){
        res.status(411).json({
            message: "Username already taken"
        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    })

    const userId = user._id

    await Account.create({
        userId,
        balance: 1+Math.random()*10000  
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.status(200).json({
        message: "User created successfully",
        token: token
    })

})


router.post('/signin',async (req,res)=>{

    const signinBody = zod.object({
        username: zod.string(),
        password: zod.string()
    })

    const { success } = signinBody.safeParse(req.body)

    if(!success){
        res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const user =  await User.findOne({
        username: req.body.username
    })

    if(!user){
        res.status(411).json({
            message: "User doesn't exists"
        })
    }

    if(user.password===req.body.password){
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
  
        res.status(200).json({
            token: token
        })
    }else{
        res.status(411).json({
            message: "Error while logging-in"
        })
    }

})

router.put('/',authMiddleware,async (req,res)=>{
    const updateBody = zod.object({
        password: zod.string().min(0),
        firstName: zod.string().min(0),
        lastName: zod.string().min(0)
    })

    const { success } = updateBody.safeParse(req.body)

    if(!success){
        res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    await User.updateOne({ _id: req.userId }, { $set: req.body });

    res.status(200).json({
        message: "Update successfully"
    })
})

router.get('/bulk',async(req,res)=>{

    const search = req.query.filter || ""

    const users = await User.find({
        $or: [{
            firstName: {
               "$regex": search
            }
        },{
            lastName:{
                "$regex": search
            }
        }]
    })

    res.json({
        user: users.map(user=>({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})



export default router
