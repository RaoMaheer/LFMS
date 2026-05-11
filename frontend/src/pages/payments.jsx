import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPayments, addPayment,
  updatePayment, deletePayment
} from '../store/paymentsSlice';
import {
  CreditCard, Plus, Edit, Trash2, X,
  Search, FileText, Download, CheckCircle,
  Clock, AlertCircle, Banknote, Receipt
} from 'lucide-react';

// ── helpers & constants OUTSIDE component ───────────────────────────────────

const EMPTY_FORM = {
  case_id: '', amount: '', payment_date: '',
  payment_method: 'Wire Transfer', payment_status: 'Pending',
  transaction_id: '', notes: ''
};

const STATUS_STYLES = {
  Completed: { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e', accent: '#22c55e', icon: CheckCircle },
  Pending:   { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24', accent: '#fbbf24', icon: Clock       },
  Failed:    { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', accent: '#ef4444', icon: AlertCircle },
  Refunded:  { bg: 'rgba(139,92,246,0.15)',  color: '#a78bfa', accent: '#8b5cf6', icon: Receipt     },
};

const getStyle = (status) => STATUS_STYLES[status] || STATUS_STYLES.Pending;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const fmtAmount = (amt) =>
  parseFloat(amt).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

// ── Invoice generator ────────────────────────────────────────────────────────
const generateInvoice = (payment) => {
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Invoice #${payment.payment_id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; padding: 40px; }
        .invoice-box { max-width: 720px; margin: auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #0b1220, #1f2937); color: white; padding: 40px; }
        .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .firm-name { font-size: 28px; font-weight: 800; letter-spacing: 1px; color: #fbbf24; }
        .firm-sub { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 4px; letter-spacing: 2px; text-transform: uppercase; }
        .invoice-label { text-align: right; }
        .invoice-label h2 { font-size: 32px; font-weight: 800; color: #fbbf24; }
        .invoice-label p { font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 4px; }
        .header-divider { border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0; }
        .status-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700;
          background: ${getStyle(payment.payment_status).bg}; color: ${getStyle(payment.payment_status).color}; }
        .body { padding: 40px; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        .meta-box { background: #f8fafc; border-radius: 10px; padding: 16px; border: 1px solid #e2e8f0; }
        .meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 6px; }
        .meta-value { font-size: 15px; font-weight: 600; color: #1e293b; }
        .amount-section { background: linear-gradient(135deg, #0b1220, #1f2937); border-radius: 12px; padding: 28px; margin-bottom: 28px; text-align: center; }
        .amount-label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.5); margin-bottom: 8px; }
        .amount-value { font-size: 48px; font-weight: 800; color: #fbbf24; }
        .notes-box { background: #fffbeb; border-left: 4px solid #fbbf24; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 28px; }
        .notes-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #92400e; margin-bottom: 6px; font-weight: 700; }
        .notes-text { font-size: 14px; color: #78350f; line-height: 1.6; }
        .footer { background: #f8fafc; padding: 24px 40px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; }
        .footer-brand { font-size: 13px; color: #94a3b8; }
        .footer-brand strong { color: #fbbf24; }
        .generated { font-size: 11px; color: #cbd5e1; }
        @media print { body { padding: 0; background: white; } .invoice-box { box-shadow: none; border-radius: 0; } }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div class="header-top">
            <div>
              <div class="firm-name">Specter Litt</div>
              <div class="firm-sub">Elite Legal Management</div>
            </div>
            <div class="invoice-label">
              <h2>INVOICE</h2>
              <p>#INV-${String(payment.payment_id).padStart(5, '0')}</p>
              <div style="margin-top:8px"><span class="status-badge">${payment.payment_status}</span></div>
            </div>
          </div>
          <div class="header-divider"></div>
          <div style="font-size:13px; color:rgba(255,255,255,0.6)">
            Issued: ${fmtDate(payment.payment_date)} &nbsp;·&nbsp; ${fmtTime(payment.payment_date)}
          </div>
        </div>

        <div class="body">
          <div class="meta-grid">
            <div class="meta-box">
              <div class="meta-label">Case Reference</div>
              <div class="meta-value">Case #${payment.case_id}</div>
            </div>
            <div class="meta-box">
              <div class="meta-label">Payment Method</div>
              <div class="meta-value">${payment.payment_method}</div>
            </div>
            <div class="meta-box">
              <div class="meta-label">Transaction ID</div>
              <div class="meta-value">${payment.transaction_id || '—'}</div>
            </div>
            <div class="meta-box">
              <div class="meta-label">Payment Date</div>
              <div class="meta-value">${fmtDate(payment.payment_date)}</div>
            </div>
          </div>

          <div class="amount-section">
            <div class="amount-label">Total Amount</div>
            <div class="amount-value">${fmtAmount(payment.amount)}</div>
          </div>

          ${payment.notes ? `
          <div class="notes-box">
            <div class="notes-label">Notes</div>
            <div class="notes-text">${payment.notes}</div>
          </div>` : ''}
        </div>

        <div class="footer">
          <div class="footer-brand">
            <strong>Specter Litt</strong> · Elite Legal Management System
          </div>
          <div class="generated">Generated ${new Date().toLocaleString()}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  win.document.write(invoiceHTML);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
};

// ── component ────────────────────────────────────────────────────────────────

const Payments = () => {
  const dispatch = useDispatch();
  const { items: payments, loading, error } = useSelector((s) => s.payments);

  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editMode,  setEditMode]  = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData,  setFormData]  = useState(EMPTY_FORM);

  useEffect(() => { dispatch(fetchPayments()); }, [dispatch]);

  const filtered = payments
    .filter((p) => {
      const matchSearch =
        p.notes?.toLowerCase().includes(search.toLowerCase()) ||
        p.payment_method?.toLowerCase().includes(search.toLowerCase()) ||
        String(p.case_id).includes(search);
      const matchFilter = filter === 'All' || p.payment_status === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

  const totalRevenue    = payments.filter(p => p.payment_status === 'Completed')
                                  .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const pendingAmount   = payments.filter(p => p.payment_status === 'Pending')
                                  .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const completedCount  = payments.filter(p => p.payment_status === 'Completed').length;
  const pendingCount    = payments.filter(p => p.payment_status === 'Pending').length;

  const openModal = (item = null) => {
    if (item) {
      setEditMode(true);
      setCurrentId(item.payment_id);
      setFormData({
        case_id:        item.case_id        || '',
        amount:         item.amount         || '',
        payment_date:   item.payment_date   ? item.payment_date.slice(0, 16) : '',
        payment_method: item.payment_method || 'Wire Transfer',
        payment_status: item.payment_status || 'Pending',
        transaction_id: item.transaction_id || '',
        notes:          item.notes          || '',
      });
    } else {
      setEditMode(false);
      setCurrentId(null);
      setFormData(EMPTY_FORM);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await dispatch(updatePayment({ id: currentId, data: formData })).unwrap();
      } else {
        await dispatch(addPayment(formData)).unwrap();
      }
      setShowModal(false);
      setFormData(EMPTY_FORM);
    } catch {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment?')) return;
    try { await dispatch(deletePayment(id)).unwrap(); }
    catch { alert('Delete failed'); }
  };

  const field = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-vh-100 p-4 p-lg-5 text-white" style={{ background: '#0b1220' }}>

      {/* HEADER */}
      <div className="d-flex flex-wrap justify-content-between align-items-start mb-5 gap-3">
        <div>
          <div className="d-flex align-items-center gap-3 mb-1">
            <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.15)' }}>
              <CreditCard size={24} className="text-warning" />
            </div>
            <h2 className="fw-bold mb-0">Payments</h2>
          </div>
          <small className="text-white-50 ms-1">Track billing, transactions and invoices</small>
        </div>
        <button
          onClick={() => openModal()}
          className="btn fw-bold d-flex align-items-center gap-2 rounded-pill px-4 py-2"
          style={{ background: '#fbbf24', color: '#0b1220' }}
        >
          <Plus size={18} /> New Payment
        </button>
      </div>

      {/* STATS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Revenue',   value: fmtAmount(totalRevenue),  color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
          { label: 'Pending Amount',  value: fmtAmount(pendingAmount), color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
          { label: 'Completed',       value: completedCount,           color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Pending',         value: pendingCount,             color: '#fb923c', bg: 'rgba(249,115,22,0.1)' },
        ].map((s) => (
          <div className="col-6 col-lg-3" key={s.label}>
            <div className="rounded-4 p-3" style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
              <div className="fw-bold fs-5" style={{ color: s.color }}>{s.value}</div>
              <div className="small text-white-50">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH + FILTER */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <div
          className="d-flex align-items-center px-3 py-2 rounded-pill flex-grow-1"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            maxWidth: '380px'
          }}
        >
          <Search size={15} className="text-white-50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, method, case..."
            className="form-control bg-transparent border-0 text-white shadow-none ms-2 p-0"
            style={{ fontSize: '14px' }}
          />
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {['All', 'Completed', 'Pending', 'Failed', 'Refunded'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="btn btn-sm rounded-pill px-3 fw-bold"
              style={{
                background: filter === f ? '#fbbf24' : 'rgba(255,255,255,0.06)',
                color:      filter === f ? '#0b1220'  : 'rgba(255,255,255,0.6)',
                border: 'none', fontSize: '12px'
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING / ERROR */}
      {loading && <div className="text-center py-5 text-white-50">Loading payments...</div>}
      {error   && <div className="alert alert-danger">{typeof error === 'string' ? error : 'Something went wrong'}</div>}

      {/* CARDS */}
      {!loading && (
        <div className="row g-4">
          {filtered.length > 0 ? filtered.map((p) => {
            const s        = getStyle(p.payment_status);
            const StatusIcon = s.icon;
            return (
              <div className="col-12 col-md-6 col-xl-4" key={p.payment_id}>
                <div
                  className="rounded-4 h-100 d-flex flex-column overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {/* ACCENT */}
                  <div style={{ height: '3px', background: s.accent }} />

                  <div className="p-4 d-flex flex-column flex-grow-1">

                    {/* TOP ROW */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="p-2 rounded-3" style={{ background: `${s.accent}22` }}>
                          <Banknote size={15} style={{ color: s.accent }} />
                        </div>
                        <span className="text-white-50 small">
                          #INV-{String(p.payment_id).padStart(5, '0')}
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-pill d-flex align-items-center gap-1"
                        style={{ fontSize: '11px', fontWeight: 600, background: s.bg, color: s.color }}>
                        <StatusIcon size={11} />
                        {p.payment_status}
                      </span>
                    </div>

                    {/* AMOUNT */}
                    <div className="mb-3">
                      <div className="text-white-50 small mb-1">Amount</div>
                      <div className="fw-bold" style={{ fontSize: '28px', color: s.color }}>
                        {fmtAmount(p.amount)}
                      </div>
                    </div>

                    {/* META */}
                    <div
                      className="rounded-3 p-3 mb-3"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="d-flex justify-content-between small mb-2">
                        <span className="text-white-50">Case</span>
                        <span className="text-white fw-semibold">#{p.case_id}</span>
                      </div>
                      <div className="d-flex justify-content-between small mb-2">
                        <span className="text-white-50">Method</span>
                        <span className="text-white fw-semibold">{p.payment_method}</span>
                      </div>
                      <div className="d-flex justify-content-between small mb-2">
                        <span className="text-white-50">Date</span>
                        <span className="text-white fw-semibold">{fmtDate(p.payment_date)}</span>
                      </div>
                      {p.transaction_id && (
                        <div className="d-flex justify-content-between small">
                          <span className="text-white-50">Txn ID</span>
                          <span className="text-white fw-semibold" style={{ fontSize: '11px' }}>{p.transaction_id}</span>
                        </div>
                      )}
                    </div>

                    {/* NOTES */}
                    {p.notes && (
                      <div className="d-flex gap-2 mb-3">
                        <FileText size={13} className="text-white-50 mt-1 flex-shrink-0" />
                        <p className="text-white-50 small mb-0" style={{ lineHeight: 1.6 }}>{p.notes}</p>
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div className="d-flex gap-2 mt-auto">
                      <button onClick={() => generateInvoice(p)}
                        className="btn btn-sm rounded-pill fw-bold"
                        style={{
                          background: 'rgba(251,191,36,0.12)', color: '#fbbf24',
                          border: '1px solid rgba(251,191,36,0.2)', fontSize: '12px',
                          padding: '6px 12px'
                        }}>
                        <Download size={13} className="me-1" /> Invoice
                      </button>
                      <button onClick={() => openModal(p)}
                        className="btn btn-sm flex-grow-1 rounded-pill fw-bold"
                        style={{
                          background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
                          border: '1px solid rgba(59,130,246,0.2)', fontSize: '13px'
                        }}>
                        <Edit size={13} className="me-1" /> Edit
                      </button>
                      <button onClick={() => handleDelete(p.payment_id)}
                        className="btn btn-sm rounded-pill"
                        style={{
                          background: 'rgba(239,68,68,0.12)', color: '#f87171',
                          border: '1px solid rgba(239,68,68,0.2)', padding: '6px 14px'
                        }}>
                        <Trash2 size={13} />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-12 text-center py-5 text-white-50">No payments found</div>
          )}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="pay-overlay d-flex align-items-center justify-content-center">
          <div className="p-4 text-white"
            style={{
              background: '#111827', width: '500px', borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto'
            }}>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-2">
                <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.15)' }}>
                  <CreditCard size={18} className="text-warning" />
                </div>
                <h5 className="mb-0 fw-bold">{editMode ? 'Edit Payment' : 'New Payment'}</h5>
              </div>
              <X style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
            </div>

            <form onSubmit={handleSubmit}>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="small text-white-50 mb-1">Case ID</label>
                  <input type="number" required value={formData.case_id}
                    onChange={(e) => field('case_id', e.target.value)}
                    className="form-control bg-dark border-secondary text-white"
                    style={{ borderRadius: '10px' }} />
                </div>
                <div className="col-6">
                  <label className="small text-white-50 mb-1">Amount ($)</label>
                  <input type="number" step="0.01" required value={formData.amount}
                    onChange={(e) => field('amount', e.target.value)}
                    placeholder="0.00"
                    className="form-control bg-dark border-secondary text-white"
                    style={{ borderRadius: '10px' }} />
                </div>
              </div>

              <div className="mb-3">
                <label className="small text-white-50 mb-1">Payment Date & Time</label>
                <input type="datetime-local" required value={formData.payment_date}
                  onChange={(e) => field('payment_date', e.target.value)}
                  className="form-control bg-dark border-secondary text-white"
                  style={{ borderRadius: '10px', colorScheme: 'dark' }} />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="small text-white-50 mb-1">Payment Method</label>
                  <select value={formData.payment_method}
                    onChange={(e) => field('payment_method', e.target.value)}
                    className="form-select bg-dark border-secondary text-white"
                    style={{ borderRadius: '10px' }}>
                    <option>Wire Transfer</option>
                    <option>Credit Card</option>
                    <option>Cash</option>
                    <option>Check</option>
                    <option>Bank Transfer</option>
                    <option>Crypto</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="small text-white-50 mb-1">Status</label>
                  <select value={formData.payment_status}
                    onChange={(e) => field('payment_status', e.target.value)}
                    className="form-select bg-dark border-secondary text-white"
                    style={{ borderRadius: '10px' }}>
                    <option>Pending</option>
                    <option>Completed</option>
                    <option>Failed</option>
                    <option>Refunded</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="small text-white-50 mb-1">Transaction ID <span className="opacity-50">(optional)</span></label>
                <input type="text" value={formData.transaction_id}
                  onChange={(e) => field('transaction_id', e.target.value)}
                  placeholder="e.g. TXN-00123"
                  className="form-control bg-dark border-secondary text-white"
                  style={{ borderRadius: '10px' }} />
              </div>

              <div className="mb-4">
                <label className="small text-white-50 mb-1">Notes</label>
                <textarea rows={2} value={formData.notes}
                  onChange={(e) => field('notes', e.target.value)}
                  placeholder="e.g. Retainer for case review"
                  className="form-control bg-dark border-secondary text-white"
                  style={{ borderRadius: '10px', resize: 'none' }} />
              </div>

              <button type="submit"
                className="btn w-100 py-2 fw-bold rounded-pill"
                style={{ background: '#fbbf24', color: '#0b1220' }}>
                {editMode ? 'Save Changes' : 'Record Payment'}
              </button>

            </form>
          </div>
        </div>
      )}

      <style>{`
        .pay-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.8);
          z-index: 2000; backdrop-filter: blur(5px);
        }
        .form-control:focus, .form-select:focus {
          box-shadow: none;
          border-color: rgba(251,191,36,0.4) !important;
        }
        .form-control::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>

    </div>
  );
};

export default Payments;