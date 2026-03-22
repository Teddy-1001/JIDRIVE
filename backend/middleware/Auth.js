import jwt from 'jsonwebtoken'
import User from '../models/User.js';

export const protect = async (req, res, next) => {

    try {
        const token = req.cookies.token;
        if (!token) {
            return res.json({ success: false, message: 'Not authorized' })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.id

        next()
    } catch (error) {
        return res.json({ success: false, message: 'Not authorized' })
    }

}