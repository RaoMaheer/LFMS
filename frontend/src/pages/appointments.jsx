import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments, addAppointment, updateAppointment, deleteAppointment } from '../store/appointmentsSlice';
import { Calendar, Plus, Edit, Trash2, X, Clock, MapPin, User, Briefcase, Search, CheckCircle, Scale, Filter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const EMPTY_FORM = { case_id: '', lawyer_id: '', client_id: '', appointment_date: '', location: '', purpose: '', status: 'Scheduled' };

const STATUS_STYLES = {
  Scheduled:   { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', accent: '#3b82f6' },
  Completed:   { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e', accent: '#22c55e' },
  Cancelled:   { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', accent: '#ef4444' },
  Rescheduled: { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24', accent: '#fbbf24' },
};

const getStyle   = (status) => STATUS_STYLES[status] || STATUS_STYLES.Scheduled;
const fmtDate    = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
const fmtTime    = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const isUpcoming = (d) => new Date(d) >= new Date();

const Appointments = () => {
  const dispatch = useDispatch();
  const { items: appointments, loading, error } = useSelector((s) => s.appointments);
  const { role } = useSelector((s) => s.auth);
  const { isDark } = useTheme();
  const isAdmin = role === 'admin';

  const bg          = isDark ? '#0b1220'                : '#f1f5f9';
  const cardBg      = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textMain    = isDark ? 'white'                  : '#1e293b';
  const textSub     = isDark ? 'rgba(255,255,255,0.5)'  : 'rgba(0,0,0,0.45)';
  const inputBg     = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const innerBg     = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc';
  const innerBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const modalBg     = isDark ? '#111827'                : '#ffffff';
  const modalBorder = isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.1)';
  const inputField  = isDark ? 'bg-dark border-secondary text-white' : 'border text-dark';

  const [search,         setSearch]         = useState('');
  const [filter,         setFilter]         = useState('All');
  const [filterClientId, setFilterClientId] = useState('');
  const [filterLawyerId, setFilterLawyerId] = useState('');
  const [showModal,      setShowModal]      = useState(false);
  const [editMode,       setEditMode]       = useState(false);
  const [currentId,      setCurrentId]      = useState(null);
  const [formData,       setFormData]       = useState(EMPTY_FORM);

  useEffect(() => { dispatch(fetchAppointments()); }, [dispatch]);

  const filtered = appointments
    .filter((a) => {
      const matchSearch = a.purpose?.toLowerCase().includes(search.toLowerCase()) || a.location?.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'All' || a.status === filter;
      const matchClient = filterClientId === '' || String(a.client_id) === filterClientId.trim();
      const matchLawyer = filterLawyerId === '' || String(a.lawyer_id) === filterLawyerId.trim();
      return matchSearch && matchFilter && matchClient && matchLawyer;
    })
    .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));

  const totalCount     = appointments.length;
  const upcomingCount  = appointments.filter(a => isUpcoming(a.appointment_date)).length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'Cancelled').length;

  const openModal = (item = null) => {
    if (item) {
      setEditMode(true); setCurrentId(item.appointment_id);
      setFormData({ case_id: item.case_id || '', lawyer_id: item.lawyer_id || '', client_id: item.client_id || '', appointment_date: item.appointment_date ? item.appointment_date.slice(0, 16) : '', location: item.location || '', purpose: item.purpose || '', status: item.status || 'Scheduled' });
    } else { setEditMode(false); setCurrentId(null); setFormData(EMPTY_FORM); }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) await dispatch(updateAppointment({ id: currentId, data: formData })).unwrap();
      else await dispatch(addAppointment(formData)).unwrap();
      setShowModal(false); setFormData(EMPTY_FORM);
    } catch { alert('Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try { await dispatch(deleteAppointment(id)).unwrap(); } catch { alert('Delete failed'); }
  };

  const field = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));
  const hasIdFilters = filterClientId !== '' || filterLawyerId !== '';

  return (
    <div className="min-vh-100 p-4 p-lg-5" style={{ background: bg, color: textMain, transition: 'all 0.3s ease' }}>

      {/* HEADER */}
      <div className="d-flex flex-wrap justify-content-between align-items-start mb-5 gap-3">
        <div>
          <div className="d-flex align-items-center gap-3 mb-1">
            <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.15)' }}><Calendar size={24} className="text-warning" /></div>
            <h2 className="fw-bold mb-0" style={{ color: textMain }}>Appointments</h2>
          </div>
          <small style={{ color: textSub }}>Manage client and lawyer meetings</small>
        </div>
        {isAdmin && (
          <button onClick={() => openModal()} className="btn fw-bold d-flex align-items-center gap-2 rounded-pill px-4 py-2" style={{ background: '#fbbf24', color: '#0b1220' }}>
            <Plus size={18} /> New Appointment
          </button>
        )}
      </div>

      {/* STATS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total',     value: totalCount,     color: '#60a5fa', bg: 'rgba(59,130,246,0.1)'  },
          { label: 'Upcoming',  value: upcomingCount,  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
          { label: 'Completed', value: completedCount, color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
          { label: 'Cancelled', value: cancelledCount, color: '#f87171', bg: 'rgba(239,68,68,0.1)'   },
        ].map((s) => (
          <div className="col-6 col-lg-3" key={s.label}>
            <div className="rounded-4 p-3"
              style={{ background: isDark ? s.bg : '#fff', border: `1px solid ${isDark ? s.color + '22' : 'rgba(0,0,0,0.08)'}`, boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div className="fw-bold fs-4" style={{ color: s.color }}>{s.value}</div>
              <div className="small" style={{ color: textSub }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH + FILTER */}
      <div className="d-flex flex-wrap gap-3 mb-3">
        <div className="d-flex align-items-center px-3 py-2 rounded-pill flex-grow-1"
          style={{ background: inputBg, border: `1px solid ${inputBorder}`, maxWidth: '380px' }}>
          <Search size={15} style={{ color: textSub }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search purpose or location..."
            className="form-control bg-transparent border-0 shadow-none ms-2 p-0" style={{ fontSize: '14px', color: textMain }} />
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {['All', 'Scheduled', 'Completed', 'Cancelled', 'Rescheduled'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="btn btn-sm rounded-pill px-3 fw-bold"
              style={{ background: filter === f ? '#fbbf24' : inputBg, color: filter === f ? '#0b1220' : textSub, border: 'none', fontSize: '12px' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ID FILTERS */}
      <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
        <div className="d-flex align-items-center gap-2"><Filter size={14} style={{ color: textSub }} /><span className="small fw-semibold" style={{ color: textSub }}>Filter by ID:</span></div>
        {[['Client ID', filterClientId, setFilterClientId, User], ['Lawyer ID', filterLawyerId, setFilterLawyerId, Scale]].map(([label, val, setter, Icon]) => (
          <div key={label} className="d-flex align-items-center px-3 py-2 rounded-pill"
            style={{ background: inputBg, border: `1px solid ${inputBorder}`, width: '160px' }}>
            <Icon size={13} style={{ color: textSub, flexShrink: 0 }} />
            <input type="number" value={val} onChange={(e) => setter(e.target.value)} placeholder={label}
              className="form-control bg-transparent border-0 shadow-none ms-2 p-0" style={{ fontSize: '13px', color: textMain }} />
          </div>
        ))}
        {hasIdFilters && (
          <>
            <button onClick={() => { setFilterClientId(''); setFilterLawyerId(''); }}
              className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', fontSize: '12px' }}>
              <X size={12} /> Clear
            </button>
            <span className="small" style={{ color: textSub }}>Showing <span className="fw-semibold" style={{ color: textMain }}>{filtered.length}</span> results</span>
          </>
        )}
      </div>

      {loading && <div className="text-center py-5" style={{ color: textSub }}>Loading appointments...</div>}
      {error   && <div className="alert alert-danger">{typeof error === 'string' ? error : 'Something went wrong'}</div>}

      {/* CARDS */}
      {!loading && (
        <div className="row g-4">
          {filtered.length > 0 ? filtered.map((a) => {
            const s = getStyle(a.status);
            const upcoming = isUpcoming(a.appointment_date);
            return (
              <div className="col-12 col-md-6 col-xl-4" key={a.appointment_id}>
                <div className="rounded-4 h-100 d-flex flex-column overflow-hidden"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ height: '3px', background: s.accent }} />
                  <div className="p-4 d-flex flex-column flex-grow-1">

                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="p-2 rounded-3" style={{ background: `${s.accent}22` }}><Calendar size={15} style={{ color: s.accent }} /></div>
                        <span className="small" style={{ color: textSub }}>#{a.appointment_id}</span>
                      </div>
                      <span className="px-3 py-1 rounded-pill" style={{ fontSize: '11px', fontWeight: 600, background: s.bg, color: s.color }}>{a.status}</span>
                    </div>

                    <h5 className="fw-bold mb-3" style={{ lineHeight: 1.3, color: textMain }}>{a.purpose}</h5>

                    <div className="rounded-3 p-3 mb-3 d-flex align-items-center gap-3" style={{ background: innerBg, border: `1px solid ${innerBorder}` }}>
                      <div className="text-center px-3 py-2 rounded-3 flex-shrink-0" style={{ background: `${s.accent}18`, minWidth: '56px' }}>
                        <div className="fw-bold" style={{ fontSize: '22px', color: s.accent, lineHeight: 1 }}>{new Date(a.appointment_date).getDate()}</div>
                        <div className="text-uppercase" style={{ fontSize: '10px', color: s.color, letterSpacing: '1px' }}>
                          {new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <div className="fw-semibold small" style={{ color: textMain }}>{fmtDate(a.appointment_date)}</div>
                        <div className="d-flex align-items-center gap-1 mt-1" style={{ fontSize: '12px', color: textSub }}><Clock size={12} /> {fmtTime(a.appointment_date)}</div>
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-2 mb-4">
                      <div className="d-flex align-items-center gap-2 small" style={{ color: textSub }}>
                        <MapPin size={13} className="flex-shrink-0" /><span style={{ color: textMain }}>{a.location}</span>
                      </div>
                      <div className="d-flex align-items-center gap-3 small" style={{ color: textSub }}>
                        <div className="d-flex align-items-center gap-1"><User size={13} /> Client: <span style={{ color: textMain }} className="ms-1">{a.client_id}</span></div>
                        <div className="d-flex align-items-center gap-1"><Briefcase size={13} /> Lawyer: <span style={{ color: textMain }} className="ms-1">{a.lawyer_id}</span></div>
                      </div>
                      <div className="d-flex align-items-center gap-1 small" style={{ color: textSub }}>
                        <CheckCircle size={13} /> Case: <span style={{ color: textMain }} className="ms-1">#{a.case_id}</span>
                      </div>
                    </div>

                    {upcoming && a.status === 'Scheduled' && (
                      <div className="rounded-3 px-3 py-2 mb-3 small fw-semibold text-center"
                        style={{ background: 'rgba(251,191,36,0.08)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.15)' }}>
                        ⏳ Upcoming meeting
                      </div>
                    )}

                    {isAdmin && (
                      <div className="d-flex gap-2 mt-auto">
                        <button onClick={() => openModal(a)} className="btn btn-sm flex-grow-1 rounded-pill fw-bold"
                          style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', fontSize: '13px' }}>
                          <Edit size={13} className="me-1" /> Edit
                        </button>
                        <button onClick={() => handleDelete(a.appointment_id)} className="btn btn-sm rounded-pill"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 14px' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : <div className="col-12 text-center py-5" style={{ color: textSub }}>No appointments found</div>}
        </div>
      )}

      {/* MODAL */}
      {showModal && isAdmin && (
        <div className="appt-overlay d-flex align-items-center justify-content-center">
          <div className="p-4" style={{ background: modalBg, color: textMain, width: '500px', borderRadius: '20px', border: `1px solid ${modalBorder}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-2">
                <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.15)' }}><Calendar size={18} className="text-warning" /></div>
                <h5 className="mb-0 fw-bold" style={{ color: textMain }}>{editMode ? 'Edit Appointment' : 'New Appointment'}</h5>
              </div>
              <X style={{ cursor: 'pointer', color: textSub }} onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                {[['Case ID', 'case_id'], ['Lawyer ID', 'lawyer_id'], ['Client ID', 'client_id']].map(([label, key]) => (
                  <div className="col-4" key={key}>
                    <label className="small mb-1" style={{ color: textSub }}>{label}</label>
                    <input type="number" required value={formData[key]} onChange={(e) => field(key, e.target.value)}
                      className={`form-control ${inputField}`} style={{ borderRadius: '10px', background: isDark ? '#1f2937' : '#f8fafc', color: textMain }} />
                  </div>
                ))}
              </div>
              <div className="mb-3">
                <label className="small mb-1" style={{ color: textSub }}>Date & Time</label>
                <input type="datetime-local" required value={formData.appointment_date} onChange={(e) => field('appointment_date', e.target.value)}
                  className={`form-control ${inputField}`} style={{ borderRadius: '10px', colorScheme: isDark ? 'dark' : 'light', background: isDark ? '#1f2937' : '#f8fafc', color: textMain }} />
              </div>
              <div className="mb-3">
                <label className="small mb-1" style={{ color: textSub }}>Location</label>
                <input type="text" required value={formData.location} onChange={(e) => field('location', e.target.value)}
                  placeholder="e.g. 601 Lexington Ave, NY"
                  className={`form-control ${inputField}`} style={{ borderRadius: '10px', background: isDark ? '#1f2937' : '#f8fafc', color: textMain }} />
              </div>
              <div className="mb-3">
                <label className="small mb-1" style={{ color: textSub }}>Purpose</label>
                <textarea rows={2} required value={formData.purpose} onChange={(e) => field('purpose', e.target.value)}
                  placeholder="e.g. Strategy session for case review"
                  className={`form-control ${inputField}`} style={{ borderRadius: '10px', resize: 'none', background: isDark ? '#1f2937' : '#f8fafc', color: textMain }} />
              </div>
              <div className="mb-4">
                <label className="small mb-1" style={{ color: textSub }}>Status</label>
                <select value={formData.status} onChange={(e) => field('status', e.target.value)}
                  className={`form-select ${inputField}`} style={{ borderRadius: '10px', background: isDark ? '#1f2937' : '#f8fafc', color: textMain }}>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rescheduled">Rescheduled</option>
                </select>
              </div>
              <button type="submit" className="btn w-100 py-2 fw-bold rounded-pill" style={{ background: '#fbbf24', color: '#0b1220' }}>
                {editMode ? 'Save Changes' : 'Book Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .appt-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; backdrop-filter: blur(5px); }
        .form-control:focus, .form-select:focus { box-shadow: none !important; border-color: rgba(251,191,36,0.4) !important; }
        .form-control::placeholder { color: ${textSub} !important; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
};

export default Appointments;