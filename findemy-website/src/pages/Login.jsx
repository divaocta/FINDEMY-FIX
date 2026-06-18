import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { Sparkles, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.email) tempErrors.email = 'Email, nama, atau username wajib diisi.';
    if (!formData.password) tempErrors.password = 'Kata sandi wajib diisi.';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.post('/login', formData);
      const { token, user } = response.data;

      localStorage.setItem('findemy_token', token);
      localStorage.setItem('findemy_user', JSON.stringify(user));

      showToast('Login berhasil! Selamat datang kembali.', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
        showToast('Validasi login gagal.', 'error');
      } else {
        showToast(
          error.response?.data?.message || 'Email atau kata sandi Anda salah.',
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
          <h2>Masuk ke Akun</h2>
          <p>Kelola produktivitas dan finansial Anda sekarang</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email / Username</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="nama@domain.com / username"
                disabled={loading}
              />
            </div>
            {errors.email && <span className="error-text">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</span>}
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="password">Kata Sandi</label>
              <Link to="/forgot-password" className="forgot-link">Lupa sandi?</Link>
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="password-toggle-btn"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</span>}
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Masuk Akun</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
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

        .form-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .form-label-row .form-label {
          margin-bottom: 0;
        }

        .forgot-link {
          font-size: 0.75rem;
          color: var(--accent-primary);
          font-weight: 500;
          transition: var(--transition-smooth);
        }

        .forgot-link:hover {
          color: var(--accent-secondary);
          text-decoration: underline;
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

        .password-toggle-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          padding: 0;
        }
        .password-toggle-btn:hover { color: var(--accent-primary); }

      `}</style>
    </div>
  );
};

export default Login;
