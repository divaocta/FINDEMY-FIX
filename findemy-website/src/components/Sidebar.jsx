import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarRange,
  CheckSquare,
  Wallet,
  Calendar,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useToast } from './Toast';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      showToast('Berhasil keluar dari sesi.', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Gagal logout, membersihkan data lokal.', 'warning');
    } finally {
      localStorage.removeItem('findemy_token');
      localStorage.removeItem('findemy_user');
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Jadwal', path: '/schedules', icon: <CalendarRange size={20} /> },
    { name: 'Tugas', path: '/tasks', icon: <CheckSquare size={20} /> },
    { name: 'Keuangan', path: '/finance', icon: <Wallet size={20} /> },
    { name: 'Agenda', path: '/calendar', icon: <Calendar size={20} /> },
    { name: 'Profil', path: '/profile', icon: <User size={20} /> },
  ];

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={toggleSidebar}></div>
      )}

      <aside className={`sidebar-container ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/logo.png" alt="FinDemy Logo" className="brand-logo-img" />
            <span className="brand-text">FinDemy</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth <= 992) toggleSidebar();
              }}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <span className="link-icon">{item.icon}</span>
              <span className="link-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-logout-btn">
            <LogOut size={20} />
            <span className="link-text">Keluar Akun</span>
          </button>
        </div>
      </aside>

      <style>{`
        .sidebar-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 998;
          display: none;
        }

        .sidebar-container {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sidebar-width);
          background: var(--bg-secondary);
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          z-index: 999;
          transition: var(--transition-smooth);
        }

        .sidebar-header {
          height: var(--navbar-height);
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-logo-img {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .brand-text {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          letter-spacing: -0.03em;
          color: var(--accent-primary);
        }

        .sidebar-menu {
          flex-grow: 1;
          padding: 1.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow-y: auto;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.85rem 1rem;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          font-weight: 500;
          font-size: 0.95rem;
          transition: var(--transition-smooth);
        }

        .sidebar-link:hover {
          color: var(--text-primary);
          background-color: rgba(255, 255, 255, 0.03);
          transform: translateX(4px);
        }

        .sidebar-link-active {
          color: var(--text-primary);
          background: linear-gradient(90deg, rgba(7, 156, 210, 0.15) 0%, rgba(7, 156, 210, 0.02) 100%);
          border-left: 3px solid var(--accent-primary);
          font-weight: 600;
        }

        .sidebar-link-active:hover {
          transform: none;
        }

        .link-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-footer {
          padding: 1rem 0.75rem;
          border-top: 1px solid var(--glass-border);
        }

        .sidebar-logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.85rem 1rem;
          background: none;
          border: none;
          color: var(--danger);
          border-radius: var(--radius-md);
          font-family: var(--font-family);
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          transition: var(--transition-smooth);
          text-align: left;
        }

        .sidebar-logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.05);
          transform: translateX(4px);
        }

        @media (max-width: 992px) {
          .sidebar-backdrop {
            display: block;
          }

          .sidebar-container {
            transform: translateX(-100%);
          }

          .sidebar-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
