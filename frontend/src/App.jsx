import { useState } from 'react'
import './App.css'
import './index.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import ClientList from './pages/clients';
import CaseList from './pages/cases';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Lawyers from './pages/lawyers';
import CourtDates from './pages/courtDates';
import Payments from './pages/payments';
import Appointments from './pages/appointments';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminLayout = ({ children }) => (
  <div className="d-flex">
    <Sidebar />
    <div className="flex-grow-1" style={{ marginLeft: '260px' }}>
      <Navbar />
      <main className="p-0">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AdminLayout><Dashboard /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/clients" element={
          <ProtectedRoute>
            <AdminLayout><ClientList /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/lawyers" element={
          <ProtectedRoute>
            <AdminLayout><Lawyers /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/cases" element={
          <ProtectedRoute>
            <AdminLayout><CaseList /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/payments" element={
          <ProtectedRoute>
            <AdminLayout><Payments /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/court-dates" element={
          <ProtectedRoute>
            <AdminLayout><CourtDates /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/appointments" element={
          <ProtectedRoute>
            <AdminLayout><Appointments /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;