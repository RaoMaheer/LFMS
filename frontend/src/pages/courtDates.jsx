import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourtDates, addCourtDate, updateCourtDate, deleteCourtDate } from '../store/courtDatesSlice';
import { Gavel, Plus, Edit, Trash2, X, Clock, Search, FileText, Filter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const EMPTY_FORM = { case_id: '', court_name: '', date: '', notes: '' };

const getDateStatus = (dateStr) => {
  const now = new Date(); const d = new Date(dateStr);
  const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)   return { label: 'Past',       bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', accent: '#475569' };
  if (diffDays === 0) return { label: 'Today',      bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24', accent: '#fbbf24' };
  if (diffDays <= 7)  return { label: 'This Week',  bg: 'rgba(249,115,22,0.15)',  color: '#fb923c', accent: '#fb923c' };
  if (diffDays <= 30) return { label: 'This Month', bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', accent: '#60a5fa' };
  return                     { label: 'Upcoming',   bg: 'rgba(34,197,94,0.15)',   color: '#22c55e', accent: '#22c55e' };
};

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const CourtDates = () => {
  const dispatch = useDispatch();
  const { items: courtDates, loading, error } = useSelector((state) => state.courtDates);
  const { role } = useSelector((s) => s.auth);
  const { isDark } = useTheme();
  const isAdmin = role === 'admin';

  const bg         = isDark ? '#0b1220'                : '#f1f5f9';
  const cardBg     = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textMain   = isDark ? 'white'                  : '#1e293b';
  const textSub    = isDark ? 'rgba(255,255,255,0.5)'  : 'rgba(0,0,0,0.45)';
  const inputBg    = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const inputBorder= isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const innerBg    = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc';
  const innerBorder= isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const modalBg    = isDark ? '#111827'                : '#ffffff';
  const modalBorder= isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.1)';
  const inputField = isDark ? 'bg-dark border-secondary text-white' : 'border text-dark';

  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState('all');
  const [filterCaseId, setFilterCaseId] = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [editMode,     setEditMode]     = useState(false);
  const [currentId,    setCurrentId]    = useState(null);
  const [formData,     setFormData]     = useState(EMPTY_FORM);

  useEffect(() => { dispatch(fetchCourtDates()); }, [dispatch]);

  const filtered = courtDates.filter((d) => {
    const matchSearch = d.court_name?.toLowerCase().includes(search.toLowerCase()) || d.notes?.toLowerCase().includes(search.toLowerCase());
    const status = getDateStatus(d.date).label;
    const matchFilter = filter === 'all' || status === filter;
    const matchCase = filterCaseId === '' || String(d.case_id) === filterCaseId.trim();
    return matchSearch && matchFilter && matchCase;
  });

  const sorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));

  const openModal = (item = null) => {
    if (item) { setEditMode(true); setCurrentId(item.court_date_id); setFormData({ case_id: item.case_id || '', court_name: item.court_name || '', date: item.date ? item.date.slice(0, 16) : '', notes: item.notes || '' }); }
    else { setEditMode(false); setCurrentId(null); setFormData(EMPTY_FORM); }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) await dispatch(updateCourtDate({ id: currentId, data: formData })).unwrap();
      else await dispatch(addCourtDate(formData)).unwrap();
      setShowModal(false); setFormData(EMPTY_FORM);
    } catch { alert('Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this court date?')) return;
    try { await dispatch(deleteCourtDate(id)).unwrap(); } catch { alert('Delete failed'); }
  };

  const upcomingCount = courtDates.filter(d => new Date(d.date) >= new Date()).length;
  const thisWeekCount = courtDates.filter(d => { const diff = Math.ceil((new Date(d.date) - new Date()) / (1000 * 60 * 60 * 24)); return diff >= 0 && diff <= 7; }).length;
  const pastCount = courtDates.filter(d => new Date(d.date) < new Date()).length;

  return (
    <div className="min-vh-100 p-4 p-lg-5" style={{ background: bg, color: textMain, transition: 'all 0.3s ease' }}>

      <div className="d-flex flex-wrap justify-content-between align-items-start mb-5 gap-3">
        <div>
          <div className="d-flex align-items-center gap-3 mb-1">
            <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.15)' }}><Gavel size={24} className="text-warning" /></div>
            <h2 className="fw-bold mb-0" style={{ color: textMain }}>Court Dates</h2>
          </div>
          <small style={{ color: textSub }}>Schedule and manage all upcoming hearings</small>
        </div>
        {isAdmin && (
          <button onClick={() => openModal()} className="btn fw-bold d-flex align-items-center gap-2 rounded-pill px-4 py-2" style={{ background: '#fbbf24', color: '#0b1220' }}>
            <Plus size={18} /> Schedule Hearing
          </button>
        )}
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total Scheduled', value: courtDates.length, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)'  },
          { label: 'Upcoming',        value: upcomingCount,      color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
          { label: 'This Week',       value: thisWeekCount,      color: '#fb923c', bg: 'rgba(249,115,22,0.1)'  },
          { label: 'Past',            value: pastCount,          color: '#94a3b8', bg: 'rgba(100,116,139,0.1)' },
        ].map((s) => (
          <div className="col-6 col-lg-3" key={s.label}>
            <div className="rounded-4 p-3" style={{ background: isDark ? s.bg : '#fff', border: `1px solid ${isDark ? s.color + '22' : 'rgba(0,0,0,0.08)'}`, boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div className="fw-bold fs-4" style={{ color: s.color }}>{s.value}</div>
              <div className="small" style={{ color: textSub }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex flex-wrap gap-3 mb-3">
        <div className="d-flex align-items-center px-3 py-2 rounded-pill flex-grow-1" style={{ background: inputBg, border: `1px solid ${inputBorder}`, maxWidth: '380px' }}>
          <Search size={15} style={{ color: textSub }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search court or notes..."
            className="form-control bg-transparent border-0 shadow-none ms-2 p-0" style={{ fontSize: '14px', color: textMain }} />
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {['all', 'Today', 'This Week', 'This Month', 'Upcoming', 'Past'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="btn btn-sm rounded-pill px-3 fw-bold"
              style={{ background: filter === f ? '#fbbf24' : inputBg, color: filter === f ? '#0b1220' : textSub, border: 'none', fontSize: '12px' }}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
        <div className="d-flex align-items-center gap-2"><Filter size={14} style={{ color: textSub }} /><span className="small fw-semibold" style={{ color: textSub }}>Filter by ID:</span></div>
        <div className="d-flex align-items-center px-3 py-2 rounded-pill" style={{ background: inputBg, border: `1px solid ${inputBorder}`, width: '160px' }}>
          <Gavel size={13} style={{ color: textSub, flexShrink: 0 }} />
          <input type="number" value={filterCaseId} onChange={(e) => setFilterCaseId(e.target.value)} placeholder="Case ID"
            className="form-control bg-transparent border-0 shadow-none ms-2 p-0" style={{ fontSize: '13px', color: textMain }} />
        </div>
        {filterCaseId !== '' && (
          <>
            <button onClick={() => setFilterCaseId('')} className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', fontSize: '12px' }}>
              <X size={12} /> Clear
            </button>
            <span className="small" style={{ color: textSub }}>Showing <span className="fw-semibold" style={{ color: textMain }}>{sorted.length}</span> result{sorted.length !== 1 ? 's' : ''}</span>
          </>
        )}
      </div>

      {loading && <div className="text-center py-5" style={{ color: textSub }}>Loading court dates...</div>}
      {error   && <div className="alert alert-danger">{typeof error === 'string' ? error : 'Something went wrong'}</div>}

      {!loading && (
        <div className="row g-4">
          {sorted.length > 0 ? sorted.map((item) => {
            const s = getDateStatus(item.date);
            return (
              <div className="col-12 col-md-6 col-xl-4" key={item.court_date_id}>
                <div className="rounded-4 h-100 d-flex flex-column overflow-hidden"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ height: '3px', background: s.accent }} />
                  <div className="p-4 d-flex flex-column flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="p-2 rounded-3" style={{ background: `${s.accent}22` }}><Gavel size={15} style={{ color: s.accent }} /></div>
                        <span className="small" style={{ color: textSub }}>Case #{item.case_id}</span>
                      </div>
                      <span className="px-3 py-1 rounded-pill" style={{ fontSize: '11px', fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                    <h5 className="fw-bold mb-3" style={{ lineHeight: 1.3, color: textMain }}>{item.court_name}</h5>
                    <div className="rounded-3 p-3 mb-3 d-flex align-items-center gap-3" style={{ background: innerBg, border: `1px solid ${innerBorder}` }}>
                      <div className="text-center px-3 py-2 rounded-3" style={{ background: `${s.accent}18`, minWidth: '56px' }}>
                        <div className="fw-bold" style={{ fontSize: '22px', color: s.accent, lineHeight: 1 }}>{new Date(item.date).getDate()}</div>
                        <div className="text-uppercase" style={{ fontSize: '10px', color: s.color, letterSpacing: '1px' }}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                      </div>
                      <div>
                        <div className="fw-semibold small" style={{ color: textMain }}>{formatDate(item.date)}</div>
                        <div className="d-flex align-items-center gap-1 mt-1" style={{ fontSize: '12px', color: textSub }}><Clock size={12} /> {formatTime(item.date)}</div>
                      </div>
                    </div>
                    {item.notes && (
                      <div className="d-flex gap-2 mb-4">
                        <FileText size={14} style={{ color: textSub, marginTop: '2px', flexShrink: 0 }} />
                        <p className="small mb-0" style={{ lineHeight: 1.6, color: textSub }}>{item.notes}</p>
                      </div>
                    )}
                    {isAdmin && (
                      <div className="d-flex gap-2 mt-auto">
                        <button onClick={() => openModal(item)} className="btn btn-sm flex-grow-1 rounded-pill fw-bold"
                          style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', fontSize: '13px' }}>
                          <Edit size={13} className="me-1" /> Edit
                        </button>
                        <button onClick={() => handleDelete(item.court_date_id)} className="btn btn-sm rounded-pill"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 14px' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : <div className="col-12 text-center py-5" style={{ color: textSub }}>No court dates found</div>}
        </div>
      )}

      {showModal && isAdmin && (
        <div className="modal-overlay d-flex align-items-center justify-content-center">
          <div className="p-4" style={{ background: modalBg, color: textMain, width: '460px', borderRadius: '20px', border: `1px solid ${modalBorder}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-2">
                <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.15)' }}><Gavel size={18} className="text-warning" /></div>
                <h5 className="mb-0 fw-bold" style={{ color: textMain }}>{editMode ? 'Edit Hearing' : 'Schedule Hearing'}</h5>
              </div>
              <X style={{ cursor: 'pointer', color: textSub }} onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              {[['Case ID', 'case_id', 'number'], ['Court Name', 'court_name', 'text']].map(([label, key, type]) => (
                <div className="mb-3" key={key}>
                  <label className="small mb-1" style={{ color: textSub }}>{label}</label>
                  <input type={type} required value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder={key === 'court_name' ? 'e.g. U.S. District Court (SDNY)' : ''}
                    className={`form-control ${inputField}`} style={{ borderRadius: '10px', background: isDark ? '#1f2937' : '#f8fafc', color: textMain }} />
                </div>
              ))}
              <div className="mb-3">
                <label className="small mb-1" style={{ color: textSub }}>Date & Time</label>
                <input type="datetime-local" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`form-control ${inputField}`} style={{ borderRadius: '10px', colorScheme: isDark ? 'dark' : 'light', background: isDark ? '#1f2937' : '#f8fafc', color: textMain }} />
              </div>
              <div className="mb-4">
                <label className="small mb-1" style={{ color: textSub }}>Notes</label>
                <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add hearing notes..."
                  className={`form-control ${inputField}`} style={{ borderRadius: '10px', resize: 'none', background: isDark ? '#1f2937' : '#f8fafc', color: textMain }} />
              </div>
              <button type="submit" className="btn w-100 py-2 fw-bold rounded-pill" style={{ background: '#fbbf24', color: '#0b1220' }}>
                {editMode ? 'Save Changes' : 'Schedule Hearing'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; backdrop-filter: blur(5px); }
        .form-control:focus { box-shadow: none !important; border-color: rgba(251,191,36,0.4) !important; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input::placeholder, textarea::placeholder { color: ${textSub} !important; }
      `}</style>
    </div>
  );
};

export default CourtDates;