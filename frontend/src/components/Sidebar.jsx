import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase,
  Calendar, CreditCard, Gavel, LogOut, ShieldCheck, Scale
} from 'lucide-react';
import { useDispatch } from 'react-redux';       // ADD THIS
import { logout } from '../store/authSlice';      // ADD THIS

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();                 // ADD THIS

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/dashboard' },
    { name: 'Lawyers', icon: <ShieldCheck size={20}/>, path: '/lawyers' },
    { name: 'Clients', icon: <Users size={20}/>, path: '/clients' },
    { name: 'Cases', icon: <Briefcase size={20}/>, path: '/cases' },
    { name: 'Court Dates', icon: <Gavel size={20}/>, path: '/court-dates' },
    { name: 'Appointments', icon: <Calendar size={20}/>, path: '/appointments' },
    { name: 'Payments', icon: <CreditCard size={20}/>, path: '/payments' },
  ];

  const handleLogout = () => {
    dispatch(logout());                           // clears Redux state
    localStorage.removeItem('token');             // clears localStorage
    navigate('/login', { replace: true });        // replaces history
  };

  return (
    <div className="bg-sidebar-navy text-white vh-100 position-fixed d-flex flex-column shadow" style={{ width: '260px', zIndex: 1000 }}>
      
      {/* 1. FIXED HEADER */}
      <div className="p-4 d-flex align-items-center gap-3 border-bottom border-secondary border-opacity-25">
        <div className="bg-warning p-2 rounded-3 shadow-sm">
          <Scale className="text-dark" size={24} />
        </div>
        <span className="h5 mb-0 fw-bolder tracking-tight text-uppercase">Specter Litt</span>
      </div>

      {/* 2. SCROLLABLE MENU SECTION */}
      <div className="px-3 py-3 flex-grow-1 overflow-y-auto custom-scrollbar">
        <ul className="nav nav-pills flex-column gap-1">
          {menuItems.map((item) => (
            <li key={item.name} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center gap-3 py-2 px-3 transition-all rounded-3 ${
                  location.pathname === item.path
                    ? 'active bg-warning text-dark fw-bold shadow'
                    : 'text-secondary hover-sidebar-link'
                }`}
              >
                {item.icon}
                <span className="small fw-bold tracking-wide">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. FIXED LOGOUT FOOTER */}
      <div className="p-4 border-top border-secondary border-opacity-25 mt-auto bg-sidebar-navy">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 rounded-pill py-2 fw-bold transition-all"
          style={{ fontSize: '0.85rem' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
};

export default Sidebar;