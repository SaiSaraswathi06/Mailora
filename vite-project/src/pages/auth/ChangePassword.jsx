import React,{useState} from "react"
import PasswordInput from "../../components/PasswordInput"
import PasswordStrength from "../../components/PasswordStrength"
import axiosClient from "../../helpers/axiosClient";
import toast from "react-hot-toast"
import "../../styles/auth-flow.css"
import { useNavigate, useLocation } from "react-router-dom"
// import axiosClient from "../../helpers/axiosClient";
export default function ChangePassword(){

const[newPass,setNewPass]=useState("")
const[confirmPass,setConfirmPass]=useState("")

const navigate = useNavigate()
const location = useLocation()

/* email coming from OTP page */
const email = location.state?.email
if(!email){
navigate("/forgot-password")
}

const handleSubmit = async () => {

if(newPass !== confirmPass){

toast.error("Passwords do not match")
return

}

const res = await axiosClient.post("/api/auth/reset-password",{
  email,
  newPassword:newPass
})


if(res.data.success){

toast.success("Password reset successful 🎉")

setTimeout(()=>{
navigate("/login")
},1500)

}else{

toast.error("Something went wrong")

}

}

return(

<div className="auth-container">

<div className="auth-card">

<h2 className="auth-title">Change Password</h2>

<PasswordInput
placeholder="New Password"
value={newPass}
onChange={(e)=>setNewPass(e.target.value)}
/>

<PasswordStrength password={newPass}/>

<PasswordInput
placeholder="Confirm Password"
value={confirmPass}
onChange={(e)=>setConfirmPass(e.target.value)}
/>

<button className="auth-btn" onClick={handleSubmit}>
Reset Password
</button>

</div>

</div>

)

}
