import Booking from "../models/Booking.js"
import Car from "../models/Car.js"
import User from "../models/User.js"
import axios from 'axios'
import { getAccessToken } from "./mpesa.js"

///function to check availability of car for a given data
const checkAvailability = async (car, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        car,
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate }
    })
    return bookings.length === 0
}


//api to check availabity of cars for the given daTA
export const checkAvailabilityofCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body
        //fetch all available cars for given location
        const cars = await Car.find({ location, isAvailable: true })
        //check car Availability for given date range using promise
        const availableCarsPromises = cars.map(async (car) => {
            const isAvailable = await checkAvailability(car._id, pickupDate, returnDate)
            return { ...car._doc, isAvailable }
        })

        let availableCars = await Promise.all(availableCarsPromises)
        availableCars = availableCars.filter(car => car.isAvailable === true)
        res.json({ success: true, availableCars })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })

    }
}

//api to create booking
export const createBooking = async (req, res) => {
    try {
        const userId = req.userId
        const { car, pickupDate, returnDate, phoneNumber } = req.body

        const isAvailable = await checkAvailability(car, pickupDate, returnDate)
        if (!isAvailable) {
            return res.json({ success: false, message: "Car is not available" })
        }
        const carData = await Car.findById(car)

        //calculate price based on pickupdate and return date
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);

        if (returned <= picked) {
            return res.json({ success: false, message: "Return date must be after pickup date" })
        }

        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24))
        const price = carData.pricePerDay * noOfDays;

        const booking = await Booking.create({
            car,
            owner: carData.owner,
            user: userId,
            pickupDate,
            returnDate,
            price,
            paymentStatus: "pending"
        })

        //generate access token
        const token = await getAccessToken()

        //timestamp
        const timestamp = new Date()
            .toISOString()
            .replace(/[-T:.Z]/g, "")
            .slice(0, 14)

        const shortcode = process.env.MPESA_SHORTCODE
        const passkey = process.env.MPESA_PASSKEY

        const password = Buffer.from(shortcode + passkey + timestamp).toString("base64")

        //initiate stk push
        const { data } = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: booking.price,
                PartyA: phoneNumber,
                PartyB: shortcode,
                PhoneNumber: phoneNumber,
                CallBackURL: "https://jidrive.vercel.app/api/mpesa/callback",
                AccountReference: booking._id.toString(),
                TransactionDesc: "Car Booking Payment"
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        if (data.ResponseCode !== "0") {
            return res.json({
                success: false,
                message: "STK Push failed",
                error: data
            })
        }

        await Booking.findByIdAndUpdate(booking._id, {
            merchantRequestId: data.MerchantRequestID,
            checkoutRequestId: data.CheckoutRequestID
        })


        res.json({
            success: true,
            message: "Booking created",
            booking,
            mpesa: data
        })


    } catch (error) {
        if (error.response) {
            console.log("STATUS:", error.response.status)
            console.log("DATA:", error.response.data)

            return res.json({
                success: false,
                message: "STK failed",
                error: error.response.data
            })
        }

        console.log(error.message)
    }
}


// api to list user bookings
export const getUserBookings = async (req, res) => {
    try {
        const userId = req.userId
        const booking = await Booking.find({ user: userId })
            .populate("car")
            .sort({ createdAt: -1 })
        res.json({ success: true, booking })


    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

///apii to get owner bookings

export const getOwnerBookings = async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId)
        console.log(user)
        // if(user.role !== 'owner'){
        //     return res.json({success: false, message: "Unauthorized"})
        // }
        const bookings = await Booking.find({ owner: userId }).populate('car user').select("-user.password").sort({ createdAt: -1 })
        res.json({ success: true, bookings })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }

}

//api tochange booking status
export const changeBookingStatus = async (req, res) => {
    try {
        const userId = req.userId
        const { bookingId, status } = req.body
        const booking = await Booking.findById(bookingId)

        if (booking.owner.toString() !== userId.toString()) {
            return res.json({ success: false, message: "Unauthorized" })

        }

        booking.status = status;
        await booking.save();
        res.json({ success: true, message: "Status Updated" })


    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }

}

