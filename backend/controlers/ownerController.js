import imagekit from "../configs/imagekit.js"
import Booking from "../models/Booking.js"
import Car from "../models/Car.js"
import User from "../models/User.js"
import fs from 'fs'


//api to change user role
export const changeRoleToOwner = async (req, res) => {
    try {
        // const { id } = req.user
        const userId = req.userId
        await User.findByIdAndUpdate(userId, { role: "owner" })
        res.json({ success: true, message: "Now you can list cars" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: `changing-owner ${error.message}` })

    }
}

//api to list car
export const addCar = async (req, res) => {
    try {
        const userId = req.userId
        if (!req.file) {
            return res.json({ success: false, message: "Car image is required" })
        }

        let car
        try {
            car = JSON.parse(req.body.carData)
        } catch {
            return res.json({ success: false, message: "Invalid car data" })
        }

        const imageFile = req.file
        const fileBuffer = fs.readFileSync(imageFile.path)

        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/cars"
        })

        const image = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: "1280" },
                { quality: "auto" },
                { format: "webp" }
            ]
        })

        await Car.create({ ...car, owner: userId, image })

        res.json({ success: true, message: "Car Added" })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}



//api to list owner cars

export const getOwnerCars = async (req, res) => {
    try {
        const userId = req.userId
        const cars = await Car.find({ owner: userId })
        res.json({ success: true, cars })



    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//api to toggle car availability

export const toggleCarAvailability = async (req, res) => {
    try {
        const userId = req.userId
        const { carId } = req.body

        const car = await Car.findOne({ _id: carId, owner: userId })

        if (!car) {
            return res.json({ success: false, message: "Unauthorized or car not found" })
        }

        car.isAvailable = !car.isAvailable
        await car.save()

        res.json({ success: true, message: "Availability toggled" })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}



//api to delete a car
export const deleteCar = async (req, res) => {
    try {
        const userId = req.userId
        const { carId } = req.body

        const car = await Car.findOne({ _id: carId, owner: userId })

        if (!car) {
            return res.json({ success: false, message: "Unauthorized or car not found" })
        }

        await car.deleteOne()

        res.json({ success: true, message: "Car removed" })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}


//api to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId)

        if (user.role !== 'owner') {
            return res.json({ success: false, message: "Unauthorized" });
        }

        const cars = await Car.find({ owner: userId })
        const bookings = await Booking.find({ owner: userId })
            .populate('car')
            .sort({ createdAt: -1 })

        const pendingBookings = await Booking.find({ owner: userId, status: "pending" })
        const completedBookings = await Booking.find({ owner: userId, status: "confirmed" })

        //calculate monthlyRevenue from bookings where ststus is confirmed
        const monthlyRevenue = bookings.slice().filter(booking => booking.status === 'confirmed').reduce((acc, booking) => acc + booking.price, 0)

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0, 3),
            monthlyRevenue
        }
        res.json({ success: true, dashboardData })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }

    //api to update user image


}
export const updateUserImage = async (req, res) => {
    try {
        const userId = req.userId
        const imageFile = req.file;

        //upload image to imagekit
        if (!req.file) {
            return res.json({ success: false, message: "Image is required" })
        }

        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        })

        // URL with basic transformations
        const optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: '400' },
                { quality: 'auto' },
                { format: 'webp' }

            ]
        });

        const image = optimizedImageUrl;
        await User.findByIdAndUpdate(userId, { image })
        res.json({ success: true, message: "Image updated" })




    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}



