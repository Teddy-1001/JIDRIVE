import React from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Login = () => {

  const {setShowLogin, axios, setToken, navigate, fetchUser} = useAppContext()
  const [state, setState] = React.useState("login")

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()
      const {name, email, password} = formData
      const { data } = await axios.post(`/api/user/${state}`, {name, email, password})
      if(data.success){
          navigate('/')
          // setToken(data.token)
          // localStorage.setItem('token', data.token)
          setShowLogin(false)
          await fetchUser()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    
    // TODO: handle login/signup logic here
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div 
      onClick={() => setShowLogin(false)} 
      className='fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center justify-center text-sm text-gray-600 bg-black/50'
    >
      <form 
        onClick={(e) => e.stopPropagation()} 
        onSubmit={handleSubmit} 
        className="sm:w-[350px] w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white"
      >
        <h1 className="text-gray-900 text-3xl mt-10 font-medium">
          {state === "login" ? "Login" : "Sign up"}
        </h1>
        <p className="text-gray-500 text-sm mt-2">Please sign in to continue</p>

        {state !== "login" && (
          <div className="flex items-center mt-6 w-full border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <input 
              type="text" 
              name="name" 
              placeholder="Name" 
              className="border-none outline-none ring-0 flex-1" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
        )}

        <div className="flex items-center w-full mt-4 border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <input 
            type="email" 
            name="email" 
            placeholder="Email id" 
            className="border-none outline-none ring-0 flex-1" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="flex items-center mt-4 w-full border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            className="border-none outline-none ring-0 flex-1" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="mt-4 text-left text-indigo-500">
          <button className="text-sm" type="button">Forget password?</button>
        </div>

        <button 
          type="submit" 
          className="mt-2 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity"
        >
          {state === "login" ? "Login" : "Sign up"}
        </button>

        <p 
          onClick={() => setState(prev => prev === "login" ? "signup" : "login")} 
          className="text-gray-500 text-sm mt-3 mb-11 cursor-pointer"
        >
          {state === "login" ? "Don't have an account?" : "Already have an account?"} 
          <span className="text-indigo-500 hover:underline"> click here</span>
        </p>
      </form>
    </div>
  )
}

export default Login