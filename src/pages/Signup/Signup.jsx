import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../services/api';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone_number: '',
  });

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
      ...prev,
      [name]: value
      };
      return newData;
    });

    setApiError('');

    // Password validation
    if (name === 'password' || name === 'confirmPassword') {
      validatePasswords(name, value);
    }
  };

  const validatePasswords = (fieldName, value) => {
    const newErrors = { ...errors };

    if (fieldName === 'password') {
      if (value.length < 6) {
        newErrors.password = 'Password must be at least 6 characters long';
      } else {
        newErrors.password = '';
      }

      if (formData.confirmPassword && value !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        newErrors.confirmPassword = '';
      }
    }

    if (fieldName === 'confirmPassword') {
      if (value !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        newErrors.confirmPassword = '';
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields are filled
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'address', 'phone_number'];
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      setApiError(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      return;
    }

    if (!errors.password && !errors.confirmPassword) {
      setIsLoading(true);
      setApiError('');

      try {
        // Remove confirmPassword and prepare the registration data
        const { confirmPassword, ...registrationData } = formData;
        // Add name field by combining firstName and lastName
        registrationData.name = `${registrationData.firstName} ${registrationData.lastName}`.trim();
        
        const response = await register(registrationData);
        console.log('Registration successful:', response);
        navigate('/login'); // Redirect to login after successful registration
      } catch (err) {
        if (err.message === 'Request failed with status code 422') {
          setApiError('Email already exists. Please use a different email.');
        } else {
          setApiError(err.message || 'Failed to register. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="signup-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="signup-form-container">
              <h2 className="text-center mb-4">Create an Account</h2>
              {apiError && (
                <div className="alert alert-danger" role="alert">
                  {apiError}
                </div>
              )}
              <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label">
                      First Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${!formData.firstName && apiError ? 'is-invalid' : ''}`}
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${!formData.lastName && apiError ? 'is-invalid' : ''}`}
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address *
                  </label>
                  <input
                    type="email"
                    className={`form-control ${!formData.email && apiError ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password *
                  </label>
                  <input
                    type="password"
                    className={`form-control ${(errors.password || (!formData.password && apiError)) ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      (errors.confirmPassword || (!formData.confirmPassword && apiError)) ? 'is-invalid' : ''
                    }`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">{errors.confirmPassword}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">
                    Address *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${!formData.address && apiError ? 'is-invalid' : ''}`}
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="phone_number" className="form-label">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    className={`form-control ${!formData.phone_number && apiError ? 'is-invalid' : ''}`}
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-success w-100 mb-3"
                  disabled={!!(errors.password || errors.confirmPassword) || isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
                <p className="text-center mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none">
                    Log in here
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>  
      </div>
    </div>
  );
};

export default Signup; 