import React,{useState,useEffect} from "react"
import OTPInput from "../../components/OTPInput"
import {useNavigate, useLocation} from "react-router-dom"
import "../../styles/auth-flow.css"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import axiosClient from "../../helpers/axiosClient"

export default function OTPVerification(){

const[otp,setOtp]=useState(["","","","","",""])
const[timer,setTimer]=useState(30)
const [isClosing, setIsClosing] = useState(false)

const navigate = useNavigate()
const location = useLocation()

/* email received from forgot password or signup page */
const email = location.state?.email
const type = location.state?.type // "signup" or undefined
const signupData = location.state

useEffect(()=>{
if(!email){
// navigate("/login") // Disabled for testing route directly // Unified safe fallback
}
},[])

useEffect(()=>{

if(timer <= 0) return

const interval = setInterval(()=>{
setTimer(prev => prev - 1)
},1000)

return ()=> clearInterval(interval)

},[timer])

const handleVerify = async () => {

const code = otp.join("")

try{
  if (type === "signup") {
    // ==========================================
    // SIGNUP FLOW: VERIFY OTP AND COMPLETE SIGNUP
    // ==========================================
    const verifyResponse = await axiosClient.post("/api/auth/verify-route", {
      email,
      otp: code
    });
    
    // If successful, send the full data to the backend
    const signupResponse = await axiosClient.post("/api/auth/signup", {
      email: email,
      password: signupData.password,
      name: signupData.username
    });
    
    toast.success("Signup successful")
    setIsClosing(true)
    setTimeout(()=>{
      // navigate("/login") // Disabled for testing route directly
    },450)

  } else {
    // ==========================================
    // FORGOT PASSWORD FLOW
    // ==========================================
    const response = await axiosClient.post("/auth/verify-otp",{
      email,
      otp: code
    })
    
    const res = response.data
    
    if(res.success){
      toast.success("OTP verified")
      setIsClosing(true)
      setTimeout(()=>{
        navigate("/change-password",{ state:{ email } })
      },450)
    }else{
      toast.error("Invalid OTP")
    }
  }
}catch(err){
  if (err.response) {
    toast.error(err.response.data.message || "Verification failed")
  } else {
    toast.error("Server error")
  }
}

}

return (

<div className="auth-container">

<div className="auth-left">
<img src="/otp-illustration.png" alt="otp illustration"/>
</div>

<motion.div
className="otp-panel"
initial={{ x: "100%" }}
animate={{ x: isClosing ? "100%" : "0%" }}
transition={{ duration: 0.45 }}
>

<h2 className="auth-title">Enter OTP</h2>

<p className="otp-text">
We have sent a verification code
</p>

<OTPInput otp={otp} setOtp={setOtp}/>

<button className="auth-btn" onClick={handleVerify}>
Verify
</button>

<p className="resend">
{timer>0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
</p>

</motion.div>

</div>

)
}
