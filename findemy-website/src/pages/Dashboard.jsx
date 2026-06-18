import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Wallet, 
  CalendarRange, 
  CheckSquare, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  AlertCircle,
  Plus
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: 'User' });
  const [financeData, setFinanceData] = useState({
    saldo: '0',
    pemasukan: '0',
    pengeluaran: '0',
    transaksi: []
  });
  const [schedules, setSchedules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const userString = localStorage.getItem('findemy_user');
    if (userString) {
      setUser(JSON.parse(userString));
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentYear = String(now.getFullYear());

      const [financeRes, scheduleRes, taskRes, eventRes] = await Promise.all([
        api.get(`/transaksi?bulan=${currentMonth}&tahun=${currentYear}`).catch(e => { console.error(e); return { data: { data: { saldo: '0', pemasukan: '0', pengeluaran: '0', transaksi: [] } } }; }),
        api.get('/jadwal').catch(e => { console.error(e); return { data: { data: [] } }; }),
        api.get('/tugas').catch(e => { console.error(e); return { data: { data: [] } }; }),
        api.get('/event').catch(e => { console.error(e); return { data: { data: [] } }; })
      ]);

      setFinanceData(financeRes.data.data);
      setSchedules(scheduleRes.data.data || []);
      setTasks(taskRes.data.data || []);
      setEvents(eventRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Gagal memuat beberapa data dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTodayDay = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[new Date().getDay()];
  };

  const todayDay = getTodayDay();
  const todaySchedules = schedules.filter(s => s.hari.toLowerCase() === todayDay.toLowerCase());
  const pendingTasks = tasks.filter(t => t.status === 'belum selesai');

  const formatRupiah = (numberString) => {
    const number = parseInt(numberString || '0');
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  if (loading) {
    return (
      <div className="dashboard-loading-container">
        <div className="spinner"></div>
        <p>Memuat ringkasan data...</p>
        <style>{`
          .dashboard-loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            color: var(--text-secondary);
            gap: 15px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-top-color: var(--accent-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* Welcome Banner */}
      <div className="dashboard-welcome glass-card">
        <div className="welcome-text">
          <h1>Selamat Datang Kembali, {user.name}!</h1>
          <p>Hari ini hari <strong>{todayDay}</strong>. Waktunya mengorganisir jadwal, menyelesaikan tugas, dan mengontrol keuangan Anda.</p>
        </div>
        <div className="welcome-actions">
          <Link to="/tasks" className="btn-primary">
            <Plus size={16} /> Kelola Tugas
          </Link>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="stats-grid">
        {/* Wallet Card */}
        <div className="glass-card stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper wallet">
              <Wallet size={20} />
            </div>
            <span className="stat-title">Total Saldo Keuangan</span>
          </div>
          <div className="stat-value">{formatRupiah(financeData.saldo)}</div>
          <div className="stat-finance-summary">
            <div className="summary-item pemasukan">
              <ArrowUpRight size={14} />
              <span>Masuk: {formatRupiah(financeData.pemasukan)}</span>
            </div>
            <div className="summary-item pengeluaran">
              <ArrowDownRight size={14} />
              <span>Keluar: {formatRupiah(financeData.pengeluaran)}</span>
            </div>
          </div>
        </div>

        {/* Schedule Stats Card */}
        <div className="glass-card stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper schedule">
              <CalendarRange size={20} />
            </div>
            <span className="stat-title">Jadwal Harian Hari Ini</span>
          </div>
          <div className="stat-value">{todaySchedules.length} Kegiatan</div>
          <p className="stat-description">
            {todaySchedules.length > 0 
              ? `Kegiatan pertama dimulai jam ${todaySchedules[0].jam_mulai}` 
              : 'Tidak ada jadwal kegiatan terdaftar untuk hari ini.'}
          </p>
        </div>

        {/* Tasks Stats Card */}
        <div className="glass-card stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper tasks">
              <CheckSquare size={20} />
            </div>
            <span className="stat-title">Tugas & Proyek Pending</span>
          </div>
          <div className="stat-value">{pendingTasks.length} Tugas</div>
          <p className="stat-description">
            {pendingTasks.length > 0 
              ? `${pendingTasks.filter(t => t.pasang_pengingat).length} tugas memiliki pengingat aktif`
              : 'Semua tugas telah diselesaikan! Bagus sekali.'}
          </p>
        </div>

        {/* Events Stats Card */}
        <div className="glass-card stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper events">
              <Calendar size={20} />
            </div>
            <span className="stat-title">Total Agenda & Event</span>
          </div>
          <div className="stat-value">{events.length} Terdaftar</div>
          <p className="stat-description">
            Agenda penting bulanan dan pengingat yang terpasang di kalender Anda.
          </p>
        </div>
      </div>

      {/* Columns: Timetable & Tasks */}
      <div className="dashboard-content-grid">
        {/* Today's schedule */}
        <div className="glass-card list-section">
          <div className="section-header-row">
            <h3>Jadwal Hari Ini ({todayDay})</h3>
            <Link to="/schedules" className="section-link">Selengkapnya</Link>
          </div>
          <div className="list-container">
            {todaySchedules.length > 0 ? (
              <div className="timeline">
                {todaySchedules.map((sched, idx) => (
                  <div key={sched.id} className="timeline-item">
                    <div className="timeline-time">
                      <Clock size={14} />
                      <span>{sched.jam_mulai} - {sched.jam_selesai}</span>
                    </div>
                    <div className="timeline-content-box">
                      <h4>{sched.mata_kuliah}</h4>
                      <p className="partner">Partner: {sched.dosen}</p>
                      <p className="location">Lokasi: {sched.ruangan}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <AlertCircle size={24} />
                <p>Tidak ada kegiatan terjadwal hari ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending tasks */}
        <div className="glass-card list-section">
          <div className="section-header-row">
            <h3>Tugas Mendatang</h3>
            <Link to="/tasks" className="section-link">Selengkapnya</Link>
          </div>
          <div className="list-container">
            {pendingTasks.length > 0 ? (
              <div className="task-list">
                {pendingTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="dashboard-task-item">
                    <div className="task-checkbox-dummy"></div>
                    <div className="task-info">
                      <h4>{task.judul}</h4>
                      <p className="task-desc">{task.deskripsi}</p>
                      <span className="task-deadline">Deadline: {task.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <CheckSquare size={24} />
                <p>Bagus! Semua tugas Anda telah selesai.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-wrapper {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .dashboard-welcome {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(7, 156, 210, 0.1), rgba(138, 147, 215, 0.05));
          border-left: 4px solid var(--accent-primary);
        }

        .welcome-text h1 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
          font-family: 'Outfit', sans-serif;
        }

        .welcome-text p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stat-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon-wrapper {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon-wrapper.wallet { background: rgba(7, 156, 210, 0.1); color: var(--accent-primary); }
        .stat-icon-wrapper.schedule { background: rgba(138, 147, 215, 0.1); color: var(--accent-secondary); }
        .stat-icon-wrapper.tasks { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .stat-icon-wrapper.events { background: rgba(245, 158, 11, 0.1); color: var(--warning); }

        .stat-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .stat-value {
          font-family: 'Outfit', sans-serif;
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .stat-description {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .stat-finance-summary {
          display: flex;
          flex-direction: column;
          gap: 4px;
          border-top: 1px solid var(--glass-border);
          padding-top: 8px;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .summary-item.pemasukan { color: var(--success); }
        .summary-item.pengeluaran { color: var(--danger); }

        .dashboard-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 992px) {
          .dashboard-content-grid {
            grid-template-columns: 1fr;
          }
        }

        .list-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-header-row h3 {
          font-size: 1.15rem;
          color: var(--text-primary);
        }

        .section-link {
          font-size: 0.8rem;
          color: var(--accent-primary);
          font-weight: 600;
        }

        .section-link:hover {
          text-decoration: underline;
        }

        .list-container {
          min-height: 250px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 250px;
          color: var(--text-muted);
          gap: 10px;
          border: 2px dashed var(--glass-border);
          border-radius: var(--radius-md);
        }

        /* Timeline Styles */
        .timeline {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
          padding-left: 10px;
        }

        .timeline-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
          padding-left: 20px;
          border-left: 2px solid var(--accent-primary);
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: -6px;
          top: 4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--bg-primary);
          border: 2px solid var(--accent-primary);
        }

        .timeline-time {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--accent-primary);
          font-weight: 600;
        }

        .timeline-content-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1rem;
        }

        .timeline-content-box h4 {
          font-size: 0.95rem;
          margin-bottom: 4px;
        }

        .timeline-content-box p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        /* Task List Styles */
        .task-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .dashboard-task-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          padding: 1rem;
        }

        .task-checkbox-dummy {
          width: 18px;
          height: 18px;
          border: 2px solid var(--text-muted);
          border-radius: 4px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .task-info h4 {
          font-size: 0.95rem;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .task-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .task-deadline {
          font-size: 0.75rem;
          color: var(--danger);
          font-weight: 500;
        }

        @media (max-width: 576px) {
          .dashboard-welcome {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
          
          .welcome-actions {
            width: 100%;
          }
          
          .welcome-actions .btn-primary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
