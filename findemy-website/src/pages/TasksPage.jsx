import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Calendar,
  CheckCircle2,
  Circle,
  Link as LinkIcon,
  Bell,
  BellOff,
  AlertCircle,
  Loader2,
  ListTodo
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

const TasksPage = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('belum selesai'); // 'semua' | 'belum selesai' | 'selesai'

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    deadline: '',
    status: 'belum selesai',
    jadwal_id: '',
    pasang_pengingat: false
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchTasksAndSchedules();
  }, []);

  const fetchTasksAndSchedules = async () => {
    setLoading(true);
    try {
      const [tasksRes, schedulesRes] = await Promise.all([
        api.get('/tugas'),
        api.get('/jadwal')
      ]);
      setTasks(tasksRes.data.data || []);

      const schedulesList = schedulesRes.data.data || [];
      setSchedules(schedulesList);

      // Auto-set first schedule as default for form
      if (schedulesList.length > 0) {
        setFormData(prev => ({ ...prev, jadwal_id: schedulesList[0].id }));
      }
    } catch (error) {
      console.error('Fetch tasks error:', error);
      showToast('Gagal memuat daftar tugas atau jadwal.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    if (schedules.length === 0) {
      showToast('Anda harus membuat minimal satu Jadwal Kegiatan terlebih dahulu sebelum membuat Tugas.', 'warning');
      return;
    }

    setModalType('add');
    setCurrentId(null);
    setFormData({
      judul: '',
      deskripsi: '',
      deadline: '',
      status: 'belum selesai',
      jadwal_id: schedules[0].id,
      pasang_pengingat: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setModalType('edit');
    setCurrentId(task.id);
    setFormData({
      judul: task.judul,
      deskripsi: task.deskripsi,
      deadline: task.deadline,
      status: task.status,
      jadwal_id: task.jadwal_id,
      pasang_pengingat: task.pasang_pengingat === 1 || task.pasang_pengingat === true || task.pasang_pengingat === '1'
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
    if (!formData.judul || !formData.deskripsi || !formData.deadline || !formData.jadwal_id) {
      showToast('Formulir tidak lengkap.', 'warning');
      return;
    }

    setSubmitLoading(true);
    const payload = {
      ...formData,
      pasang_pengingat: formData.pasang_pengingat ? 1 : 0
    };

    try {
      if (modalType === 'add') {
        await api.post('/tugas', payload);
        showToast('Tugas baru berhasil ditambahkan.', 'success');
      } else {
        await api.put(`/tugas/${currentId}`, payload);
        showToast('Tugas berhasil diperbarui.', 'success');
      }
      setIsModalOpen(false);
      fetchTasksAndSchedules();
    } catch (error) {
      console.error('Submit task error:', error);
      showToast(error.response?.data?.message || 'Gagal menyimpan tugas.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === 'selesai' ? 'belum selesai' : 'selesai';

    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

    try {
      const payload = {
        judul: task.judul,
        deskripsi: task.deskripsi,
        deadline: task.deadline,
        jadwal_id: task.jadwal_id,
        status: newStatus,
        pasang_pengingat: task.pasang_pengingat
      };
      await api.put(`/tugas/${task.id}`, payload);
      showToast(`Tugas ditandai sebagai ${newStatus}.`, 'success');
      // Re-fetch to ensure sync
      const res = await api.get('/tugas');
      setTasks(res.data.data || []);
    } catch (error) {
      console.error('Toggle status error:', error);
      showToast('Gagal merubah status tugas.', 'error');
      // Revert change
      fetchTasksAndSchedules();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;

    try {
      await api.delete(`/tugas/${id}`);
      showToast('Tugas berhasil dihapus.', 'success');
      fetchTasksAndSchedules();
    } catch (error) {
      console.error('Delete task error:', error);
      showToast('Gagal menghapus tugas.', 'error');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'semua') return true;
    return task.status === filter;
  });

  return (
    <div className="tasks-wrapper">
      <div className="tasks-header-row">
        <div>
          <p className="tasks-subtitle">Pantau dan selesaikan daftar tugas Anda yang terintegrasi dengan jadwal.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus size={16} /> Tambah Tugas
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="task-filters-row">
        <div className="filters-container glass-card">
          <button
            onClick={() => setFilter('belum selesai')}
            className={`filter-tab-btn ${filter === 'belum selesai' ? 'active' : ''}`}
          >
            <span>Belum Selesai</span>
            {tasks.filter(t => t.status === 'belum selesai').length > 0 && (
              <span className="count-badge danger">
                {tasks.filter(t => t.status === 'belum selesai').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('selesai')}
            className={`filter-tab-btn ${filter === 'selesai' ? 'active' : ''}`}
          >
            <span>Selesai</span>
          </button>
          <button
            onClick={() => setFilter('semua')}
            className={`filter-tab-btn ${filter === 'semua' ? 'active' : ''}`}
          >
            <span>Semua</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="tasks-list-section">
        {loading ? (
          <div className="tasks-spinner-container">
            <Loader2 className="animate-spin" />
            <p>Memuat daftar tugas...</p>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="tasks-list-grid">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === 'selesai';
              return (
                <div key={task.id} className={`glass-card task-card-item ${isCompleted ? 'task-completed' : ''}`}>
                  <div className="task-checkbox-col">
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className="checkbox-trigger-btn"
                      aria-label={isCompleted ? "Tandai belum selesai" : "Tandai selesai"}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={22} className="status-icon completed" />
                      ) : (
                        <Circle size={22} className="status-icon pending" />
                      )}
                    </button>
                  </div>

                  <div className="task-content-col">
                    <div className="task-card-header">
                      <h3 className="task-title">{task.judul}</h3>
                      <div className="action-buttons">
                        <button
                          onClick={() => openEditModal(task)}
                          className="action-btn edit"
                          title="Edit tugas"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="action-btn delete"
                          title="Hapus tugas"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="task-desc">{task.deskripsi}</p>

                    <div className="task-meta-info">
                      <div className="meta-item deadline">
                        <Calendar size={14} />
                        <span>Batas: {task.deadline}</span>
                      </div>

                      {task.jadwal && (
                        <div className="meta-item schedule-tag" title="Terkait dengan jadwal">
                          <LinkIcon size={12} />
                          <span>{task.jadwal.mata_kuliah}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="task-badge-col">
                    {(task.pasang_pengingat === 1 || task.pasang_pengingat === true || task.pasang_pengingat === '1') ? (
                      <span className="reminder-indicator active" title="Pengingat aktif">
                        <Bell size={14} />
                      </span>
                    ) : (
                      <span className="reminder-indicator inactive" title="Tanpa pengingat">
                        <BellOff size={14} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card empty-tasks-state">
            <ListTodo size={36} color="var(--text-muted)" />
            <h3>Tidak Ada Tugas Ditemukan</h3>
            <p>Tidak ada tugas terdaftar di kategori ini. Tambahkan tugas baru untuk mulai melacak.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Tambah Tugas / Proyek Baru' : 'Edit Tugas / Proyek'}
      >
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label className="form-label">Judul Tugas / Proyek</label>
            <input
              type="text"
              name="judul"
              value={formData.judul}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Contoh: Laporan Keuangan Bulanan"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Deskripsi Rincian</label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleInputChange}
              className="form-textarea"
              rows={3}
              placeholder="Contoh: Menyusun file spreadsheet"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Hubungkan dengan Jadwal Kegiatan</label>
            <select
              name="jadwal_id"
              value={formData.jadwal_id}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              {schedules.map(sched => (
                <option key={sched.id} value={sched.id}>
                  {sched.mata_kuliah} ({sched.hari} - {sched.jam_mulai})
                </option>
              ))}
            </select>
            <span className="form-helper-text">Tugas harus dikaitkan dengan salah satu aktivitas rutin Anda.</span>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Batas Waktu (Deadline)</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="form-input"
                required
              />
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

          {modalType === 'edit' && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="belum selesai">Belum Selesai</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          )}

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
                'Simpan Tugas'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .tasks-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .tasks-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tasks-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .task-filters-row {
          display: flex;
          justify-content: flex-start;
        }

        .filters-container {
          display: flex;
          gap: 5px;
          padding: 6px;
        }

        .filter-tab-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-sm);
          font-family: var(--font-family);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: var(--transition-smooth);
        }

        .filter-tab-btn:hover {
          color: var(--text-primary);
          background-color: rgba(255, 255, 255, 0.03);
        }

        .filter-tab-btn.active {
          color: var(--accent-primary);
          background: #e0f4fd;
          border: 1px solid rgba(7, 156, 210, 0.4);
        }

        .count-badge {
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 700;
        }

        .count-badge.danger {
          background-color: rgba(239, 68, 68, 0.15);
          color: var(--danger);
        }

        .tasks-spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--text-secondary);
          gap: 10px;
        }

        .tasks-list-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .task-card-item {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.25rem;
          transition: var(--transition-smooth);
        }

        .task-card-item.task-completed {
          opacity: 0.6;
          border-color: rgba(16, 185, 129, 0.1);
        }

        .checkbox-trigger-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: var(--transition-smooth);
        }

        .checkbox-trigger-btn:hover {
          color: var(--accent-primary);
          background: rgba(255, 255, 255, 0.03);
        }

        .status-icon.completed {
          color: var(--success);
        }

        .status-icon.pending {
          color: var(--text-muted);
        }

        .task-content-col {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .task-title {
          font-size: 1.1rem;
          color: var(--text-primary);
          font-family: 'Outfit', sans-serif;
        }

        .task-completed .task-title {
          text-decoration: line-through;
          color: var(--text-secondary);
        }

        .task-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .task-meta-info {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 4px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .meta-item.deadline {
          color: var(--danger);
        }

        .task-completed .meta-item.deadline {
          color: var(--text-muted);
        }

        .meta-item.schedule-tag {
          color: var(--accent-secondary);
          background: rgba(138, 147, 215, 0.08);
          border: 1px solid rgba(138, 147, 215, 0.15);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .reminder-indicator {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .reminder-indicator.active {
          color: var(--warning);
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .reminder-indicator.inactive {
          color: var(--text-muted);
          opacity: 0.5;
        }

        .empty-tasks-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 2rem;
          gap: 12px;
          border: 2px dashed var(--glass-border);
        }

        .empty-tasks-state h3 {
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .empty-tasks-state p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          max-width: 420px;
        }

        .task-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-helper-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
          display: block;
        }

        .action-buttons {
        display: flex;
        gap: 6px;
      }

      .action-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 2px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-smooth);
      }

      .action-btn:hover { color: var(--text-primary); }
      .action-btn.edit:hover { color: var(--accent-primary); }
      .action-btn.delete:hover { color: var(--danger); }

      `}</style>
    </div>
  );
};

export default TasksPage;
