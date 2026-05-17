import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCases, addCase, updateCase, deleteCase } from '../store/casesSlice';
import {
  Briefcase, Search, Plus, Edit, Trash2,
  X, Calendar, User, Scale, Clock, FileText, Filter
} from 'lucide-react';

const STATUS_STYLES = {
  open:     { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e', label: 'Open'     },
  closed:   { bg: 'rgba(239,68,68,0.12)',  color: '#f87171', label: 'Closed'   },
  pending:  { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', label: 'Pending'  },
  appealed: { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa', label: 'Appealed' },
};

const EMPTY_FORM = { title: '', description: '', client_id: '', lawyer_id: '', status: 'open' };

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const Cases = () => {
  const dispatch = useDispatch();
  const { items: cases, loading, error } = useSelector((state) => state.cases);
  const { role } = useSelector((s) => s.auth);
  const isAdmin = role === 'admin';

  const [search,         setSearch]         = useState('');
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [filterClientId, setFilterClientId] = useState('');
  const [filterLawyerId, setFilterLawyerId] = useState('');
  const [showModal,      setShowModal]      = useState(false);
  const [editMode,       setEditMode]       = useState(false);
  const [currentId,      setCurrentId]      = useState(null);
  const [formData,       setFormData]       = useState(EMPTY_FORM);
  const [descModal,      setDescModal]      = useState(false);
  const [descCase,       setDescCase]       = useState(null);

  useEffect(() => { dispatch(fetchCases()); }, [dispatch]);

  const filtered = cases.filter((c) => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchClient = filterClientId === '' || String(c.client_id) === filterClientId.trim();
    const matchLawyer = filterLawyerId === '' || String(c.lawyer_id) === filterLawyerId.trim();
    return matchSearch && matchStatus && matchClient && matchLawyer;
  });

  const openModal = (caseItem = null) => {
    if (caseItem) {
      setEditMode(true);
      setCurrentId(caseItem.case_id);
      setFormData({
        title:       caseItem.title       || '',
        description: caseItem.description || '',
        client_id:   caseItem.client_id   || '',
        lawyer_id:   caseItem.lawyer_id   || '',
        status:      caseItem.status      || 'open',
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
        await dispatch(updateCase({ id: currentId, data: formData })).unwrap();
      } else {
        await dispatch(addCase(formData)).unwrap();
      }
      setShowModal(false);
      setFormData(EMPTY_FORM);
    } catch { alert('Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this case?')) return;
    try { await dispatch(deleteCase(id)).unwrap(); }
    catch { alert('Delete failed'); }
  };

  const viewDescription = (caseItem) => {
    setDescCase(caseItem);
    setDescModal(true);
  };

  const hasIdFilters = filterClientId !== '' || filterLawyerId !== '';

  return (
    <div className="min-vh-100 p-4 p-lg-5 text-white" style={{ background: '#0b1220' }}>

      {/* HEADER */}
      <div className="d-flex flex-wrap justify-content-between align-items-start mb-5 gap-3">
        <div>
          <div className="d-flex align-items-center gap-3 mb-1">
            <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.15)' }}>
              <Scale size={24} className="text-warning" />
            </div>
            <h2 className="fw-bold mb-0">Case Management</h2>
          </div>
          <small className="text-white-50 ms-1">Track, manage and update all legal cases</small>
        </div>
        {isAdmin && (
          <button onClick={() => openModal()}
            className="btn fw-bold d-flex align-items-center gap-2 rounded-pill px-4 py-2"
            style={{ background: '#fbbf24', color: '#0b1220' }}>
            <Plus size={18} /> New Case
          </button>
        )}
      </div>

      {/* STATS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Cases', value: cases.length,                                    color: '#60a5fa', bg: 'rgba(59,130,246,0.1)'  },
          { label: 'Open',        value: cases.filter(c => c.status === 'open').length,    color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
          { label: 'Pending',     value: cases.filter(c => c.status === 'pending').length, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
          { label: 'Closed',      value: cases.filter(c => c.status === 'closed').length,  color: '#f87171', bg: 'rgba(239,68,68,0.1)'   },
        ].map((stat) => (
          <div className="col-6 col-lg-3" key={stat.label}>
            <div className="rounded-4 p-3 h-100" style={{ background: stat.bg, border: `1px solid ${stat.color}22` }}>
              <div className="fw-bold fs-4" style={{ color: stat.color }}>{stat.value}</div>
              <div className="small text-white-50">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH + STATUS FILTER */}
      <div className="d-flex flex-wrap gap-3 mb-3">
        <div className="d-flex align-items-center px-3 py-2 rounded-pill flex-grow-1"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', maxWidth: '380px' }}>
          <Search size={15} className="text-white-50" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cases..."
            className="form-control bg-transparent border-0 text-white shadow-none ms-2 p-0"
            style={{ fontSize: '14px' }} />
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {['all', 'open', 'pending', 'closed', 'appealed'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="btn btn-sm rounded-pill px-3 fw-bold text-capitalize"
              style={{
                background: filterStatus === s ? '#fbbf24' : 'rgba(255,255,255,0.06)',
                color:      filterStatus === s ? '#0b1220'  : 'rgba(255,255,255,0.6)',
                border: 'none', fontSize: '12px'
              }}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* CLIENT ID + LAWYER ID FILTERS */}
      <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
        <div className="d-flex align-items-center gap-2">
          <Filter size={14} className="text-white-50" />
          <span className="small text-white-50 fw-semibold">Filter by ID:</span>
        </div>
        <div className="d-flex align-items-center px-3 py-2 rounded-pill"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', width: '160px' }}>
          <User size={13} className="text-white-50 flex-shrink-0" />
          <input type="number" value={filterClientId}
            onChange={(e) => setFilterClientId(e.target.value)}
            placeholder="Client ID"
            className="form-control bg-transparent border-0 text-white shadow-none ms-2 p-0"
            style={{ fontSize: '13px' }} />
        </div>
        <div className="d-flex align-items-center px-3 py-2 rounded-pill"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', width: '160px' }}>
          <Scale size={13} className="text-white-50 flex-shrink-0" />
          <input type="number" value={filterLawyerId}
            onChange={(e) => setFilterLawyerId(e.target.value)}
            placeholder="Lawyer ID"
            className="form-control bg-transparent border-0 text-white shadow-none ms-2 p-0"
            style={{ fontSize: '13px' }} />
        </div>
        {hasIdFilters && (
          <>
            <button onClick={() => { setFilterClientId(''); setFilterLawyerId(''); }}
              className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', fontSize: '12px' }}>
              <X size={12} /> Clear
            </button>
            <span className="small text-white-50">
              Showing <span className="text-white fw-semibold">{filtered.length}</span> result{filtered.length !== 1 ? 's' : ''}
            </span>
          </>
        )}
      </div>

      {loading && <div className="text-center py-5 text-white-50">Loading cases...</div>}
      {error   && <div className="alert alert-danger">{typeof error === 'string' ? error : 'Something went wrong'}</div>}

      {/* CARDS */}
      {!loading && (
        <div className="row g-4">
          {filtered.length > 0 ? filtered.map((c) => {
            const s = STATUS_STYLES[c.status] || STATUS_STYLES.open;
            const isLong = c.description?.length > 100;
            return (
              <div className="col-12 col-md-6 col-xl-4" key={c.case_id}>
                <div className="rounded-4 h-100 d-flex flex-column"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                  <div style={{ height: '3px', background: s.color, opacity: 0.7 }} />
                  <div className="p-4 d-flex flex-column flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.1)' }}>
                          <Briefcase size={16} className="text-warning" />
                        </div>
                        <span className="text-white-50 small">#{c.case_id}</span>
                      </div>
                      <span className="px-3 py-1 rounded-pill"
                        style={{ fontSize: '11px', fontWeight: 600, background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                    <h5 className="fw-bold mb-2" style={{ lineHeight: 1.3 }}>{c.title}</h5>
                    <p className="text-white-50 small mb-2"
                      style={{ lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.description}
                    </p>
                    {isLong && (
                      <button onClick={() => viewDescription(c)}
                        className="btn btn-sm d-flex align-items-center gap-1 mb-3 p-0"
                        style={{ background: 'none', border: 'none', color: '#fbbf24', fontSize: '12px', fontWeight: 600, width: 'fit-content' }}>
                        <FileText size={12} /> View full description
                      </button>
                    )}
                    <div className="d-flex flex-column gap-2 mt-auto mb-4">
                      <div className="d-flex align-items-center gap-2 small text-white-50">
                        <User size={13} />
                        <span>Client ID: <span className="text-white">{c.client_id}</span></span>
                        <span className="ms-2">
                          <Scale size={13} className="me-1" />
                          Lawyer ID: <span className="text-white">{c.lawyer_id}</span>
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2 small text-white-50">
                        <Calendar size={13} />
                        <span>Filed: <span className="text-white">{formatDate(c.created_at)}</span></span>
                      </div>
                      <div className="d-flex align-items-center gap-2 small text-white-50">
                        <Clock size={13} />
                        <span>Updated: <span className="text-white">{formatDate(c.updated_at)}</span></span>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="d-flex gap-2">
                        <button onClick={() => openModal(c)}
                          className="btn btn-sm flex-grow-1 rounded-pill fw-bold"
                          style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', fontSize: '13px' }}>
                          <Edit size={13} className="me-1" /> Edit
                        </button>
                        <button onClick={() => handleDelete(c.case_id)}
                          className="btn btn-sm rounded-pill"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 14px' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-12 text-center py-5 text-white-50">No cases found</div>
          )}
        </div>
      )}

      {/* DESCRIPTION MODAL */}
      {descModal && descCase && (
        <div className="modal-overlay d-flex align-items-center justify-content-center">
          <div className="p-4 text-white"
            style={{ background: '#111827', width: '520px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="d-flex align-items-start gap-3">
                <div className="p-2 rounded-3 flex-shrink-0" style={{ background: 'rgba(251,191,36,0.15)' }}>
                  <FileText size={18} className="text-warning" />
                </div>
                <div>
                  <h5 className="mb-1 fw-bold">{descCase.title}</h5>
                  <div className="d-flex align-items-center gap-2">
                    <span className="px-2 py-1 rounded-pill"
                      style={{ fontSize: '10px', fontWeight: 600, background: (STATUS_STYLES[descCase.status] || STATUS_STYLES.open).bg, color: (STATUS_STYLES[descCase.status] || STATUS_STYLES.open).color }}>
                      {(STATUS_STYLES[descCase.status] || STATUS_STYLES.open).label}
                    </span>
                    <span className="text-white-50 small">Case #{descCase.case_id}</span>
                  </div>
                </div>
              </div>
              <X style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => setDescModal(false)} />
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '1.2rem' }} />
            <div className="rounded-3 p-3 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white-50 small mb-0" style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{descCase.description}</p>
            </div>
            <div className="d-flex flex-wrap gap-3 small text-white-50 mb-4">
              <div className="d-flex align-items-center gap-1"><User size={13} /> Client ID: <span className="text-white ms-1">{descCase.client_id}</span></div>
              <div className="d-flex align-items-center gap-1"><Scale size={13} /> Lawyer ID: <span className="text-white ms-1">{descCase.lawyer_id}</span></div>
              <div className="d-flex align-items-center gap-1"><Calendar size={13} /> Filed: <span className="text-white ms-1">{formatDate(descCase.created_at)}</span></div>
            </div>
            <button onClick={() => setDescModal(false)} className="btn w-100 py-2 fw-bold rounded-pill"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && isAdmin && (
        <div className="modal-overlay d-flex align-items-center justify-content-center">
          <div className="p-4 text-white"
            style={{ background: '#111827', width: '480px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-2">
                <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.15)' }}>
                  <Briefcase size={18} className="text-warning" />
                </div>
                <h5 className="mb-0 fw-bold">{editMode ? 'Edit Case' : 'New Case'}</h5>
              </div>
              <X style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="small text-white-50 mb-1">Case Title</label>
                <input type="text" required value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-control bg-dark border-secondary text-white" style={{ borderRadius: '10px' }} />
              </div>
              <div className="mb-3">
                <label className="small text-white-50 mb-1">Description</label>
                <textarea rows={3} required value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-control bg-dark border-secondary text-white" style={{ borderRadius: '10px', resize: 'none' }} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="small text-white-50 mb-1">Client ID</label>
                  <input type="number" required value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="form-control bg-dark border-secondary text-white" style={{ borderRadius: '10px' }} />
                </div>
                <div className="col-6">
                  <label className="small text-white-50 mb-1">Lawyer ID</label>
                  <input type="number" required value={formData.lawyer_id}
                    onChange={(e) => setFormData({ ...formData, lawyer_id: e.target.value })}
                    className="form-control bg-dark border-secondary text-white" style={{ borderRadius: '10px' }} />
                </div>
              </div>
              <div className="mb-4">
                <label className="small text-white-50 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="form-select bg-dark border-secondary text-white" style={{ borderRadius: '10px' }}>
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                  <option value="appealed">Appealed</option>
                </select>
              </div>
              <button type="submit" className="btn w-100 py-2 fw-bold rounded-pill" style={{ background: '#fbbf24', color: '#0b1220' }}>
                {editMode ? 'Save Changes' : 'Create Case'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 2000; backdrop-filter: blur(5px); }
        .form-control:focus, .form-select:focus { box-shadow: none; border-color: rgba(251,191,36,0.4) !important; }
        .form-control::placeholder { color: rgba(255,255,255,0.3); }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
};

export default Cases;