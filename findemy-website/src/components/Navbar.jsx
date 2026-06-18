import React, { useState, useEffect, useRef } from 'react';
import { Menu, User, Bell, Calendar, CheckSquare, Clock, X } from 'lucide-react';
import api from '../services/api';

const Navbar = ({ toggleSidebar, pageTitle }) => {
  const userString = localStorage.getItem('findemy_user');
  let user = { name: 'User', email: '' };
  if (userString) {
    try { user = JSON.parse(userString); } catch (e) { }
  }

  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 10) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [jadwalRes, tugasRes, eventRes] = await Promise.all([
        api.get('/jadwal').catch(() => ({ data: { data: [] } })),
        api.get('/tugas').catch(() => ({ data: { data: [] } })),
        api.get('/event').catch(() => ({ data: { data: [] } })),
      ]);

      const jadwalNotifs = (jadwalRes.data.data || [])
        .filter(j => j.pasang_pengingat == 1 || j.pasang_pengingat === true)
        .map(j => ({
          id: `jadwal-${j.id}`,
          type: 'jadwal',
          title: j.mata_kuliah,
          detail: `${j.hari} • ${j.jam_mulai} - ${j.jam_selesai}`,
          sub: j.ruangan,
        }));

      const tugasNotifs = (tugasRes.data.data || [])
        .filter(t => (t.pasang_pengingat == 1 || t.pasang_pengingat === true) && t.status !== 'selesai')
        .map(t => ({
          id: `tugas-${t.id}`,
          type: 'tugas',
          title: t.judul,
          detail: `Deadline: ${t.deadline}`,
          sub: t.deskripsi,
        }));

      const eventNotifs = (eventRes.data.data || [])
        .filter(e => e.pasang_pengingat == 1 || e.pasang_pengingat === true)
        .map(e => ({
          id: `event-${e.id}`,
          type: 'event',
          title: e.judul,
          detail: `${e.tanggal_mulai} s.d. ${e.tanggal_selesai}`,
          sub: '',
        }));

      setNotifications([...jadwalNotifs, ...tugasNotifs, ...eventNotifs]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    if (!showNotif) fetchNotifications();
    setShowNotif(prev => !prev);
  };

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    if (type === 'jadwal') return <Clock size={14} />;
    if (type === 'tugas') return <CheckSquare size={14} />;
    return <Calendar size={14} />;
  };

  const getColor = (type) => {
    if (type === 'jadwal') return '#8A93D7';
    if (type === 'tugas') return '#10b981';
    return '#f59e0b';
  };

  const getLabel = (type) => {
    if (type === 'jadwal') return 'Jadwal';
    if (type === 'tugas') return 'Tugas';
    return 'Event';
  };

  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <button onClick={toggleSidebar} className="menu-toggle-btn" aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        <h2 className="navbar-title">{pageTitle}</h2>
      </div>

      <div className="navbar-right">
        {/* Bell Button + Dropdown */}
        <div className="notif-wrapper" ref={dropdownRef}>
          <button className="navbar-icon-btn" aria-label="Notifications" onClick={handleBellClick}>
            <Bell size={18} />
            {notifications.length > 0 && <span className="notification-dot"></span>}
          </button>

          {showNotif && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span>Pengingat Aktif</span>
                <button className="notif-close" onClick={() => setShowNotif(false)}>
                  <X size={14} />
                </button>
              </div>

              <div className="notif-body">
                {loading ? (
                  <div className="notif-empty">Memuat...</div>
                ) : notifications.length === 0 ? (
                  <div className="notif-empty">Tidak ada pengingat aktif.</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="notif-item">
                      <div className="notif-icon" style={{ background: `${getColor(n.type)}20`, color: getColor(n.type) }}>
                        {getIcon(n.type)}
                      </div>
                      <div className="notif-content">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-detail">{n.detail}</div>
                        {n.sub && <div className="notif-sub">{n.sub}</div>}
                      </div>
                      <span className="notif-badge" style={{ background: `${getColor(n.type)}20`, color: getColor(n.type) }}>
                        {getLabel(n.type)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="notif-footer">
                  {notifications.length} pengingat aktif
                </div>
              )}
            </div>
          )}
        </div>

        <div className="navbar-user-profile">
          <div className="user-avatar">
            <User size={16} color="var(--accent-primary)" />
          </div>
          <div className="user-info">
            <span className="user-greeting">{getGreeting()},</span>
            <span className="user-name">{user.name}</span>
          </div>
        </div>
      </div>

      <style>{`
        .navbar-container {
          height: var(--navbar-height);
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 997;
        }
        .navbar-left { display: flex; align-items: center; gap: 15px; }
        .menu-toggle-btn {
          background: none; border: none; color: var(--text-primary);
          cursor: pointer; display: none; align-items: center;
          justify-content: center; padding: 8px;
          border-radius: var(--radius-sm); transition: var(--transition-smooth);
        }
        .menu-toggle-btn:hover { background-color: rgba(0,0,0,0.05); }
        .navbar-title { font-family: 'Outfit', sans-serif; font-size: 1.25rem; color: var(--text-primary); font-weight: 700; }
        .navbar-right { display: flex; align-items: center; gap: 20px; }
        .notif-wrapper { position: relative; }
        .navbar-icon-btn {
          background: none; border: 1px solid var(--glass-border);
          color: var(--text-secondary); cursor: pointer; position: relative;
          padding: 8px; border-radius: 50%; display: flex;
          align-items: center; justify-content: center;
          transition: var(--transition-smooth);
        }
        .navbar-icon-btn:hover { color: var(--text-primary); background-color: rgba(0,0,0,0.03); border-color: var(--accent-primary); }
        .notification-dot {
          position: absolute; top: 6px; right: 6px;
          width: 8px; height: 8px;
          background-color: var(--danger); border-radius: 50%;
          border: 2px solid var(--bg-secondary);
        }
        .notif-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 320px; background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          z-index: 999; overflow: hidden;
        }
        .notif-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--glass-border);
          font-size: 0.875rem; font-weight: 600; color: var(--text-primary);
        }
        .notif-close { background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; }
        .notif-body { max-height: 320px; overflow-y: auto; }
        .notif-empty { padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem; }
        .notif-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--glass-border);
          transition: background 0.2s;
        }
        .notif-item:hover { background: rgba(255,255,255,0.03); }
        .notif-item:last-child { border-bottom: none; }
        .notif-icon {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .notif-content { flex: 1; min-width: 0; }
        .notif-title { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .notif-detail { font-size: 0.75rem; color: var(--accent-primary); margin-top: 2px; }
        .notif-sub { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .notif-badge { font-size: 0.65rem; font-weight: 600; padding: 2px 7px; border-radius: 20px; flex-shrink: 0; align-self: flex-start; margin-top: 2px; }
        .notif-footer { padding: 10px 16px; text-align: center; font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--glass-border); }
        .navbar-user-profile { display: flex; align-items: center; gap: 12px; padding-left: 15px; border-left: 1px solid var(--glass-border); }
        .user-avatar { width: 34px; height: 34px; background: rgba(7,156,210,0.1); border: 1px solid rgba(7,156,210,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .user-info { display: flex; flex-direction: column; }
        .user-greeting { font-size: 0.75rem; color: var(--text-secondary); }
        .user-name { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
        @media (max-width: 992px) {
          .menu-toggle-btn { display: flex; }
          .navbar-container { padding: 0 1rem; }
        }
        @media (max-width: 576px) {
          .user-info { display: none; }
          .notif-dropdown { width: 280px; right: -40px; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;