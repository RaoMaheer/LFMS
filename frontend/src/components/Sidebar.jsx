import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Users, Briefcase, Calendar,
  CreditCard, Gavel, LogOut, ShieldCheck, Scale,
  MessageSquare, TrendingUp
} from 'lucide-react';
import { logout } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';

const ALL_MENU = [
  { name: 'Dashboard',   icon: <LayoutDashboard size={20}/>, path: '/dashboard',    roles: ['admin', 'lawyer'] },
  { name: 'Lawyers',     icon: <ShieldCheck size={20}/>,     path: '/lawyers',      roles: ['admin'] },
  { name: 'Clients',     icon: <Users size={20}/>,           path: '/clients',      roles: ['admin', 'lawyer'] },
  { name: 'Cases',       icon: <Briefcase size={20}/>,       path: '/cases',        roles: ['admin', 'lawyer'] },
  { name: 'Court Dates', icon: <Gavel size={20}/>,           path: '/court-dates',  roles: ['admin', 'lawyer'] },
  { name: 'Appointments',icon: <Calendar size={20}/>,        path: '/appointments', roles: ['admin', 'lawyer'] },
  { name: 'Payments',    icon: <CreditCard size={20}/>,      path: '/payments',     roles: ['admin'] },
  { name: 'Revenue',     icon: <TrendingUp size={20}/>,      path: '/revperlawyer', roles: ['admin', 'lawyer'] },
  { name: 'Messages',    icon: <MessageSquare size={20}/>,   path: '/messages',     roles: ['lawyer'] },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role, user } = useSelector((s) => s.auth);
  const { isDark } = useTheme();

  const menuItems = ALL_MENU.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const t = {
    bg:           isDark ? '#0b1220'                    : '#ffffff',
    border:       isDark ? 'rgba(255,255,255,0.06)'     : 'rgba(0,0,0,0.08)',
    titleColor:   isDark ? 'white'                      : '#1a1a2e',
    badgeBg:      isDark ? 'rgba(251,191,36,0.08)'      : 'rgba(13,110,253,0.06)',
    badgeBorder:  isDark ? 'rgba(251,191,36,0.15)'      : 'rgba(13,110,253,0.15)',
    avatarBg:     isDark ? 'rgba(251,191,36,0.2)'       : 'rgba(13,110,253,0.1)',
    avatarColor:  isDark ? '#fbbf24'                    : '#0d6efd',
    nameColor:    isDark ? 'white'                      : '#1a1a2e',
    roleColor:    isDark ? '#fbbf24'                    : '#0d6efd',
    inactiveColor:isDark ? 'rgba(255,255,255,0.5)'      : 'rgba(0,0,0,0.45)',
    inactiveHover:isDark ? 'rgba(255,255,255,0.05)'     : 'rgba(0,0,0,0.04)',
    activeBg:     isDark ? '#fbbf24'                    : '#0d6efd',
    activeColor:  isDark ? '#0b1220'                    : 'white',
  };

  return (
    <div
      className="vh-100 position-fixed d-flex flex-column"
      style={{
        width: '260px',
        zIndex: 1000,
        background: t.bg,
        borderRight: `1px solid ${t.border}`,
        transition: 'all 0.3s ease',
      }}
    >
      {/* HEADER */}
      <div className="p-4 d-flex align-items-center gap-3" style={{ borderBottom: `1px solid ${t.border}` }}>
        <div className="p-2 rounded-3 shadow-sm" style={{ background: isDark ? '#fbbf24' : '#0d6efd' }}>
          <Scale style={{ color: isDark ? '#0b1220' : 'white' }} size={22} />
        </div>
        <span className="h5 mb-0 fw-bolder text-uppercase" style={{ color: t.titleColor, letterSpacing: '1px' }}>
          Rao Law Associates
        </span>
      </div>

      {/* ROLE BADGE */}
      <div className="px-4 pt-3 pb-1">
        <div
          className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
          style={{ background: t.badgeBg, border: `1px solid ${t.badgeBorder}` }}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
            style={{ width: 32, height: 32, background: t.avatarBg, color: t.avatarColor, fontSize: '13px' }}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="fw-bold" style={{ fontSize: '12px', color: t.nameColor }}>
              {user?.name || 'User'}
            </div>
            <div className="fw-bold text-uppercase" style={{ fontSize: '10px', color: t.roleColor, letterSpacing: '1px' }}>
              {role}
            </div>
          </div>
        </div>
      </div>

      {/* MENU */}
      <div className="px-3 py-3 flex-grow-1 overflow-y-auto">
        <ul className="nav nav-pills flex-column gap-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name} className="nav-item">
                <Link
                  to={item.path}
                  className="nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3"
                  style={{
                    background:  isActive ? t.activeBg       : 'transparent',
                    color:       isActive ? t.activeColor     : t.inactiveColor,
                    fontWeight:  isActive ? 700               : 500,
                    fontSize:    '13px',
                    transition:  'all 0.2s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = t.inactiveHover; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* LOGOUT */}
      <div className="p-4" style={{ borderTop: `1px solid ${t.border}` }}>
        <button
          onClick={handleLogout}
          className="btn w-100 d-flex align-items-center justify-content-center gap-2 rounded-pill py-2 fw-bold"
          style={{
            fontSize: '13px',
            background: 'rgba(239,68,68,0.1)',
            color: '#f87171',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <style>{`
        .overflow-y-auto { overflow-y: auto; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default Sidebar;