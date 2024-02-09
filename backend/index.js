import express from "express"
import mainRouter from "./routes/index.js"
import cors from "cors"
import dotenv from 'dotenv';
dotenv.config();

const app = express()

const PORT = 3000

app.use(cors())
app.use(express.json())

app.use('/api/v1',mainRouter)
app.listen(PORT,()=>{
    console.log(`Server running on ${process.env.PORT}..`)
})

