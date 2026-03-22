 import axios from 'axios'
 
 //generating access token
        export const getAccessToken = async () => {
            const consumerKey = process.env.MPESA_CONSUMER_KEY
            const consumerSecret = process.env.MPESA_CONSUMER_SECRET
            const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
            const encodedCredentials = Buffer.from(consumerKey+":"+consumerSecret).toString("base64")

            const {data} = await axios.get(url,
                {
                    headers: {
                        Authorization: `Basic ${encodedCredentials}`,
                    }
                }
            )
            return data.access_token
        }
