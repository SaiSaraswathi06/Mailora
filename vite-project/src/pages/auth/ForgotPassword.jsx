
import React,{useState} from "react"
import {useNavigate} from "react-router-dom"
import "../../styles/auth-flow.css"
import {motion} from "framer-motion"
import axiosClient from "../../helpers/axiosClient"
import toast from "react-hot-toast"

export default function ForgotPassword(){

const[email,setEmail]=useState("")
const [loading,setLoading] = useState(false)
const[msg,setMsg]=useState("")
const navigate=useNavigate()

const handleSubmit=async()=>{

setLoading(true)

const response = await axiosClient.post("/auth/send-otp",{email})

const res = response.data

setLoading(false)

if(res.success){
toast.success("OTP sent to your email")
setTimeout(()=>navigate("/otp", { state: { email } }),1200)
}else{
setMsg("Email not found")
}

}

return(
<div className="auth-container">

<motion.div
className="auth-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
>

<h2 className="auth-title">Forgot Password</h2>

<input
className="auth-input"
placeholder="Enter Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<button
className="auth-btn"
onClick={handleSubmit}
disabled={loading}
>
{loading ? "Sending..." : "Send OTP"}
</button>

<p className="msg">{msg}</p>

</motion.div>

</div>
)
}
