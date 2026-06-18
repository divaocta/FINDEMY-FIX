import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Bell,
  BellOff,
  Loader2,
  Clock
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const CalendarPage = () => {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar Date State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentEventId, setCurrentEventId] = useState(null);
  const [formData, setFormData] = useState({
    judul: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    pasang_pengingat: false
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/event');
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Fetch events error:', error);
      showToast('Gagal memuat agenda event.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (date = null) => {
    setModalType('add');
    setCurrentEventId(null);

    // Format date to YYYY-MM-DD
    let dateStr = '';
    if (date) {
      const offset = date.getTimezoneOffset();
      const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
      dateStr = adjustedDate.toISOString().split('T')[0];
    } else {
      dateStr = new Date().toISOString().split('T')[0];
    }

    setFormData({
      judul: '',
      tanggal_mulai: dateStr,
      tanggal_selesai: dateStr,
      pasang_pengingat: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setModalType('edit');
    setCurrentEventId(event.id);
    setFormData({
      judul: event.judul,
      tanggal_mulai: event.tanggal_mulai,
      tanggal_selesai: event.tanggal_selesai,
      pasang_pengingat: event.pasang_pengingat === 1 || event.pasang_pengingat === true || event.pasang_pengingat === '1'
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
    if (!formData.judul || !formData.tanggal_mulai || !formData.tanggal_selesai) {
      showToast('Mohon lengkapi judul dan tanggal.', 'warning');
      return;
    }

    setSubmitLoading(true);
    const payload = {
      ...formData,
      pasang_pengingat: formData.pasang_pengingat ? 1 : 0
    };

    try {
      if (modalType === 'add') {
        await api.post('/event', payload);
        showToast('Event baru berhasil dibuat.', 'success');
      } else {
        await api.put(`/event/${currentEventId}`, payload);
        showToast('Event berhasil diperbarui.', 'success');
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Submit event error:', error);
      showToast(error.response?.data?.message || 'Gagal menyimpan agenda.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus agenda event ini?')) return;

    try {
      await api.delete(`/event/${id}`);
      showToast('Event berhasil dihapus.', 'success');
      fetchEvents();
    } catch (error) {
      console.error('Delete event error:', error);
      showToast('Gagal menghapus event.', 'error');
    }
  };

  // --- Calendar Grid Calculation ---
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const daysInMonth = getDaysInMonth(month, year);
  const firstDayIndex = getFirstDayOfMonth(month, year);

  const prevMonthDays = getDaysInMonth(month - 1, year);

  const prevMonthCells = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthCells.push({
      day: prevMonthDays - i,
      month: month - 1,
      year: year,
      isCurrentMonth: false
    });
  }

  const currentMonthCells = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthCells.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true
    });
  }

  const totalCells = prevMonthCells.length + currentMonthCells.length;
  const nextMonthCellsNeeded = 42 - totalCells; // Standard 6-row layout
  const nextMonthCells = [];
  for (let i = 1; i <= nextMonthCellsNeeded; i++) {
    nextMonthCells.push({
      day: i,
      month: month + 1,
      year: year,
      isCurrentMonth: false
    });
  }

  const allCells = [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDate = (cell) => {
    // cell format matches date formats YYYY-MM-DD
    const cellDateStr = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;

    return events.filter(evt => {
      // event matches if the cell falls between tanggal_mulai and tanggal_selesai
      return cellDateStr >= evt.tanggal_mulai && cellDateStr <= evt.tanggal_selesai;
    });
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };

  const isCellSelected = (cell) => {
    return selectedDate.getDate() === cell.day &&
      selectedDate.getMonth() === cell.month &&
      selectedDate.getFullYear() === cell.year;
  };

  const handleCellClick = (cell) => {
    const targetDate = new Date(cell.year, cell.month, cell.day);
    setSelectedDate(targetDate);
  };

  const selectedDateEvents = events.filter(evt => {
    const offset = selectedDate.getTimezoneOffset();
    const adjustedSelected = new Date(selectedDate.getTime() - (offset * 60 * 1000));
    const selDateStr = adjustedSelected.toISOString().split('T')[0];
    return selDateStr >= evt.tanggal_mulai && selDateStr <= evt.tanggal_selesai;
  });

  return (
    <div className="calendar-page-wrapper">
      <div className="calendar-layout-grid">
        {/* Left Column: Calendar Grid */}
        <div className="calendar-grid-section glass-card">
          <div className="calendar-nav-header">
            <h3>{MONTH_NAMES[month]} {year}</h3>
            <div className="nav-buttons">
              <button onClick={handlePrevMonth} className="nav-arrow-btn"><ChevronLeft size={16} /></button>
              <button onClick={() => setCurrentDate(new Date())} className="btn-secondary btn-today-sm">Hari Ini</button>
              <button onClick={handleNextMonth} className="nav-arrow-btn"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="calendar-body">
            {/* Days Short Labels */}
            <div className="days-header">
              {DAYS_SHORT.map(d => (
                <div key={d} className="day-header-label">{d}</div>
              ))}
            </div>

            {/* Days Grid Cells */}
            <div className="days-cells-grid">
              {allCells.map((cell, idx) => {
                const cellEvents = getEventsForDate(cell);
                const isSelected = isCellSelected(cell);
                const isToday = isSameDay(new Date(cell.year, cell.month, cell.day), new Date());

                return (
                  <div
                    key={idx}
                    onClick={() => handleCellClick(cell)}
                    className={`calendar-cell ${cell.isCurrentMonth ? 'curr-month' : 'other-month'} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  >
                    <span className="cell-day-num">{cell.day}</span>
                    {cellEvents.length > 0 && (
                      <div className="cell-indicators">
                        <span className="event-dot-indicator"></span>
                        {cellEvents.length > 1 && <span className="event-count-indicator">+{cellEvents.length}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Day details agenda panel */}
        <div className="agenda-panel-section glass-card">
          <div className="panel-header-row">
            <div className="date-display">
              <Clock size={16} color="var(--accent-primary)" />
              <h4>
                {selectedDate.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </h4>
            </div>
            <button onClick={() => openAddModal(selectedDate)} className="btn-small-add">
              <Plus size={14} /> Event
            </button>
          </div>

          <div className="agenda-events-list">
            {loading ? (
              <div className="agenda-loading"><Loader2 className="animate-spin" /></div>
            ) : selectedDateEvents.length > 0 ? (
              <div className="agenda-cards-container">
                {selectedDateEvents.map(evt => (
                  <div key={evt.id} className="agenda-event-card">
                    <div className="event-card-top">
                      <h4 className="event-title">{evt.judul}</h4>
                      <div className="event-actions">
                        <button onClick={() => openEditModal(evt)} className="event-action-btn edit"><Edit3 size={12} /></button>
                        <button onClick={() => handleDelete(evt.id)} className="event-action-btn delete"><Trash2 size={12} /></button>
                      </div>
                    </div>

                    <div className="event-card-dates">
                      <span className="label">Rentang: </span>
                      <span className="dates">{evt.tanggal_mulai} s.d. {evt.tanggal_selesai}</span>
                    </div>

                    <div className="event-card-footer">
                      {(evt.pasang_pengingat === 1 || evt.pasang_pengingat === true || evt.pasang_pengingat === '1') ? (
                        <span className="badge badge-success gap-4">
                          <Bell size={10} /> Pengingat Aktif
                        </span>
                      ) : (
                        <span className="badge badge-secondary gap-4">
                          <BellOff size={10} /> Tanpa Pengingat
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-agenda-state">
                <CalendarIcon size={24} color="var(--text-muted)" />
                <p>Tidak ada agenda event hari ini.</p>
                <button onClick={() => openAddModal(selectedDate)} className="btn-secondary btn-sm-add">Buat Agenda Baru</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Buat Agenda Kegiatan' : 'Edit Agenda Kegiatan'}
      >
        <form onSubmit={handleSubmit} className="calendar-modal-form">
          <div className="form-group">
            <label className="form-label">Nama Agenda / Event</label>
            <input
              type="text"
              name="judul"
              value={formData.judul}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Contoh: Interview Kerja, Liburan Akhir Pekan"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Tanggal Mulai</label>
              <input
                type="date"
                name="tanggal_mulai"
                value={formData.tanggal_mulai}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tanggal Selesai</label>
              <input
                type="date"
                name="tanggal_selesai"
                value={formData.tanggal_selesai}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="checkbox-wrapper">
              <input
                type="checkbox"
                id="pasang_pengingat"
                name="pasang_pengingat"
                checked={formData.pasang_pengingat}
                onChange={handleInputChange}
              />
              <label htmlFor="pasang_pengingat">Pasang Pengingat Notifikasi</label>
            </div>
          </div>

          <div className="modal-actions-row">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" disabled={submitLoading}>Batal</button>
            <button type="submit" className="btn-primary" disabled={submitLoading}>
              {submitLoading ? <Loader2 className="animate-spin" size={16} /> : 'Simpan Agenda'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .calendar-page-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .calendar-layout-grid {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 1.5rem;
        }

        @media (max-width: 992px) {
          .calendar-layout-grid {
            grid-template-columns: 1fr;
          }
        }

        .calendar-grid-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .calendar-nav-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .calendar-nav-header h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
        }

        .nav-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-arrow-btn {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .nav-arrow-btn:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .btn-today-sm {
          padding: 0.35rem 0.75rem;
          font-size: 0.8rem;
          height: 32px;
        }

        .days-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .day-header-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .days-cells-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .calendar-cell {
          aspect-ratio: 1.2;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--glass-border);
          border-radius: 6px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .calendar-cell:hover {
          background-color: rgba(255, 255, 255, 0.03);
          border-color: var(--text-muted);
        }

        .calendar-cell.other-month {
          opacity: 0.3;
        }

        .calendar-cell.today {
          border-color: var(--accent-primary);
          background-color: rgba(7, 156, 210, 0.05);
        }

        .calendar-cell.selected {
          border-color: var(--accent-secondary);
          background-color: rgba(138, 147, 215, 0.08);
        }

        .cell-day-num {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .cell-indicators {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
        }

        .event-dot-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--accent-primary);
        }

        .event-count-indicator {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        /* Agenda Panel */
        .agenda-panel-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .panel-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.75rem;
        }

        .date-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .date-display h4 {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .agenda-events-list {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .agenda-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100px;
          color: var(--text-secondary);
        }

        .agenda-cards-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .agenda-event-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .event-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .event-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .event-actions {
          display: flex;
          gap: 4px;
        }

        .event-action-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          transition: var(--transition-smooth);
        }

        .event-action-btn:hover { color: var(--text-primary); }
        .event-action-btn.edit:hover { color: var(--accent-primary); }
        .event-action-btn.delete:hover { color: var(--danger); }

        .event-card-dates {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .event-card-dates .label {
          color: var(--text-muted);
        }

        .event-card-footer {
          margin-top: 4px;
        }

        .badge-secondary {
          background-color: rgba(148, 163, 184, 0.08);
          color: var(--text-secondary);
          border: 1px solid rgba(148, 163, 184, 0.15);
        }

        .empty-agenda-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 1rem;
          gap: 10px;
          color: var(--text-muted);
          font-size: 0.875rem;
          border: 1px dashed var(--glass-border);
          border-radius: var(--radius-md);
        }

        .btn-small-add {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0.4rem 1rem;
        background: linear-gradient(135deg, var(--accent-primary), rgba(7, 156, 210, 0.7));
        color: white;
        border: none;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        font-family: var(--font-family);
        transition: var(--transition-smooth);
        box-shadow: 0 2px 8px rgba(7, 156, 210, 0.3);
      }

      .btn-small-add:hover {
        opacity: 0.85;
        box-shadow: 0 4px 12px rgba(7, 156, 210, 0.4);
        transform: translateY(-1px);
      }

        .calendar-modal-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;
