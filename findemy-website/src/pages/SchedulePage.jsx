import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Clock,
  MapPin,
  User,
  Bell,
  BellOff,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const SchedulePage = () => {
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Senin');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    mata_kuliah: '',
    dosen: '',
    ruangan: '',
    hari: 'Senin',
    jam_mulai: '',
    jam_selesai: '',
    pasang_pengingat: false
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await api.get('/jadwal');
      setSchedules(response.data.data || []);
    } catch (error) {
      console.error('Fetch schedules error:', error);
      showToast('Gagal memuat daftar jadwal.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalType('add');
    setCurrentId(null);
    setFormData({
      mata_kuliah: '',
      dosen: '',
      ruangan: '',
      hari: activeDay,
      jam_mulai: '',
      jam_selesai: '',
      pasang_pengingat: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (schedule) => {
    setModalType('edit');
    setCurrentId(schedule.id);
    setFormData({
      mata_kuliah: schedule.mata_kuliah,
      dosen: schedule.dosen,
      ruangan: schedule.ruangan,
      hari: schedule.hari,
      jam_mulai: schedule.jam_mulai,
      jam_selesai: schedule.jam_selesai,
      pasang_pengingat: schedule.pasang_pengingat === 1 || schedule.pasang_pengingat === true || schedule.pasang_pengingat === '1'
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mata_kuliah || !formData.dosen || !formData.ruangan || !formData.jam_mulai || !formData.jam_selesai) {
      showToast('Semua input wajib diisi.', 'warning');
      return;
    }

    setSubmitLoading(true);
    // Format pasang_pengingat for Laravel backend validation
    const payload = {
      ...formData,
      pasang_pengingat: formData.pasang_pengingat ? 1 : 0
    };

    try {
      if (modalType === 'add') {
        const res = await api.post('/jadwal', payload);
        showToast('Jadwal baru berhasil ditambahkan.', 'success');
      } else {
        await api.put(`/jadwal/${currentId}`, payload);
        showToast('Jadwal berhasil diperbarui.', 'success');
      }
      setIsModalOpen(false);
      fetchSchedules();
    } catch (error) {
      console.error('Submit schedule error:', error);
      showToast(error.response?.data?.message || 'Gagal menyimpan jadwal.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    try {
      await api.delete(`/jadwal/${id}`);
      showToast('Jadwal berhasil dihapus.', 'success');
      fetchSchedules();
    } catch (error) {
      console.error('Delete schedule error:', error);
      showToast('Gagal menghapus jadwal.', 'error');
    }
  };

  const filteredSchedules = schedules.filter(
    (s) => s.hari.toLowerCase() === activeDay.toLowerCase()
  );

  return (
    <div className="schedule-wrapper">
      <div className="schedule-header-row">
        <div>
          <p className="schedule-subtitle">Kelola dan susun jadwal kegiatan harian Anda.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus size={16} /> Tambah Jadwal
        </button>
      </div>

      {/* Weekday Tabs */}
      <div className="day-tabs-container glass-card">
        {DAYS_OF_WEEK.map((day) => {
          const count = schedules.filter((s) => s.hari.toLowerCase() === day.toLowerCase()).length;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`day-tab-btn ${activeDay === day ? 'active' : ''} ${count > 0 ? 'has-schedule' : ''}`}
            >
              <span className="day-name">{day}</span>
              {count > 0 && <span className="day-count-badge">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Timetable List */}
      <div className="schedule-list-section">
        {loading ? (
          <div className="schedule-spinner-container">
            <Loader2 className="animate-spin" />
            <p>Memuat jadwal...</p>
          </div>
        ) : filteredSchedules.length > 0 ? (
          <div className="schedule-grid">
            {filteredSchedules.map((schedule) => (
              <div key={schedule.id} className="glass-card schedule-card-item">
                <div className="schedule-card-header">
                  <div className="time-badge">
                    <Clock size={14} />
                    <span>{schedule.jam_mulai} - {schedule.jam_selesai}</span>
                  </div>

                  <div className="action-buttons">
                    <button
                      onClick={() => openEditModal(schedule)}
                      className="action-btn edit"
                      title="Edit jadwal"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="action-btn delete"
                      title="Hapus jadwal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="schedule-card-body">
                  <h3 className="activity-title">{schedule.mata_kuliah}</h3>

                  <div className="info-meta">
                    <div className="meta-row">
                      <User size={14} />
                      <span>Partner: {schedule.dosen}</span>
                    </div>
                    <div className="meta-row">
                      <MapPin size={14} />
                      <span>Lokasi: {schedule.ruangan}</span>
                    </div>
                  </div>
                </div>

                <div className="schedule-card-footer">
                  {(schedule.pasang_pengingat === 1 || schedule.pasang_pengingat === true || schedule.pasang_pengingat === '1') ? (
                    <span className="badge badge-success gap-4">
                      <Bell size={12} /> Pengingat Aktif
                    </span>
                  ) : (
                    <span className="badge badge-secondary gap-4">
                      <BellOff size={12} /> Tanpa Pengingat
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card empty-schedule-state">
            <AlertTriangle size={36} color="var(--text-muted)" />
            <h3>Tidak Ada Jadwal Hari {activeDay}</h3>
            <p>Klik tombol "Tambah Jadwal" di atas untuk menambahkan kegiatan rutin pada hari {activeDay}.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Tambah Jadwal Kegiatan' : 'Edit Jadwal Kegiatan'}
      >
        <form onSubmit={handleSubmit} className="schedule-form">
          <div className="form-group">
            <label className="form-label">Nama Aktivitas / Kegiatan</label>
            <input
              type="text"
              name="mata_kuliah"
              value={formData.mata_kuliah}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Contoh: Rapat Tim Mingguan, Olahraga, Shift Kerja"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Partner / Penanggung Jawab (PIC)</label>
            <input
              type="text"
              name="dosen"
              value={formData.dosen}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Contoh: Manager, Instruktur, Klien A"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Lokasi / Tautan Meeting</label>
            <input
              type="text"
              name="ruangan"
              value={formData.ruangan}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Contoh: Ruang Meeting A, Zoom Link, Lapangan"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Hari</label>
              <select
                name="hari"
                value={formData.hari}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                {DAYS_OF_WEEK.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ visibility: 'hidden' }}>Dummy</label>
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="pasang_pengingat"
                  name="pasang_pengingat"
                  checked={formData.pasang_pengingat}
                  onChange={handleInputChange}
                />
                <label htmlFor="pasang_pengingat">Pasang Pengingat</label>
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Jam Mulai</label>
              <input
                type="time"
                name="jam_mulai"
                value={formData.jam_mulai}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Jam Selesai</label>
              <input
                type="time"
                name="jam_selesai"
                value={formData.jam_selesai}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="modal-actions-row">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
              disabled={submitLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitLoading}
            >
              {submitLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Menyimpan...</span>
                </>
              ) : (
                'Simpan Jadwal'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .schedule-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .schedule-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .schedule-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .day-tabs-container {
          display: flex;
          overflow-x: auto;
          gap: 10px;
          padding: 0.75rem;
          scrollbar-width: none; /* Firefox */
        }

        .day-tabs-container::-webkit-scrollbar {
          display: none; /* Safari / Chrome */
        }

        .day-tab-btn {
          flex: 1;
          min-width: 100px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-family: var(--font-family);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: var(--transition-smooth);
        }

        .day-tab-btn:hover {
          color: var(--text-primary);
          background-color: rgba(255, 255, 255, 0.03);
        }

        .day-tab-btn.active {
          color: white;
          background: linear-gradient(135deg, var(--accent-primary), rgba(7, 156, 210, 0.6));
          border-color: rgba(7, 156, 210, 0.3);
          box-shadow: 0 4px 12px 0 rgba(7, 156, 210, 0.25);
        }

        .day-count-badge {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 20px;
          font-weight: 700;
        }

        .schedule-spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--text-secondary);
          gap: 10px;
        }

        .schedule-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .schedule-card-item {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .schedule-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .time-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: rgba(7, 156, 210, 0.1);
          color: var(--accent-primary);
          padding: 0.35rem 0.75rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          gap: 6px;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: var(--transition-smooth);
        }

        .action-btn:hover {
          color: var(--text-primary);
        }

        .action-btn.edit:hover {
          border-color: var(--accent-primary);
          background-color: rgba(7, 156, 210, 0.05);
          color: var(--accent-primary);
        }

        .action-btn.delete:hover {
          border-color: var(--danger);
          background-color: rgba(239, 68, 68, 0.05);
          color: var(--danger);
        }

        .activity-title {
          font-size: 1.125rem;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          font-family: 'Outfit', sans-serif;
        }

        .info-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .meta-row svg {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .schedule-card-footer {
          margin-top: auto;
          border-top: 1px solid var(--glass-border);
          padding-top: 0.75rem;
        }

        .gap-4 {
          gap: 4px;
        }

        .badge-secondary {
          background-color: rgba(148, 163, 184, 0.08);
          color: var(--text-secondary);
          border: 1px solid rgba(148, 163, 184, 0.15);
        }

        .empty-schedule-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 2rem;
          gap: 12px;
          border: 2px dashed var(--glass-border);
        }

        .empty-schedule-state h3 {
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .empty-schedule-state p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          max-width: 420px;
        }

        /* Form Styles */
        .schedule-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 100%;
          padding-top: 8px;
        }

        .checkbox-wrapper input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .checkbox-wrapper label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .modal-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid var(--glass-border);
          padding-top: 1.25rem;
          margin-top: 1rem;
        }

        .day-tab-btn.has-schedule:not(.active) {
          border-color: rgba(7, 156, 210, 0.2);
          color: var(--accent-primary);
          background: rgba(7, 156, 210, 0.04);
        }

        .day-tab-btn.has-schedule:not(.active) .day-count-badge {
          background: rgba(7, 156, 210, 0.15);
          color: var(--accent-primary);
        }

      `}</style>
    </div>
  );
};

export default SchedulePage;
