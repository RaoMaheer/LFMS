import React from 'react';
import { Search, Bell, User, Settings } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';


const Navbar = () => {
  const { role, user } = useSelector((s) => s.auth);
  return (
    <nav
      className="navbar navbar-expand-lg sticky-top px-4 py-3"
      style={{
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
      }}
    >
      <div className="container-fluid">

        {/* 🔍 Search */}
        <div className="d-flex align-items-center w-50">
          <div
            className="d-flex align-items-center w-100 px-3 py-2 rounded-pill"
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              transition: '0.3s ease',
            }}
          >
            <Search size={18} className="text-muted me-2" />
            <input
              type="text"
              placeholder="Search legal records..."
              className="form-control border-0 shadow-none bg-transparent"
              style={{ fontSize: '0.95rem' }}
            />
          </div>
        </div>

        {/* ⚡ Actions */}
        <div className="d-flex align-items-center gap-3">

          {/* Bell */}
          <div className="icon-btn">
            <Bell size={18} />
          </div>

          {/* Settings */}
          <div className="icon-btn">
            <Settings size={18} />
          </div>

          {/* Profile */}
          <div className="d-flex align-items-center gap-3 ms-3 ps-3 border-start">

            <div className="text-end d-none d-sm-block">
              <p className="mb-0 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                {user?.name || 'Dexter Morgan'}
              </p>
              <p className="mb-0 text-primary" style={{ fontSize: '0.75rem' }}>
                {role.toUpperCase() || 'LAWYER'}
              </p>
            </div>

            <div className="profile-ring">
              <div className="avatar">
                <User size={18} />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 🔥 Styles */}
      <style>{`
        .icon-btn {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: white;
          border: 1px solid rgba(0,0,0,0.08);
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .icon-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(0,0,0,0.12);
          color: #0d6efd;
        }

        .profile-ring {
          padding: 2px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0d6efd, #6610f2);
        }

        .avatar {
          width: 38px;
          height: 38px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0d6efd;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;