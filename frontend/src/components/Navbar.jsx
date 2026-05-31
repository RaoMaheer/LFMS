import React from 'react';
import { Search, Bell, User, Settings, Sun, Moon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { role, user } = useSelector((s) => s.auth);
  const { isDark, toggleTheme } = useTheme();

  const t = {
    navBg:        isDark ? 'rgba(11,18,32,0.85)'       : 'rgba(255,255,255,0.85)',
    border:       isDark ? 'rgba(255,255,255,0.06)'     : 'rgba(0,0,0,0.08)',
    searchBg:     isDark ? 'rgba(255,255,255,0.05)'     : 'rgba(255,255,255,0.95)',
    searchBorder: isDark ? 'rgba(255,255,255,0.08)'     : 'rgba(0,0,0,0.08)',
    inputColor:   isDark ? 'white'                      : '#1a1a2e',
    placeholderColor: isDark ? 'rgba(255,255,255,0.3)'  : 'rgba(0,0,0,0.35)',
    iconBg:       isDark ? 'rgba(255,255,255,0.06)'     : 'white',
    iconBorder:   isDark ? 'rgba(255,255,255,0.08)'     : 'rgba(0,0,0,0.08)',
    iconColor:    isDark ? 'rgba(255,255,255,0.7)'      : '#444',
    divider:      isDark ? 'rgba(255,255,255,0.1)'      : 'rgba(0,0,0,0.1)',
    nameColor:    isDark ? 'white'                      : '#1a1a2e',
    roleColor:    isDark ? '#fbbf24'                    : '#0d6efd',
    avatarBg:     isDark ? 'rgba(255,255,255,0.08)'     : 'white',
    avatarColor:  isDark ? '#fbbf24'                    : '#0d6efd',
    shadow:       isDark ? '0 8px 30px rgba(0,0,0,0.3)': '0 8px 30px rgba(0,0,0,0.07)',
  };

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top px-4 py-2"
      style={{
        background: t.navBg,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${t.border}`,
        boxShadow: t.shadow,
        transition: 'all 0.3s ease',
        zIndex: 999,
      }}
    >
      <div className="container-fluid gap-3">

        {/* SEARCH */}
        <div className="d-flex align-items-center flex-grow-1" style={{ maxWidth: '420px' }}>
          <div
            className="d-flex align-items-center w-100 px-3 py-2 rounded-pill"
            style={{
              background: t.searchBg,
              border: `1px solid ${t.searchBorder}`,
              transition: 'all 0.3s ease',
            }}
          >
            <Search size={15} style={{ color: t.placeholderColor, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search legal records..."
              className="form-control border-0 shadow-none bg-transparent ms-2 p-0"
              style={{ fontSize: '13px', color: t.inputColor }}
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="d-flex align-items-center gap-2 ms-auto">

          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="d-flex align-items-center justify-content-center rounded-pill px-3 py-2 fw-bold gap-2"
            style={{
              background: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(13,110,253,0.08)',
              border: `1px solid ${isDark ? 'rgba(251,191,36,0.25)' : 'rgba(13,110,253,0.15)'}`,
              color: isDark ? '#fbbf24' : '#0d6efd',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {isDark
              ? <><Sun size={14} /> Light Mode</>
              : <><Moon size={14} /> Dark Mode</>
            }
          </button>

          {/* BELL */}
          <button
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 38, height: 38,
              background: t.iconBg,
              border: `1px solid ${t.iconBorder}`,
              color: t.iconColor,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          >
            <Bell size={16} />
          </button>

          {/* SETTINGS */}
          <button
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 38, height: 38,
              background: t.iconBg,
              border: `1px solid ${t.iconBorder}`,
              color: t.iconColor,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          >
            <Settings size={16} />
          </button>

          {/* DIVIDER */}
          <div style={{ width: '1px', height: '32px', background: t.divider, margin: '0 4px' }} />

          {/* PROFILE */}
          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <div className="fw-bold" style={{ fontSize: '13px', color: t.nameColor, lineHeight: 1.3 }}>
                {user?.name || 'User'}
              </div>
              <div className="fw-bold text-uppercase" style={{ fontSize: '10px', color: t.roleColor, letterSpacing: '1px' }}>
                {role}
              </div>
            </div>
            <div
              className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
              style={{
                width: 38, height: 38,
                background: isDark
                  ? 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.1))'
                  : 'linear-gradient(135deg, #0d6efd, #6610f2)',
                border: `2px solid ${isDark ? 'rgba(251,191,36,0.3)' : 'transparent'}`,
                color: isDark ? '#fbbf24' : 'white',
                fontSize: '14px',
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .form-control::placeholder { color: ${t.placeholderColor}; }
        .form-control:focus { box-shadow: none !important; }
      `}</style>
    </nav>
  );
};

export default Navbar;