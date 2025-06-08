import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Contact from './pages/Contact/Contact';
import Equipment from './pages/Equipment/Equipment';
import HowItWorks from './pages/HowItWorks/HowItWorks';
import UserDashboard from './pages/Dashboard/UserDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import UsersManagement from './pages/Admin/UsersManagement';
import EquipmentManagement from './pages/Admin/EquipmentManagement';
import Settings from './pages/Settings/Settings';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AdminRoute from './components/ProtectedRoute/AdminRoute';
import { isAdmin } from './services/api';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            {/* Public routes that are always accessible */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/equipment" element={<Equipment />} />
            
            {/* Auth routes - redirect to dashboard if already logged in */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Register />
                )
              }
            />

            {/* Protected routes - require authentication */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {isAdmin() ? <AdminDashboard /> : <UserDashboard />}
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin routes */}
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UsersManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/equipment"
              element={
                <AdminRoute>
                  <EquipmentManagement />
                </AdminRoute>
              }
            />

            {/* Catch-all route - redirect to home if not found */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
};

export default App; 