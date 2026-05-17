import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Users, Briefcase, Calendar,
  CreditCard, Gavel, LogOut, ShieldCheck, Scale,
  MessageSquare, TrendingUp
} from 'lucide-react';
import { logout } from '../store/authSlice';

const ALL_MENU = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/dashboard',    roles: ['admin', 'lawyer'] },
  { name: 'Lawyers',      icon: <ShieldCheck size={20}/>,     path: '/lawyers',      roles: ['admin'] },
  { name: 'Clients',      icon: <Users size={20}/>,           path: '/clients',      roles: ['admin', 'lawyer'] },
  { name: 'Cases',        icon: <Briefcase size={20}/>,       path: '/cases',        roles: ['admin', 'lawyer'] },
  { name: 'Court Dates',  icon: <Gavel size={20}/>,           path: '/court-dates',  roles: ['admin', 'lawyer'] },
  { name: 'Appointments', icon: <Calendar size={20}/>,        path: '/appointments', roles: ['admin', 'lawyer'] },
  { name: 'Payments',     icon: <CreditCard size={20}/>,      path: '/payments',     roles: ['admin'] },
  { name: 'Revenue',   icon: <TrendingUp size={20}/>,      path: '/revperlawyer', roles: ['admin', 'lawyer'] },
  { name: 'Messages', icon: <MessageSquare size={20}/>, path: '/messages', roles: ['lawyer'] }, // ← remove 'admin',
];

const Sidebar = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { role, user } = useSelector((s) => s.auth);

  const menuItems = ALL_MENU.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div
      className="bg-sidebar-navy text-white vh-100 position-fixed d-flex flex-column shadow"
      style={{ width: '260px', zIndex: 1000 }}
    >
      {/* HEADER */}
      <div className="p-4 d-flex align-items-center gap-3 border-bottom border-secondary border-opacity-25">
        <div className="bg-warning p-2 rounded-3 shadow-sm">
          <Scale className="text-dark" size={24} />
        </div>
        <span className="h5 mb-0 fw-bolder tracking-tight text-uppercase">Specter Litt</span>
      </div>

      {/* ROLE BADGE */}
      <div className="px-4 pt-3 pb-1">
        <div
          className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 32, height: 32, background: 'rgba(251,191,36,0.2)' }}
          >
            <span style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 700 }}>
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <div className="small fw-bold text-white" style={{ fontSize: '12px' }}>
              {user?.name || 'User'}
            </div>
            <div
              className="text-uppercase fw-bold"
              style={{ fontSize: '10px', color: '#fbbf24', letterSpacing: '1px' }}
            >
              {role}
            </div>
          </div>
        </div>
      </div>

      {/* MENU */}
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

      {/* LOGOUT */}
      <div className="p-4 border-top border-secondary border-opacity-25 mt-auto">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 rounded-pill py-2 fw-bold"
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