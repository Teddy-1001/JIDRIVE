import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Car from "../models/Car.js";

//generate jwt token
const generateToken = (userId) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET)
}

//register user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password || password.length < 8) {
            return res.json({ success: false, message: 'Fill all the details' })
        }
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.json({ success: false, message: 'User already exist' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, password: hashedPassword })

        const token = generateToken(user._id.toString())
        res.cookie("token", token, {
            secure: false,
            httpOnly: true,
            sameSite: "Lax",
            maxAge: 7*24*60*60*1000
        })
        res.json({ success: true})


    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//login user
export const loginUser = async (req, res)=> {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" })
        }
        const token = generateToken(user._id.toString())
         res.cookie("token", token, {
            secure: false,
            httpOnly: true,
            sameSite: "Lax",
            maxAge: 7*24*60*60*1000
        })
        res.json({ success: true})

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password")
        console.log("User ID", req.userId)
        res.json({
            success: true,
            user
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

//get user data using token
export const getUserData = async(req,res)=>{
    try {
        const {user} = req;
        res.json({success: true, user})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
        
    }
}

//get all cars for the frontend
export const getCars = async (req,res)=>{
    try {
        const cars = await Car.find({isAvailable: true})
        res.json({success: true, cars})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "Lax"
        })

        res.json({ success: true, message: "Logged out successfully" })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}