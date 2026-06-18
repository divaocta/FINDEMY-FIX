import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Sparkles, Key, Lock, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ email: '', code: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.email) tempErrors.email = 'Email wajib diisi.';
    if (!formData.code) {
      tempErrors.code = 'Kode verifikasi wajib diisi.';
    } else if (formData.code.length !== 4) {
      tempErrors.code = 'Kode verifikasi harus 4 digit.';
    }
    if (!formData.password) {
      tempErrors.password = 'Kata sandi baru wajib diisi.';
    } else if (formData.password.length < 8) {
      tempErrors.password = 'Kata sandi baru minimal 8 karakter.';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/reset-password', formData);
      showToast('Kata sandi berhasil diperbarui. Silakan masuk.', 'success');
      navigate('/login');
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        showToast(
          error.response?.data?.message || 
          error.response?.data?.meta?.message || 
          'Kode verifikasi tidak valid atau kedaluwarsa.', 
          'error'
        );
      }
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
          <h2>Reset Kata Sandi</h2>
          <p>Lengkapi formulir untuk mengganti kata sandi lama Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="nama@domain.com"
              disabled={loading || !!new URLSearchParams(location.search).get('email')}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="code">Kode Verifikasi (4 Digit)</label>
            <div className="input-with-icon">
              <Key size={18} className="input-icon" />
              <input
                type="text"
                id="code"
                name="code"
                maxLength={4}
                value={formData.code}
                onChange={handleChange}
                className={`form-input ${errors.code ? 'input-error' : ''}`}
                placeholder="1234"
                disabled={loading}
              />
            </div>
            {errors.code && <span className="error-text">{errors.code}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Kata Sandi Baru</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Minimal 8 karakter"
                disabled={loading}
              />
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Atur Ulang Sandi</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer text-center">
          Sudah ingat kata sandi? <Link to="/login">Masuk disini</Link>
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
          background: linear-gradient(to right, var(--text-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
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

        .auth-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .auth-footer a {
          color: var(--accent-primary);
          font-weight: 600;
          transition: var(--transition-smooth);
        }

        .auth-footer a:hover {
          color: var(--accent-secondary);
          text-decoration: underline;
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

export default ResetPassword;
