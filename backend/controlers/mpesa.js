import axios from 'axios'
import Booking from '../models/Booking.js'

//generating access token
export const getAccessToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET
    const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    const encodedCredentials = Buffer.from(consumerKey + ":" + consumerSecret).toString("base64")

    const { data } = await axios.get(url,
        {
            headers: {
                Authorization: `Basic ${encodedCredentials}`,
            }
        }
    )
    return data.access_token
}
//mpesa call back
export const mpesaCallback = async (req, res) => {
    try {
        const callback = req.body.Body.stkCallback
        console.log("MPESA CALLBACK:", callback)

        const checkoutId = callback.CheckoutRequestID

        const booking = await Booking.findOne({ checkoutRequestId: checkoutId })

        if (!booking) {
            console.log("Booking not found")
            return res.json({ success: false })
        }

        if (callback.ResultCode === 0) {
            const metadata = callback.callbackMetadata.Item

            let receipt, amount, transactionDate, phone

            metadata.forEach(item => {
                if (item.Name === "MpesaReceiptNumber") receipt = item.Value
                if (item.Name === "Amount") amount = item.Value
                if (item.Name === "TransactionDate") transactionDate = item.Value
                if (item.Name === "PhoneNumber") phone = item.Value
            })

            booking.paymentStatus = 'paid'
            booking.status = 'confirmed'
            booking.transactionId = receipt

            await booking.save()

        }else{
            booking.paymentStatus = 'failed'
            await booking.save()
        }

    } catch (error) {
        console.log(error.message)
        res.json({ success: false })
    }
}
