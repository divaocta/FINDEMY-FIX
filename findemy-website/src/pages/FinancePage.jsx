import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  TrendingUp,
  TrendingDown,
  Loader2,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

const MONTHS = [
  { name: 'Januari', val: '01' },
  { name: 'Februari', val: '02' },
  { name: 'Maret', val: '03' },
  { name: 'April', val: '04' },
  { name: 'Mei', val: '05' },
  { name: 'Juni', val: '06' },
  { name: 'Juli', val: '07' },
  { name: 'Agustus', val: '08' },
  { name: 'September', val: '09' },
  { name: 'Oktober', val: '10' },
  { name: 'November', val: '11' },
  { name: 'Desember', val: '12' },
];

const YEARS = ['2024', '2025', '2026', '2027', '2028'];

const FinancePage = () => {
  const { showToast } = useToast();
  const [rekenings, setRekenings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [filterYear, setFilterYear] = useState(String(now.getFullYear()));

  // Finance Stats
  const [stats, setStats] = useState({
    saldo: '0',
    pemasukan: '0',
    pengeluaran: '0',
    selisih: '0'
  });

  // Rekening Modal States
  const [isRekeningModalOpen, setIsRekeningModalOpen] = useState(false);
  const [rekeningModalType, setRekeningModalType] = useState('add'); // 'add' | 'edit'
  const [currentRekeningId, setCurrentRekeningId] = useState(null);
  const [rekeningForm, setRekeningForm] = useState({ nama: '', saldo: '' });
  const [rekeningSubmitLoading, setRekeningSubmitLoading] = useState(false);

  // Transaksi Modal States
  const [isTransaksiModalOpen, setIsTransaksiModalOpen] = useState(false);
  const [transaksiForm, setTransaksiForm] = useState({
    rekening_id: '',
    jenis: 'pengeluaran',
    keterangan: '',
    jumlah: ''
  });
  const [transaksiSubmitLoading, setTransaksiSubmitLoading] = useState(false);

  useEffect(() => {
    fetchFinanceData();
  }, [filterMonth, filterYear]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [rekeningRes, transaksiRes] = await Promise.all([
        api.get('/rekening'),
        api.get(`/transaksi?bulan=${filterMonth}&tahun=${filterYear}`)
      ]);

      const rekList = rekeningRes.data.data || [];
      setRekenings(rekList);

      const trxData = transaksiRes.data.data || { transaksi: [], saldo: '0', pemasukan: '0', pengeluaran: '0', selisih: '0' };
      setTransactions(trxData.transaksi || []);
      setStats({
        saldo: trxData.saldo,
        pemasukan: trxData.pemasukan,
        pengeluaran: trxData.pengeluaran,
        selisih: trxData.selisih
      });

      // Update default rekening in transaction form if none is set
      if (rekList.length > 0) {
        setTransaksiForm(prev => ({ ...prev, rekening_id: rekList[0].id }));
      }
    } catch (error) {
      console.error('Fetch finance data error:', error);
      showToast('Gagal memuat beberapa data keuangan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Rekening (Account) Handlers ---
  const openAddRekeningModal = () => {
    setRekeningModalType('add');
    setCurrentRekeningId(null);
    setRekeningForm({ nama: '', saldo: '' });
    setIsRekeningModalOpen(true);
  };

  const openEditRekeningModal = (rek) => {
    setRekeningModalType('edit');
    setCurrentRekeningId(rek.id);
    setRekeningForm({ nama: rek.nama, saldo: rek.saldo });
    setIsRekeningModalOpen(true);
  };

  const handleRekeningSubmit = async (e) => {
    e.preventDefault();
    if (!rekeningForm.nama || rekeningForm.saldo === '') {
      showToast('Nama rekening dan saldo wajib diisi.', 'warning');
      return;
    }

    setRekeningSubmitLoading(true);
    try {
      if (rekeningModalType === 'add') {
        await api.post('/rekening', rekeningForm);
        showToast('Rekening baru berhasil dibuat.', 'success');
      } else {
        await api.put(`/rekening/${currentRekeningId}`, rekeningForm);
        showToast('Rekening berhasil diperbarui.', 'success');
      }
      setIsRekeningModalOpen(false);
      fetchFinanceData();
    } catch (error) {
      console.error('Rekening submit error:', error);
      showToast('Gagal menyimpan rekening.', 'error');
    } finally {
      setRekeningSubmitLoading(false);
    }
  };

  const handleRekeningDelete = async (id) => {
    if (!window.confirm('Menghapus rekening akan membuat transaksi penyeimbang pengeluaran jika saldonya lebih dari 0. Lanjutkan?')) return;

    try {
      await api.delete(`/rekening/${id}`);
      showToast('Rekening berhasil dihapus.', 'success');
      fetchFinanceData();
    } catch (error) {
      console.error('Rekening delete error:', error);
      showToast('Gagal menghapus rekening.', 'error');
    }
  };

  // --- Transaksi (Transaction) Handlers ---
  const openAddTransaksiModal = () => {
    if (rekenings.length === 0) {
      showToast('Buat rekening terlebih dahulu sebelum melakukan transaksi.', 'warning');
      return;
    }
    setTransaksiForm({
      rekening_id: rekenings[0].id,
      jenis: 'pengeluaran',
      keterangan: '',
      jumlah: ''
    });
    setIsTransaksiModalOpen(true);
  };

  const handleTransaksiSubmit = async (e) => {
    e.preventDefault();
    if (!transaksiForm.rekening_id || !transaksiForm.jumlah || !transaksiForm.keterangan) {
      showToast('Semua input transaksi wajib diisi.', 'warning');
      return;
    }

    setTransaksiSubmitLoading(true);
    try {
      await api.post('/transaksi', {
        ...transaksiForm,
        jumlah: parseFloat(transaksiForm.jumlah)
      });
      showToast('Transaksi baru berhasil ditambahkan.', 'success');
      setIsTransaksiModalOpen(false);
      fetchFinanceData();
    } catch (error) {
      console.error('Transaksi submit error:', error);
      showToast(error.response?.data?.message || 'Gagal menambahkan transaksi.', 'error');
    } finally {
      setTransaksiSubmitLoading(false);
    }
  };

  const formatRupiah = (val) => {
    const num = parseInt(val || '0');
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const parseNumber = (val) => parseInt(val || '0');

  // Chart calculation
  const totalIn = parseNumber(stats.pemasukan);
  const totalOut = parseNumber(stats.pengeluaran);
  const totalBoth = totalIn + totalOut;
  const inPercentage = totalBoth > 0 ? (totalIn / totalBoth) * 100 : 50;
  const outPercentage = totalBoth > 0 ? (totalOut / totalBoth) * 100 : 50;

  return (
    <div className="finance-wrapper">
      {/* Monthly Summary & SVG Chart */}
      <div className="finance-overview-grid">
        <div className="glass-card stat-ledger-summary">
          <div className="overall-balance">
            <span className="subtitle">Total Saldo Terkumpul</span>
            <h1 className="balance-amount">{formatRupiah(stats.saldo)}</h1>
          </div>

          <div className="monthly-stats-row">
            <div className="m-stat-box in">
              <div className="m-stat-icon green"><TrendingUp size={16} /></div>
              <div className="m-stat-text">
                <span className="label">Pemasukan Bulan Ini</span>
                <span className="value">{formatRupiah(stats.pemasukan)}</span>
              </div>
            </div>

            <div className="m-stat-box out">
              <div className="m-stat-icon red"><TrendingDown size={16} /></div>
              <div className="m-stat-text">
                <span className="label">Pengeluaran Bulan Ini</span>
                <span className="value">{formatRupiah(stats.pengeluaran)}</span>
              </div>
            </div>

            <div className="m-stat-box diff">
              <div className="m-stat-icon blue"><DollarSign size={16} /></div>
              <div className="m-stat-text">
                <span className="label">Selisih Aliran Kas</span>
                <span className={`value ${parseNumber(stats.selisih) >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatRupiah(stats.selisih)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SVG Visualization */}
        <div className="glass-card visual-chart-box">
          <h3>Rasio Kas Bulan Ini</h3>
          {totalBoth > 0 ? (
            <div className="chart-content">
              <svg viewBox="0 0 100 100" className="donut-chart">
                {/* Background circle */}
                <circle cx="50" cy="50" r="38" className="donut-hole" fill="transparent"></circle>
                <circle cx="50" cy="50" r="38" className="donut-ring" fill="transparent" stroke="var(--bg-tertiary)" strokeWidth="8"></circle>

                {/* Income segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="var(--success)"
                  strokeWidth="8"
                  strokeDasharray={`${inPercentage * 2.38} 238`}
                  strokeDashoffset="0"
                ></circle>

                {/* Expense segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="var(--danger)"
                  strokeWidth="8"
                  strokeDasharray={`${outPercentage * 2.38} 238`}
                  strokeDashoffset={`-${inPercentage * 2.38}`}
                ></circle>
              </svg>

              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-dot green"></span>
                  <span className="legend-label">Pemasukan ({inPercentage.toFixed(0)}%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot red"></span>
                  <span className="legend-label">Pengeluaran ({outPercentage.toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-chart-state">
              <AlertTriangle size={20} color="var(--text-muted)" />
              <p>Belum ada data transaksi di bulan ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Accounts & Ledger */}
      <div className="finance-content-grid">
        {/* Left Column: Rekening / Wallets */}
        <div className="accounts-column">
          <div className="column-header">
            <h3>Rekening / Dompet Keuangan</h3>
            <button onClick={openAddRekeningModal} className="btn-small-add">
              <Plus size={14} /> Baru
            </button>
          </div>

          {loading ? (
            <div className="finance-loading"><Loader2 className="animate-spin" /></div>
          ) : rekenings.length > 0 ? (
            <div className="wallets-list">
              {rekenings.map(rek => (
                <div key={rek.id} className="glass-card wallet-card">
                  <div className="wallet-card-top">
                    <div className="wallet-icon-title">
                      <Wallet size={16} color="var(--accent-primary)" />
                      <h4>{rek.nama}</h4>
                    </div>
                    <div className="wallet-actions">
                      <button onClick={() => openEditRekeningModal(rek)} className="rek-action-btn edit"><Edit3 size={12} /></button>
                      <button onClick={() => handleRekeningDelete(rek.id)} className="rek-action-btn delete"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <div className="wallet-card-balance">
                    {formatRupiah(rek.saldo)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card empty-sub-state">
              <p>Tidak ada rekening terdaftar.</p>
            </div>
          )}
        </div>

        {/* Right Column: Transactions Ledger */}
        <div className="ledger-column">
          <div className="column-header">
            <h3>Buku Arus Kas (Transaksi)</h3>
            <div className="header-actions">
              {/* Date Filters */}
              <div className="date-filters">
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="filter-select-sm"
                >
                  {MONTHS.map(m => (
                    <option key={m.val} value={m.val}>{m.name}</option>
                  ))}
                </select>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="filter-select-sm"
                >
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button onClick={openAddTransaksiModal} className="btn-primary">
                <Plus size={16} /> Tambah Transaksi
              </button>
            </div>
          </div>

          {loading ? (
            <div className="finance-loading"><Loader2 className="animate-spin" /></div>
          ) : transactions.length > 0 ? (
            <div className="ledger-list glass-card">
              <div className="table-responsive">
                <table className="ledger-table">
                  <thead>
                    <tr>
                      <th>Keterangan</th>
                      <th>Dompet</th>
                      <th>Waktu</th>
                      <th className="text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((trx) => {
                      const isIn = trx.jenis === 'pemasukan';
                      return (
                        <tr key={trx.id}>
                          <td>
                            <div className="trx-desc-cell">
                              <span className={`trx-indicator-dot ${isIn ? 'green' : 'red'}`}></span>
                              <span>{trx.keterangan}</span>
                            </div>
                          </td>
                          <td>
                            <span className="rekening-badge">
                              {trx.rekening ? trx.rekening.nama : 'Unknown'}
                            </span>
                          </td>
                          <td>
                            <span className="trx-time">
                              {new Date(trx.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </td>
                          <td className={`text-right font-bold ${isIn ? 'text-success' : 'text-danger'}`}>
                            {isIn ? '+' : '-'} {formatRupiah(trx.jumlah)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass-card empty-sub-state">
              <AlertTriangle size={24} color="var(--text-muted)" />
              <p>Tidak ada transaksi tercatat di bulan {MONTHS.find(m => m.val === filterMonth)?.name} {filterYear}.</p>
            </div>
          )}
        </div>
      </div>

      {/* Rekening Modal */}
      <Modal
        isOpen={isRekeningModalOpen}
        onClose={() => setIsRekeningModalOpen(false)}
        title={rekeningModalType === 'add' ? 'Buat Rekening Keuangan' : 'Edit Rekening'}
      >
        <form onSubmit={handleRekeningSubmit} className="finance-modal-form">
          <div className="form-group">
            <label className="form-label">Nama Rekening / Dompet</label>
            <input
              type="text"
              value={rekeningForm.nama}
              onChange={(e) => setRekeningForm(prev => ({ ...prev, nama: e.target.value }))}
              className="form-input"
              placeholder="Contoh: Cash, Bank BCA, E-Wallet"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Saldo Saat Ini (Rp)</label>
            <input
              type="number"
              value={rekeningForm.saldo}
              onChange={(e) => setRekeningForm(prev => ({ ...prev, saldo: e.target.value }))}
              className="form-input"
              placeholder="Contoh: 1500000"
              required
            />
            <span className="form-helper-text">Jika mengedit saldo, backend akan secara otomatis membuat transaksi penyesuaian.</span>
          </div>

          <div className="modal-actions-row">
            <button type="button" onClick={() => setIsRekeningModalOpen(false)} className="btn-secondary" disabled={rekeningSubmitLoading}>Batal</button>
            <button type="submit" className="btn-primary" disabled={rekeningSubmitLoading}>
              {rekeningSubmitLoading ? <Loader2 className="animate-spin" size={16} /> : 'Simpan Rekening'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Transaksi Modal */}
      <Modal
        isOpen={isTransaksiModalOpen}
        onClose={() => setIsTransaksiModalOpen(false)}
        title="Catat Transaksi Keuangan"
      >
        <form onSubmit={handleTransaksiSubmit} className="finance-modal-form">
          <div className="form-group">
            <label className="form-label">Pilih Rekening / Dompet</label>
            <select
              value={transaksiForm.rekening_id}
              onChange={(e) => setTransaksiForm(prev => ({ ...prev, rekening_id: e.target.value }))}
              className="form-select"
              required
            >
              {rekenings.map(rek => (
                <option key={rek.id} value={rek.id}>{rek.nama} (Saldo: {formatRupiah(rek.saldo)})</option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Jenis Transaksi</label>
              <select
                value={transaksiForm.jenis}
                onChange={(e) => setTransaksiForm(prev => ({ ...prev, jenis: e.target.value }))}
                className="form-select"
                required
              >
                <option value="pengeluaran">Pengeluaran (Uang Keluar)</option>
                <option value="pemasukan">Pemasukan (Uang Masuk)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Jumlah Uang (Rp)</label>
              <input
                type="number"
                min="0"
                value={transaksiForm.jumlah}
                onChange={(e) => setTransaksiForm(prev => ({ ...prev, jumlah: e.target.value }))}
                className="form-input"
                placeholder="Contoh: 50000"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Keterangan Catatan</label>
            <input
              type="text"
              value={transaksiForm.keterangan}
              onChange={(e) => setTransaksiForm(prev => ({ ...prev, keterangan: e.target.value }))}
              className="form-input"
              placeholder="Contoh: Makan siang, Gaji Bulanan, Tagihan Internet"
              required
            />
          </div>

          <div className="modal-actions-row">
            <button type="button" onClick={() => setIsTransaksiModalOpen(false)} className="btn-secondary" disabled={transaksiSubmitLoading}>Batal</button>
            <button type="submit" className="btn-primary" disabled={transaksiSubmitLoading}>
              {transaksiSubmitLoading ? <Loader2 className="animate-spin" size={16} /> : 'Catat Transaksi'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .finance-wrapper {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .finance-overview-grid {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 1.5rem;
        }

        @media (max-width: 992px) {
          .finance-overview-grid {
            grid-template-columns: 1fr;
          }
        }

        .stat-ledger-summary {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 2rem;
        }

        .overall-balance .subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .overall-balance .balance-amount {
          font-family: 'Outfit', sans-serif;
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 4px;
        }

        .monthly-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
        }

        .m-stat-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          padding: 1rem;
          border-radius: var(--radius-md);
        }

        .m-stat-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .m-stat-icon.green { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .m-stat-icon.red { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
        .m-stat-icon.blue { background: rgba(7, 156, 210, 0.1); color: var(--accent-primary); }

        .m-stat-text {
          display: flex;
          flex-direction: column;
        }

        .m-stat-text .label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .m-stat-text .value {
          font-size: 0.95rem;
          font-weight: 700;
        }

        .visual-chart-box {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          align-items: center;
        }

        .visual-chart-box h3 {
          font-size: 1rem;
          align-self: flex-start;
        }

        .chart-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          width: 100%;
        }

        .donut-chart {
          width: 120px;
          height: 120px;
          transform: rotate(-90deg);
        }

        .chart-legend {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-dot.green { background: var(--success); }
        .legend-dot.red { background: var(--danger); }

        .empty-chart-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 150px;
          color: var(--text-muted);
          gap: 8px;
          font-size: 0.85rem;
        }

        .finance-content-grid {
          display: grid;
          grid-template-columns: 0.7fr 1.3fr;
          gap: 1.5rem;
        }

        @media (max-width: 992px) {
          .finance-content-grid {
            grid-template-columns: 1fr;
          }
        }

        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          min-height: 40px;
        }

        .column-header h3 {
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .btn-small-add {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: rgba(7, 156, 210, 0.1);
        border: 1px solid rgba(7, 156, 210, 0.2);
        color: var(--accent-primary);
        padding: 6px 12px;
        font-size: 0.8rem;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
        font-family: var(--font-family);
        transition: var(--transition-smooth);
      }

      .btn-small-add:hover {
        background: var(--accent-primary);
        color: white;
      }

        .wallets-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .wallet-card {
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .wallet-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .wallet-icon-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .wallet-icon-title h4 {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .wallet-actions {
          display: flex;
          gap: 4px;
        }

        .rek-action-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 3px;
          border-radius: 4px;
          transition: var(--transition-smooth);
        }

        .rek-action-btn:hover {
          color: var(--text-primary);
          background-color: rgba(255, 255, 255, 0.05);
        }

        .rek-action-btn.edit:hover { color: var(--accent-primary); }
        .rek-action-btn.delete:hover { color: var(--danger); }

        .wallet-card-balance {
          font-family: 'Outfit', sans-serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .date-filters {
          display: flex;
          gap: 6px;
        }

        .filter-select-sm {
        background: linear-gradient(135deg, rgba(7, 156, 210, 0.08), rgba(138, 147, 215, 0.05));
        border: 1px solid rgba(7, 156, 210, 0.25);
        color: var(--accent-primary);
        padding: 6px 12px;
        border-radius: 20px;
        font-family: var(--font-family);
        font-size: 0.8rem;
        font-weight: 600;
        outline: none;
        cursor: pointer;
        transition: var(--transition-smooth);
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23079CD2' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
        padding-right: 28px;
      }

      .filter-select-sm:hover {
        border-color: rgba(7, 156, 210, 0.5);
        background-color: rgba(7, 156, 210, 0.12);
      }

      .filter-select-sm:focus {
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 2px rgba(7, 156, 210, 0.15);
      }

        .ledger-list {
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0;
          overflow: hidden;
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .ledger-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.875rem;
        }

        .ledger-table th, .ledger-table td {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .ledger-table th {
          background: rgba(255, 255, 255, 0.01);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .ledger-table tr:last-child td {
          border-bottom: none;
        }

        .trx-desc-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }

        .trx-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .trx-indicator-dot.green { background-color: var(--success); }
        .trx-indicator-dot.red { background-color: var(--danger); }

        .rekening-badge {
          background: rgba(7, 156, 210, 0.08);
          color: var(--accent-primary);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .trx-time {
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .text-right { text-align: right; }
        .font-bold { font-weight: 600; }

        .finance-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100px;
          color: var(--text-secondary);
        }

        .empty-sub-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1rem;
          gap: 10px;
          color: var(--text-muted);
          font-size: 0.875rem;
          border: 1px dashed var(--glass-border);
        }

        .finance-modal-form {
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
      `}</style>
    </div>
  );
};

export default FinancePage;
