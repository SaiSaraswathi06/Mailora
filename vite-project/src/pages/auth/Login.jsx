import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaMicrosoft, FaEnvelope } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
// import ForgotPassword from "./ForgotPassword";
import axiosClient from "../../helpers/axiosClient";
import "../../styles/auth.css";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    let newErrors = {};
    if (!identifier) {
      newErrors.identifier = "Username or Email is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      const res = await axiosClient.post("/api/auth/login", {
        email: identifier,
        password
      });
      console.log(res);
      alert("Login successful");
      navigate("/dashboard");
    } catch (err) {
      if (err.response) {
        setErrors({ server: err.response.data.message });
      } else {
        setErrors({ server: "Login failed" });
      }
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Login back into your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Username or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="auth-input"
            />
            {errors.identifier && (
              <span className="error-text">{errors.identifier}</span>
            )}
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <div className="form-options">
            <label className="checkbox-group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-label">Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-btn-primary">
            Login
          </button>
          
          {errors.server && (
            <span className="error-text" style={{ textAlign: "center" }}>
              {errors.server}
            </span>
          )}
        </form>

        <div className="auth-divider">OR</div>

        <div className="social-buttons-container">
          <button
            type="button"
            className="social-btn"
            onClick={() => handleSocialLogin("Google")}
          >
            <FcGoogle />
            <span>Login with Google</span>
          </button>
          
          <button
            type="button"
            className="social-btn"
            onClick={() => handleSocialLogin("Microsoft")}
          >
            <FaMicrosoft color="#00a4ef" />
            <span>Login with Microsoft</span>
          </button>

          <button
            type="button"
            className="social-btn"
            onClick={() => handleSocialLogin("Email")}
          >
            <FaEnvelope color="#ea4335" />
            <span>Login with Email</span>
          </button>
        </div>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/signup" className="auth-link">Signup</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
