import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Sparkles, LogOut, Key, Shield } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [user, setUser] = useState({ name: '', username: '', email: '', created_at: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/me');
      setUser(response.data.user);
      localStorage.setItem('findemy_user', JSON.stringify(response.data.user));
    } catch (error) {
      console.error('Fetch profile error:', error);
      // Fallback to local storage if API fails
      const localUser = localStorage.getItem('findemy_user');
      if (localUser) {
        setUser(JSON.parse(localUser));
      } else {
        showToast('Gagal memuat detail profil.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      showToast('Berhasil keluar dari sesi.', 'success');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('findemy_token');
      localStorage.removeItem('findemy_user');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Memuat profil...</p>
        <style>{`
          .profile-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 200px;
            color: var(--text-secondary);
            gap: 10px;
          }
          .spinner {
            width: 30px;
            height: 30px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: var(--accent-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-grid">
        {/* Left Card: Summary details */}
        <div className="glass-card detail-card">
          <div className="avatar-section">
            <div className="large-avatar">
              <User size={48} color="var(--accent-primary)" />
            </div>
            <h3>{user.name}</h3>
            <span className="username-tag">@{user.username}</span>
          </div>

          <div className="profile-info-list">
            <div className="info-item">
              <div className="info-label-row">
                <Mail size={16} color="var(--text-muted)" />
                <span className="label">Alamat Email</span>
              </div>
              <span className="value">{user.email}</span>
            </div>

            <div className="info-item">
              <div className="info-label-row">
                <Shield size={16} color="var(--text-muted)" />
                <span className="label">Keamanan Sesi</span>
              </div>
              <span className="value">Aktif (Token Bearer)</span>
            </div>

            <div className="info-item">
              <div className="info-label-row">
                <Key size={16} color="var(--text-muted)" />
                <span className="label">Terdaftar Sejak</span>
              </div>
              <span className="value">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                  : '-'}
              </span>
            </div>
          </div>

          <button onClick={handleLogout} className="btn-danger w-full mt-4">
            <LogOut size={16} /> Keluar Akun
          </button>
        </div>

        {/* Right Card: Platform information */}
        <div className="glass-card promo-card">
          <div className="promo-badge">
            <Sparkles size={14} /> <span>FinDemy</span>
          </div>
          <h3>Manajemen Aktivitas Terpadu</h3>
          <p>
            FinDemy merupakan platform manajemen aktivitas yang menyediakan fitur pengelolaan jadwal kerja, tugas proyek, agenda kegiatan, dan pencatatan keuangan dalam satu sistem terintegrasi.
          </p>

          <div className="promo-details">
            <div className="detail-row">
              <span className="bullet">&bull;</span>
              <span><strong>Aktivitas Terpadu:</strong> Kelola jadwal, tugas, agenda, dan keuangan dalam satu platform.</span>
            </div>
            <div className="detail-row">
              <span className="bullet">&bull;</span>
              <span><strong>Monitoring Proyek Efisien:</strong> Pantau progres tugas dan proyek secara terstruktur.</span>
            </div>
            <div className="detail-row">
              <span className="bullet">&bull;</span>
              <span><strong>Pengelolaan Keuangan Praktis:</strong> Catat pemasukan dan pengeluaran dengan mudah.</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .profile-wrapper {
          display: flex;
          flex-direction: column;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }

        .detail-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          text-align: center;
        }

        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .large-avatar {
          width: 90px;
          height: 90px;
          background: rgba(7, 156, 210, 0.08);
          border: 2px solid rgba(7, 156, 210, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .username-tag {
          font-size: 0.85rem;
          color: var(--accent-primary);
          font-weight: 600;
          background: rgba(7, 156, 210, 0.08);
          padding: 2px 10px;
          border-radius: 20px;
        }

        .profile-info-list {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          text-align: left;
          border-top: 1px solid var(--glass-border);
          border-bottom: 1px solid var(--glass-border);
          padding: 1.25rem 0;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .info-label-row .label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .info-item .value {
          font-size: 0.9rem;
          color: var(--text-primary);
          font-weight: 600;
          padding-left: 24px;
        }

        .w-full {
          width: 100%;
        }

        .mt-4 {
          margin-top: 1rem;
        }

        .promo-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: linear-gradient(135deg, rgba(138, 147, 215, 0.05), rgba(7, 156, 210, 0.05));
        }

        .promo-badge {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(138, 147, 215, 0.1);
          color: var(--accent-secondary);
          border: 1px solid rgba(138, 147, 215, 0.2);
          padding: 0.35rem 0.75rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .promo-card h3 {
          font-size: 1.5rem;
          font-family: 'Outfit', sans-serif;
        }

        .promo-card p {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .promo-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 0.5rem;
          border-top: 1px solid var(--glass-border);
          padding-top: 1.25rem;
        }

        .detail-row {
          display: flex;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .detail-row .bullet {
          color: var(--accent-primary);
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
