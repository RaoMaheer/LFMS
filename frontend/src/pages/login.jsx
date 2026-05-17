import React, { useState } from 'react';
import { Lock, User, Scale } from 'lucide-react';
import backgroundImage from '../assets/lawbg.jpg';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({  // renamed from credentials/setCredentials
    name: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/law/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
  localStorage.setItem('token', data.token);
  dispatch(setCredentials({ token: data.token, role: data.role, user: data.user }));

  // redirect based on role
  if (data.role === 'admin') {
    navigate('/dashboard', { replace: true });
  } else {
    navigate('/messages', { replace: true }); // lawyers land on messages
  }
} else {
  setError(data.message || 'Invalid credentials');
}
    } catch (err) {
      setError('Backend server is offline');
    }
  };

  return (
    <div className="container-fluid vh-100 p-0 overflow-hidden">
      <div className="row g-0 h-100">

        {/* LEFT SIDE */}
        <div
          className="col-lg-7 d-none d-lg-flex position-relative text-white"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.78), rgba(0,0,0,0.88)), url(${backgroundImage})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#131B2A',
          }}
        >
          <div className="d-flex flex-column justify-content-center px-5 w-100">

            <div className="mb-4">
              <Scale size={90} className="text-warning" />
            </div>

            <h1
              className="fw-bold"
              style={{ fontSize: '5rem', letterSpacing: '2px' }}
            >
              Specter Litt
            </h1>

            <p
              className="text-light mt-3"
              style={{
                maxWidth: '600px',
                fontSize: '1.4rem',
                lineHeight: '1.8',
                color: '#d1d5db',
              }}
            >
              "When you're backed against the wall, break the goddamn thing down."
            </p>

            <div
              className="mt-5 pt-4 border-top border-secondary"
              style={{ maxWidth: '300px' }}
            >
              <p className="text-uppercase small text-secondary fw-bold">
                Elite Legal Management System
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="col-lg-5 col-12 d-flex justify-content-center align-items-center position-relative"
          style={{
            background: 'linear-gradient(135deg, #111827, #1f2937, #000)',
          }}
        >

          {/* Glow Effect */}
          <div
            style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              background: 'rgba(255, 193, 7, 0.08)',
              borderRadius: '50%',
              filter: 'blur(100px)',
              top: '-100px',
              right: '-100px',
            }}
          />

          {/* Login Card */}
          <div
            className="card border-0 shadow-lg p-4"
            style={{
              width: '100%',
              maxWidth: '430px',
              borderRadius: '25px',
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(18px)',
              color: 'white',
              zIndex: 10,
            }}
          >

            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2">Welcome Back</h2>
              <p className="text-light opacity-75">
                Sign in to access the firm dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              {/* Username */}
              <div className="mb-4 position-relative">
                <span
                  className="position-absolute top-50 translate-middle-y text-secondary"
                  style={{ left: '15px', zIndex: 10 }}
                >
                  <User size={20} />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Username"
                  className="form-control bg-dark text-white border-secondary ps-5 py-3"
                  style={{ borderRadius: '12px' }}
                />
              </div>

              {/* Password */}
              <div className="mb-4 position-relative">
                <span
                  className="position-absolute top-50 translate-middle-y text-secondary"
                  style={{ left: '15px', zIndex: 10 }}
                >
                  <Lock size={20} />
                </span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  className="form-control bg-dark text-white border-secondary ps-5 py-3"
                  style={{ borderRadius: '12px' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100 fw-bold py-3"
                style={{
                  borderRadius: '12px',
                  fontSize: '1rem',
                  letterSpacing: '1px',
                }}
              >
                ACCESS PORTAL
              </button>

            </form>

            <p
              className="text-center text-uppercase mt-4 mb-0"
              style={{
                fontSize: '11px',
                letterSpacing: '3px',
                color: '#9ca3af',
              }}
            >
              Authorized Personnel Only
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;