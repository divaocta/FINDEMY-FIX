import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email) {
      setError('Email wajib diisi.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Format email tidak valid.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/forgot-password', { email });
      showToast('Kode verifikasi telah dikirim ke email Anda.', 'success');
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(
        error.response?.data?.message ||
        error.response?.data?.meta?.message ||
        'Email tidak ditemukan.'
      );
      showToast('Gagal mengirim kode verifikasi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <Link to="/" className="auth-brand">
            <img src="/logo.png" alt="FinDemy Logo" className="auth-brand-logo" />
            <span className="brand-text">FinDemy</span>
          </Link>
          <h2>Lupa Kata Sandi</h2>
          <p>Masukkan email Anda untuk menerima kode reset</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className={`form-input ${error ? 'input-error' : ''}`}
                placeholder="nama@domain.com"
                disabled={loading}
              />
            </div>
            {error && <span className="error-text">{error}</span>}
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Mengirim Kode...</span>
              </>
            ) : (
              <>
                <span>Kirim Kode Verifikasi</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-back">
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} /> Kembali ke Halaman Masuk
          </Link>
        </div>

        <div className="auth-maskot-container">
          <img src="/auth_maskot.png" alt="FinDemy Mascot" className="auth-maskot-img" />
        </div>
      </div>

      <style>{`
        .auth-page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background: radial-gradient(circle at top right, rgba(79, 195, 247, 0.08), transparent 450px),
                      radial-gradient(circle at bottom left, rgba(138, 147, 215, 0.05), transparent 400px);
          background-color: var(--bg-primary);
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: 2.5rem;
          border: 1px solid var(--glass-border);
          background: var(--bg-secondary);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
          border-radius: var(--radius-lg);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1rem;
        }

        .auth-brand-logo {
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

        .auth-header h2 {
          font-size: 1.5rem;
          color: var(--text-primary);
        }

        .auth-header p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-with-icon .form-input {
          padding-left: 42px;
        }

        .form-input {
          background-color: #F5F5F5;
          border: 1px solid #EEEEEE;
          border-radius: 12px;
          color: #333333;
        }

        .form-input:focus {
          border-color: #4FC3F7;
          background-color: #F5F5F5;
          box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.15);
        }

        .auth-submit-btn {
          width: 100%;
          margin-top: 1rem;
          height: 48px;
        }

        .auth-footer-back {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
        }

        .back-link {
          color: var(--text-secondary);
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: var(--transition-smooth);
        }

        .back-link:hover {
          color: var(--accent-primary);
        }

        .auth-maskot-container {
          margin-top: 1.5rem;
          text-align: center;
          border-top: 1px dashed var(--glass-border);
          padding-top: 1rem;
        }

        .auth-maskot-img {
          width: 100%;
          max-width: 130px;
          height: auto;
          object-fit: contain;
        }

        .input-error {
          border-color: var(--danger);
        }

        .input-error:focus {
          border-color: var(--danger);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }

        .error-text {
          font-size: 0.75rem;
          color: var(--danger);
          margin-top: 0.25rem;
          display: block;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
