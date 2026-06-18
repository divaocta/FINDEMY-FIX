import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Page Imports
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import SchedulePage from './pages/SchedulePage';
import TasksPage from './pages/TasksPage';
import FinancePage from './pages/FinancePage';
import CalendarPage from './pages/CalendarPage';
import ProfilePage from './pages/ProfilePage';

// Layout wrapper for authenticated routes
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Determine page title based on path
  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard':
        return 'Dashboard Ringkasan';
      case '/schedules':
        return 'Jadwal';
      case '/tasks':
        return 'Tugas';
      case '/finance':
        return 'Keuangan';
      case '/calendar':
        return 'Agenda';
      case '/profile':
        return 'Profil';
      default:
        return 'FinDemy';
    }
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Navbar toggleSidebar={toggleSidebar} pageTitle={getPageTitle(location.pathname)} />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/schedules" element={<SchedulePage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
