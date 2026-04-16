import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaMicrosoft, FaEnvelope } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import axiosClient from "../../helpers/axiosClient";
import "../../styles/auth.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      // ==========================================
      // UPDATED FLOW: STEP 1 - TRIGGER OTP 
      // ==========================================
      // We only send the email to generate and send an OTP.
      const response = await axiosClient.post("/api/auth/route-1", {
        email: formData.email
      });
      console.log(response);
      setErrors({});
      
      // Navigate to the separate OTP Verification page with the signup data
      navigate("/otp", {
        state: {
          type: "signup",
          email: formData.email,
          username: formData.username,
          password: formData.password
        }
      });

    } catch (err) {
      if (err.response) {
        setErrors({ server: err.response.data.message });
      } else {
        setErrors({ server: "Failed to send OTP" });
      }
    }
  };

  const handleSocialSignup = (provider) => {
    console.log(`Signup with ${provider}`);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-subtitle">Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="auth-input"
            />
            {errors.username && (
              <span className="error-text">{errors.username}</span>
            )}
          </div>

          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="auth-input"
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="auth-input"
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="input-group">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="auth-input"
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-group">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span className="checkbox-label">Agree with Terms and Conditions</span>
            </label>
          </div>
          {errors.agreeTerms && (
            <span className="error-text" style={{ marginTop: "-10px", marginBottom: "5px" }}>
              {errors.agreeTerms}
            </span>
          )}

          <button type="submit" className="auth-btn-primary" disabled={!agreeTerms}>
            Signup
          </button>
          
          {errors.server && (
             <span className="error-text" style={{ textAlign: "center" }}>
               {errors.server}
             </span>
          )}
        </form>

        <div className="auth-divider">OR</div>

        <div className="social-buttons-container" style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <button
            type="button"
            className="social-btn"
            style={{ padding: "12px", width: "30%" }}
            onClick={() => handleSocialSignup("Google")}
            title="Signup with Google"
          >
            <FcGoogle size={24} />
          </button>
          
          <button
            type="button"
            className="social-btn"
            style={{ padding: "12px", width: "30%" }}
            onClick={() => handleSocialSignup("Microsoft")}
            title="Signup with Microsoft"
          >
            <FaMicrosoft color="#00a4ef" size={24} />
          </button>

          <button
            type="button"
            className="social-btn"
            style={{ padding: "12px", width: "30%" }}
            onClick={() => handleSocialSignup("Email")}
            title="Signup with Email"
          >
            <FaEnvelope color="#ea4335" size={24} />
          </button>
        </div>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login" className="auth-link">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
