import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";


axios.defaults.baseURL = import.meta.env.VITE_BASE_URL
axios.defaults.withCredentials = true

 export const AppContext = createContext();
 export const AppProvider = ({ children })=>{
    const navigate = useNavigate()
    const currency = import.meta.env.VITE_CURRENCY
    // const [token, setToken] = useState(null)
    const [user, setUser ] = useState(null)
    const [isOwner, setIsOwner ] = useState(false)
    const [showLogin, setShowLogin ] = useState(null)
    const [pickupDate, setPickupDate ] = useState('')
    const [returnupDate, setReturnDate ] = useState('')

    const [cars, setCars ] = useState([])
    const [ownerRefresh, setOwnerRefresh] = useState(0)
    const [dashboardData, setDashboardData] = useState({
        totalCars: 0,
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        recentBookings: [],
        monthlyRevenue: 0,
    })

    const fetchDashboardData = async () =>{
        try{
            const { data } = await axios.get('/api/owner/dashboard')
            if (data.success){
                setDashboardData(data.dashboardData)
            } else {
                toast.error(data.message)
            }
        }catch(error){
            toast.error(error.message)
        }
    }
    //function to check if user is logged in
    const fetchUser = async ()=>{
        try {
            const {data} = await axios.get('/api/user/me')
            console.log(data)
            if (data.success){
                setUser(data.user)
                // setIsOwner(data.user.role === 'owner')

            }
            else{
                setUser(null)
                navigate('/')
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    //function to fetch all cars from server
    const fetchCars = async () =>{
        try {
            const {data} = await axios.get('/api/user/cars')
            data.success ? setCars(data.cars) : toast.error(data.message)
        } catch (error) {
             toast.error(error.message)   
        }
    }

    //function to log out user
    const logout = async ()=>{
       try {
        const {data} = await axios.post('/api/user/logout')
        if(data.success){
            setUser(null)
         setIsOwner(false)
         toast.success('You have been loged out')
         navigate('/')
        }else{
            toast.error(data.message)
        }
         
       } catch (error) {
        toast.error(error.message)
       }
    }

    //use effect to retrieve token from local storage
    useEffect(()=>{
       fetchUser()
       
    },[])

    useEffect(()=>{
        fetchCars()
    },[])

    useEffect(()=>{
        if (isOwner) {
            fetchDashboardData()
        }
    },[isOwner, ownerRefresh])

    //use effect to fetch user data when token is available
     


    const value = {
        navigate, currency, axios, user, 
        setUser, isOwner, 
        setIsOwner,fetchUser, showLogin, 
        setShowLogin, logout, fetchCars, 
        cars, setCars, pickupDate, setPickupDate, 
        returnupDate, setReturnDate, ownerRefresh, 
        setOwnerRefresh, dashboardData, fetchDashboardData
    }

    return <AppContext.Provider value={value}>
        { children }
    </AppContext.Provider>
 }

 export const useAppContext = ()=>{
    return useContext(AppContext)
 }