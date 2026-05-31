import { useState } from 'react';
import './App.css';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login        from './pages/login';
import Dashboard    from './pages/dashboard';
import ClientList   from './pages/clients';
import CaseList     from './pages/cases';
import Navbar       from './components/Navbar';
import Sidebar      from './components/Sidebar';
import Lawyers      from './pages/lawyers';
import CourtDates   from './pages/courtDates';
import Payments     from './pages/payments';
import Appointments from './pages/appointments';
import RevPerLawyer from './pages/revperlawyer';
import Messages     from './pages/messages';         // ← NEW
import { ThemeProvider } from './context/ThemeContext';
// ── Guards ───────────────────────────────────────────────────────────────────

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Only renders if user's role is in allowedRoles
const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/messages" replace />;
  return children;
};

// ── Layout ───────────────────────────────────────────────────────────────────

const AdminLayout = ({ children }) => (
  <div className="d-flex">
    <Sidebar />
    <div className="flex-grow-1" style={{ marginLeft: '260px' }}>
      <Navbar />
      <main className="p-0">{children}</main>
    </div>
  </div>
);

// ── App ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* ADMIN ONLY */}
        <Route path="/dashboard" element={
  <RoleRoute allowedRoles={['admin', 'lawyer']}>  {/* ← add lawyer */}
    <AdminLayout><Dashboard /></AdminLayout>
  </RoleRoute>
} />
        <Route path="/lawyers" element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminLayout><Lawyers /></AdminLayout>
          </RoleRoute>
        } />
        <Route path="/payments" element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminLayout><Payments /></AdminLayout>
          </RoleRoute>
        } />
        <Route path="/revperlawyer" element={
  <RoleRoute allowedRoles={['admin', 'lawyer']}>  {/* ← add lawyer */}
    <AdminLayout><RevPerLawyer /></AdminLayout>
  </RoleRoute>
} />

        {/* ADMIN + LAWYER */}
        <Route path="/clients" element={
          <RoleRoute allowedRoles={['admin', 'lawyer']}>
            <AdminLayout><ClientList /></AdminLayout>
          </RoleRoute>
        } />
        <Route path="/cases" element={
          <RoleRoute allowedRoles={['admin', 'lawyer']}>
            <AdminLayout><CaseList /></AdminLayout>
          </RoleRoute>
        } />
        <Route path="/court-dates" element={
          <RoleRoute allowedRoles={['admin', 'lawyer']}>
            <AdminLayout><CourtDates /></AdminLayout>
          </RoleRoute>
        } />
        <Route path="/appointments" element={
          <RoleRoute allowedRoles={['admin', 'lawyer']}>
            <AdminLayout><Appointments /></AdminLayout>
          </RoleRoute>
        } />

        {/* LAWYER ONLY */}
        <Route path="/messages" element={
  <RoleRoute allowedRoles={['lawyer']}>  {/* ← remove 'admin' */}
    <AdminLayout><Messages /></AdminLayout>
  </RoleRoute>
} />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;