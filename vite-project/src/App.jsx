import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Home from './pages/home/Home';
import Privacy from './pages/home/Privacy';
import Terms from './pages/home/Terms';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import OTPVerification from './pages/auth/OTPVerification';
import ChangePassword from './pages/auth/ChangePassword';

import UpdateProfile from './pages/profile/UpdateProfile';
import ProfileChangePassword from './pages/profile/ProfileChangePassword';

import Dashboard from './pages/dashboard/Dashboard';
import JobsTable from './pages/dashboard/JobsTable';

// Core Styles
import './styles/global.css';
import './styles/layout.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* App Layout for Main Content */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<JobsTable />} />
            <Route path="/profile" element={<UpdateProfile />} />
            <Route path="/update-profile" element={<UpdateProfile />} />
            <Route path="/profile/change-password" element={<ProfileChangePassword />} />
            <Route path="/privacy-policy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Route>

          {/* Auth Layout for Login/Signup Content */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp" element={<OTPVerification />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
