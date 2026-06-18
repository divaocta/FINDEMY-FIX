import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CalendarRange,
  CheckSquare,
  Wallet,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  UserCheck
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('findemy_token');

  const handleCTA = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="landing-wrapper">
      {/* Navbar */}
      <header className="landing-nav">
        <div className="landing-brand">
          <img src="/logo.png" alt="FinDemy Logo" className="brand-logo-img" />
          <span className="brand-text">FinDemy</span>
        </div>
        <div className="landing-nav-actions">
          {token ? (
            <Link to="/dashboard" className="btn-primary">Dashboard <ArrowRight size={16} /></Link>
          ) : (
            <>
              <Link to="/login" className="btn-login-nav">Masuk</Link>
              <Link to="/register" className="btn-primary">Daftar Gratis</Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} /> <span>Untuk Semua Kalangan</span>
          </div>
          <h1 className="hero-title">
            Kelola Waktu & Keuangan <br />
            <span className="gradient-text">Dalam Satu Genggaman</span>
          </h1>
          <p className="hero-description">
            FinDemy adalah asisten pribadi pintar Anda untuk mengorganisir jadwal harian, melacak tugas/proyek, dan mengelola arus kas keuangan secara terintegrasi dengan mobile.
          </p>
          <div className="hero-buttons">
            <button onClick={handleCTA} className="btn-primary btn-lg">
              {token ? 'Ke Dashboard' : 'Mulai Sekarang'} <ArrowRight size={18} />
            </button>
            <a href="#features" className="btn-secondary btn-lg">Pelajari Fitur</a>
          </div>
        </div>
        <div className="hero-visual">
          <img src="/auth_maskot.png" alt="FinDemy Mascot" className="hero-mascot-img" />
          <div className="visual-dashboard-preview glass-card">
            <div className="preview-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
              <span className="preview-title">Keuangan Bulan Ini</span>
            </div>
            <div className="preview-stats">
              <div className="stat-box">
                <span className="label">Pemasukan</span>
                <span className="value text-success">Rp 4.500.000</span>
              </div>
              <div className="stat-box">
                <span className="label">Pengeluaran</span>
                <span className="value text-danger">Rp 1.250.000</span>
              </div>
            </div>
            <div className="preview-chart">
              <div className="chart-bar" style={{ height: '70%', background: 'var(--accent-primary)' }}></div>
              <div className="chart-bar" style={{ height: '40%', background: 'var(--accent-secondary)' }}></div>
              <div className="chart-bar" style={{ height: '90%', background: 'var(--accent-primary)' }}></div>
              <div className="chart-bar" style={{ height: '55%', background: 'var(--accent-secondary)' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Fitur Unggulan FinDemy</h2>
          <p className="section-subtitle">Dirancang mempermudah rutinitas harian dan perencanaan finansial Anda.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon-wrapper blue">
              <CalendarRange size={24} />
            </div>
            <h3>Jadwal Harian & Kerja</h3>
            <p>Susun jadwal rutin mingguan, jam kerja shift, pertemuan, atau agenda rutin dengan pelacakan lokasi dan partner kerja.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-wrapper purple">
              <CheckSquare size={24} />
            </div>
            <h3>Manajemen Tugas & Proyek</h3>
            <p>Pantau tugas harian, to-do list, deadline, dan proyek pribadi yang terintegrasi langsung dengan jadwal harian Anda.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-wrapper green">
              <Wallet size={24} />
            </div>
            <h3>Manajer Keuangan Cerdas</h3>
            <p>Kelola rekening/dompet, catat pemasukan & pengeluaran, serta pantau arus kas Anda secara langsung.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-wrapper yellow">
              <Calendar size={24} />
            </div>
            <h3>Agenda & Event Planner</h3>
            <p>Kalender kegiatan terintegrasi untuk mencatat event mendatang, janji temu, dan notifikasi pengingat penting.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} FinDemy. All rights reserved.</p>
      </footer>

      <style>{`

        .landing-wrapper {
          background-color: var(--bg-primary);
          color: var(--text-primary);
          min-height: 100vh;
          font-family: var(--font-family);
          display: flex;
          flex-direction: column;
        }

        .landing-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 4rem;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        .landing-nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .btn-login-nav {
          color: var(--text-secondary);
          font-weight: 600;
          transition: var(--transition-smooth);
        }

        .btn-login-nav:hover {
          color: var(--text-primary);
        }

        .hero-section {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 40px;
          align-items: center;
          max-width: 1400px;
          width: 100%;
          margin: 4rem auto;
          padding: 0 4rem;
          flex-grow: 1;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .hero-badge {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(7, 156, 210, 0.1);
          color: var(--accent-primary);
          border: 1px solid rgba(7, 156, 210, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .hero-title {
          font-size: 3.5rem;
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-description {
          font-size: 1.125rem;
          line-height: 1.6;
          color: var(--text-secondary);
          max-width: 600px;
        }

        .hero-buttons {
          display: flex;
          gap: 15px;
          margin-top: 10px;
        }

        .btn-lg {
          padding: 0.95rem 2rem;
          font-size: 1rem;
        }

        .brand-logo-img {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .landing-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-text {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .hero-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          position: relative;
        }

        .hero-mascot-img {
          width: 250px;
          height: auto;
          object-fit: contain;
          z-index: 2;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .hero-visual::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(79, 195, 247, 0.2), transparent 70%);
          z-index: 0;
        }

        .visual-dashboard-preview {
          width: 340px;
          padding: 1.5rem;
          z-index: 1;
          border: 1px solid var(--glass-border);
          background: var(--bg-secondary);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.75rem;
        }

        .preview-header .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .preview-header .dot.red { background: var(--danger); }
        .preview-header .dot.yellow { background: var(--warning); }
        .preview-header .dot.green { background: var(--success); }

        .preview-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-left: 6px;
        }

        .preview-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 1.5rem;
        }

        .stat-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-box .label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .stat-box .value {
          font-size: 1rem;
          font-weight: 700;
        }

        .text-success { color: var(--success); }
        .text-danger { color: var(--danger); }

        .preview-chart {
          height: 120px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 0 10px;
        }

        .chart-bar {
          width: 40px;
          border-radius: 6px 6px 0 0;
          opacity: 0.8;
          transition: var(--transition-smooth);
        }

        .chart-bar:hover {
          opacity: 1;
        }

        /* Features Section */
        .features-section {
          padding: 6rem 4rem;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          border-top: 1px solid var(--glass-border);
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 2.25rem;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          color: var(--text-secondary);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
        }

        .feature-card {
          display: flex;
          flex-direction: column;
          gap: 15px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .feature-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-icon-wrapper.blue {
          background: rgba(7, 156, 210, 0.1);
          color: var(--accent-primary);
        }

        .feature-icon-wrapper.purple {
          background: rgba(138, 147, 215, 0.1);
          color: var(--accent-secondary);
        }

        .feature-icon-wrapper.green {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }

        .feature-icon-wrapper.yellow {
          background: rgba(245, 158, 11, 0.1);
          color: var(--warning);
        }

        .feature-card h3 {
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .feature-card p {
          color: var(--text-secondary);
          line-height: 1.5;
          font-size: 0.95rem;
        }

        /* Footer */
        .landing-footer {
          border-top: 1px solid var(--glass-border);
          padding: 3rem 4rem;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 0.9rem;
          color: var(--text-muted);
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          text-align: center;
        }

        .footer-links {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .footer-links a:hover {
          color: var(--text-secondary);
        }

        /* Responsive Layout */
        @media (max-width: 992px) {
          .hero-section {
            grid-template-columns: 1fr;
            text-align: center;
            margin: 2rem auto;
            padding: 0 2rem;
          }

          .hero-badge {
            align-self: center;
          }

          .hero-title {
            font-size: 2.75rem;
          }

          .hero-description {
            margin: 0 auto;
          }

          .hero-buttons {
            justify-content: center;
          }

          .landing-nav {
            padding: 1.5rem 2rem;
          }

          .features-section {
            padding: 4rem 2rem;
          }

          .landing-footer {
            padding: 2rem;
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
        }

        @media (max-width: 576px) {
          .hero-title {
            font-size: 2.25rem;
          }

          .hero-buttons {
            flex-direction: column;
            gap: 10px;
          }

          .btn-lg {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;