import express from "express";
import "dotenv/config"
import cors from 'cors';
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import cookieParser from "cookie-parser";


//initiitalize express app
const app = express()

//connect database
await connectDB()

//middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())

app.get('/', (req,res)=>{
    res.send('Server running')
})
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))