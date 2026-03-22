import express from "express"
import { getCars, getMe, getUserData, loginUser, logout, registerUser } from "../controlers/UserController.js"
import { protect } from "../middleware/Auth.js"

const userRouter = express.Router()

userRouter.post('/signup', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/logout', logout)
userRouter.get('/data', protect, getUserData)
userRouter.get('/cars', getCars)
userRouter.get('/me', protect, getMe)



export default userRouter