import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCases, addCase, updateCase, deleteCase } from '../store/casesSlice';
import {
  Briefcase, Search, Plus, Edit, Trash2,
  X, Calendar, User, Scale, Clock, FileText, Filter
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const BASE_URL = 'https://lfms-backend-dgpk.onrender.com/api/law';

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
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [filterClientId, setFilterClientId] = useState('');
  const [filterLawyerId, setFilterLawyerId] = useState('');
  const [showModal,      setShowModal]      = useState(false);
  const [editMode,       setEditMode]       = useState(false);
  const [currentId,      setCurrentId]      = useState(null);
  const [formData,       setFormData]       = useState(EMPTY_FORM);
  const [descModal,      setDescModal]      = useState(false);
  const [descCase,       setDescCase]       = useState(null);
  const [docsModal,      setDocsModal]      = useState(false);
  const [docsCase,       setDocsCase]       = useState(null);
  const [documents,      setDocuments]      = useState([]);
  const [docsLoading,    setDocsLoading]    = useState(false);
  const [uploading,      setUploading]      = useState(false);

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
      if (editMode) await dispatch(updateCase({ id: currentId, data: formData })).unwrap();
      else await dispatch(addCase(formData)).unwrap();
      setShowModal(false);
      setFormData(EMPTY_FORM);
    } catch { alert('Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this case?')) return;
    try { await dispatch(deleteCase(id)).unwrap(); }
    catch { alert('Delete failed'); }
  };

  const openDocs = async (caseItem) => {
    setDocsCase(caseItem);
    setDocuments([]);
    setDocsModal(true);
    setDocsLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/cases/${caseItem.case_id}/documents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setDocuments(data);
    } catch { console.error('docs fetch failed'); }
    finally { setDocsLoading(false); }
  };

  // ← FIXED: now properly async with await inside
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('uploaded_by', 'Admin');
    try {
      const res  = await fetch(`${BASE_URL}/cases/${docsCase.case_id}/documents`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body:    form,
      });
      const data = await res.json();          // ← no longer inside arrow fn
      setDocuments(prev => [data, ...prev]);
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDoc = async (documentId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await fetch(`${BASE_URL}/cases/documents/${documentId}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDocuments(prev => prev.filter(d => d.document_id !== documentId));
    } catch { alert('Delete failed'); }
  };

  const hasIdFilters = filterClientId !== '' || filterLawyerId !== '';

  return (
    <div className="min-vh-100 p-4 p-lg-5" style={{ background: bg, color: textMain, transition: 'all 0.3s ease' }}>

      {/* HEADER */}
      <div className="d-flex flex-wrap justify-content-between align-items-start mb-5 gap-3">
        <div>
          <div className="d-flex align-items-center gap-3 mb-1">
            <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.15)' }}>
              <Scale size={24} className="text-warning" />
            </div>
            <h2 className="fw-bold mb-0" style={{ color: textMain }}>Case Management</h2>
          </div>
          <small style={{ color: textSub }}>Track, manage and update all legal cases</small>
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
            <div className="rounded-4 p-3 h-100"
              style={{ background: isDark ? stat.bg : '#fff', border: `1px solid ${isDark ? stat.color + '22' : 'rgba(0,0,0,0.08)'}`, boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div className="fw-bold fs-4" style={{ color: stat.color }}>{stat.value}</div>
              <div className="small" style={{ color: textSub }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH + STATUS FILTER */}
      <div className="d-flex flex-wrap gap-3 mb-3">
        <div className="d-flex align-items-center px-3 py-2 rounded-pill flex-grow-1"
          style={{ background: inputBg, border: `1px solid ${inputBorder}`, maxWidth: '380px' }}>
          <Search size={15} style={{ color: textSub }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cases..."
            className="form-control bg-transparent border-0 shadow-none ms-2 p-0"
            style={{ fontSize: '14px', color: textMain }} />
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {['all', 'open', 'pending', 'closed', 'appealed'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="btn btn-sm rounded-pill px-3 fw-bold text-capitalize"
              style={{ background: filterStatus === s ? '#fbbf24' : inputBg, color: filterStatus === s ? '#0b1220' : textSub, border: 'none', fontSize: '12px' }}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ID FILTERS */}
      <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
        <div className="d-flex align-items-center gap-2">
          <Filter size={14} style={{ color: textSub }} />
          <span className="small fw-semibold" style={{ color: textSub }}>Filter by ID:</span>
        </div>
        {[['Client ID', filterClientId, setFilterClientId, User], ['Lawyer ID', filterLawyerId, setFilterLawyerId, Scale]].map(([label, val, setter, Icon]) => (
          <div key={label} className="d-flex align-items-center px-3 py-2 rounded-pill"
            style={{ background: inputBg, border: `1px solid ${inputBorder}`, width: '160px' }}>
            <Icon size={13} style={{ color: textSub, flexShrink: 0 }} />
            <input type="number" value={val} onChange={(e) => setter(e.target.value)} placeholder={label}
              className="form-control bg-transparent border-0 shadow-none ms-2 p-0"
              style={{ fontSize: '13px', color: textMain }} />
          </div>
        ))}
        {hasIdFilters && (
          <>
            <button onClick={() => { setFilterClientId(''); setFilterLawyerId(''); }}
              className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', fontSize: '12px' }}>
              <X size={12} /> Clear
            </button>
            <span className="small" style={{ color: textSub }}>
              Showing <span className="fw-semibold" style={{ color: textMain }}>{filtered.length}</span> results
            </span>
          </>
        )}
      </div>

      {loading && <div className="text-center py-5" style={{ color: textSub }}>Loading cases...</div>}
      {error   && <div className="alert alert-danger">{typeof error === 'string' ? error : 'Something went wrong'}</div>}

      {/* CARDS */}
      {!loading && (
        <div className="row g-4">
          {filtered.length > 0 ? filtered.map((c) => {
            const s      = STATUS_STYLES[c.status] || STATUS_STYLES.open;
            const isLong = c.description?.length > 100;
            return (
              <div className="col-12 col-md-6 col-xl-4" key={c.case_id}>
                <div className="rounded-4 h-100 d-flex flex-column"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}`, overflow: 'hidden', boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ height: '3px', background: s.color, opacity: 0.7 }} />
                  <div className="p-4 d-flex flex-column flex-grow-1">

                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.1)' }}>
                          <Briefcase size={16} className="text-warning" />
                        </div>
                        <span className="small" style={{ color: textSub }}>#{c.case_id}</span>
                      </div>
                      <span className="px-3 py-1 rounded-pill"
                        style={{ fontSize: '11px', fontWeight: 600, background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>

                    <h5 className="fw-bold mb-2" style={{ lineHeight: 1.3, color: textMain }}>{c.title}</h5>

                    <p className="small mb-2"
                      style={{ lineHeight: 1.6, color: textSub, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.description}
                    </p>

                    {isLong && (
                      <button onClick={() => { setDescCase(c); setDescModal(true); }}
                        className="btn btn-sm d-flex align-items-center gap-1 mb-3 p-0"
                        style={{ background: 'none', border: 'none', color: '#fbbf24', fontSize: '12px', fontWeight: 600, width: 'fit-content' }}>
                        <FileText size={12} /> View full description
                      </button>
                    )}

                    <div className="d-flex flex-column gap-2 mt-auto mb-4">
                      <div className="d-flex align-items-center gap-2 small" style={{ color: textSub }}>
                        <User size={13} />
                        <span>Client ID: <span style={{ color: textMain }}>{c.client_id}</span></span>
                        <span className="ms-2">
                          <Scale size={13} className="me-1" />
                          Lawyer ID: <span style={{ color: textMain }}>{c.lawyer_id}</span>
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2 small" style={{ color: textSub }}>
                        <Calendar size={13} />
                        <span>Filed: <span style={{ color: textMain }}>{formatDate(c.created_at)}</span></span>
                      </div>
                      <div className="d-flex align-items-center gap-2 small" style={{ color: textSub }}>
                        <Clock size={13} />
                        <span>Updated: <span style={{ color: textMain }}>{formatDate(c.updated_at)}</span></span>
                      </div>
                    </div>

                    <button onClick={() => openDocs(c)}
                      className="btn btn-sm rounded-pill fw-bold mb-2 d-flex align-items-center justify-content-center gap-2"
                      style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)', fontSize: '13px', width: '100%' }}>
                      <FileText size={13} /> Documents
                    </button>

                    {isAdmin && (
                      <div className="d-flex gap-2">
                        <button onClick={() => openModal(c)}
                          className="btn btn-sm flex-grow-1 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-1"
                          style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', fontSize: '13px' }}>
                          <Edit size={13} /> Edit
                        </button>
                        <button onClick={() => handleDelete(c.case_id)}
                          className="btn btn-sm rounded-pill d-flex align-items-center justify-content-center"
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
            <div className="col-12 text-center py-5" style={{ color: textSub }}>No cases found</div>
          )}
        </div>
      )}

      {/* DESCRIPTION MODAL */}
      {descModal && descCase && (
        <div className="modal-overlay d-flex align-items-center justify-content-center">
          <div className="p-4" style={{ background: modalBg, color: textMain, width: '520px', borderRadius: '20px', border: `1px solid ${modalBorder}`, maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="d-flex align-items-start gap-3">
                <div className="p-2 rounded-3 flex-shrink-0" style={{ background: 'rgba(251,191,36,0.15)' }}>
                  <FileText size={18} className="text-warning" />
                </div>
                <div>
                  <h5 className="mb-1 fw-bold" style={{ color: textMain }}>{descCase.title}</h5>
                  <div className="d-flex align-items-center gap-2">
                    <span className="px-2 py-1 rounded-pill"
                      style={{ fontSize: '10px', fontWeight: 600, background: (STATUS_STYLES[descCase.status] || STATUS_STYLES.open).bg, color: (STATUS_STYLES[descCase.status] || STATUS_STYLES.open).color }}>
                      {(STATUS_STYLES[descCase.status] || STATUS_STYLES.open).label}
                    </span>
                    <span className="small" style={{ color: textSub }}>Case #{descCase.case_id}</span>
                  </div>
                </div>
              </div>
              <X style={{ cursor: 'pointer', color: textSub, flexShrink: 0 }} onClick={() => setDescModal(false)} />
            </div>
            <div style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', marginBottom: '1.2rem' }} />
            <div className="rounded-3 p-3 mb-4" style={{ background: innerBg, border: `1px solid ${innerBorder}` }}>
              <p className="small mb-0" style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', color: textSub }}>{descCase.description}</p>
            </div>
            <div className="d-flex flex-wrap gap-3 small mb-4" style={{ color: textSub }}>
              <div className="d-flex align-items-center gap-1"><User size={13} /> Client ID: <span style={{ color: textMain }} className="ms-1">{descCase.client_id}</span></div>
              <div className="d-flex align-items-center gap-1"><Scale size={13} /> Lawyer ID: <span style={{ color: textMain }} className="ms-1">{descCase.lawyer_id}</span></div>
              <div className="d-flex align-items-center gap-1"><Calendar size={13} /> Filed: <span style={{ color: textMain }} className="ms-1">{formatDate(descCase.created_at)}</span></div>
            </div>
            <button onClick={() => setDescModal(false)} className="btn w-100 py-2 fw-bold rounded-pill"
              style={{ background: inputBg, color: textSub, border: `1px solid ${inputBorder}` }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* DOCUMENTS MODAL */}
      {docsModal && docsCase && (
        <div className="modal-overlay d-flex align-items-center justify-content-center">
          <div className="p-4" style={{ background: modalBg, color: textMain, width: '560px', borderRadius: '20px', border: `1px solid ${modalBorder}`, maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="d-flex align-items-start gap-3">
                <div className="p-2 rounded-3 flex-shrink-0" style={{ background: 'rgba(251,191,36,0.15)' }}>
                  <FileText size={18} className="text-warning" />
                </div>
                <div>
                  <h5 className="mb-1 fw-bold" style={{ color: textMain }}>Case Documents</h5>
                  <small style={{ color: textSub }}>{docsCase.title}</small>
                </div>
              </div>
              <X style={{ cursor: 'pointer', color: textSub, flexShrink: 0 }} onClick={() => setDocsModal(false)} />
            </div>
            <div style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', marginBottom: '1.2rem' }} />

            {isAdmin && (
              <div className="mb-4">
                <label className="w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-bold"
                  style={{ background: 'rgba(251,191,36,0.06)', color: uploading ? 'rgba(251,191,36,0.4)' : '#fbbf24', border: '2px dashed rgba(251,191,36,0.25)', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '14px', borderRadius: '12px' }}>
                  <Plus size={16} />
                  {uploading ? 'Uploading...' : 'Click to Upload Document'}
                  <input type="file" className="d-none" onChange={handleUpload} disabled={uploading}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" />
                </label>
              </div>
            )}

            {docsLoading ? (
              <div className="text-center py-4" style={{ color: textSub }}>Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="text-center py-5" style={{ color: textSub }}>
                <FileText size={32} className="mb-3 opacity-25" />
                <div>No documents attached to this case</div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {documents.map((doc) => (
                  <div key={doc.document_id} className="d-flex align-items-center gap-3 p-3 rounded-3"
                    style={{ background: innerBg, border: `1px solid ${innerBorder}` }}>
                    <div className="p-2 rounded-3 flex-shrink-0" style={{ background: 'rgba(251,191,36,0.1)' }}>
                      <FileText size={16} className="text-warning" />
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-semibold small text-truncate" style={{ color: textMain }}>{doc.file_name}</div>
                      <div style={{ fontSize: '11px', color: textSub }}>
                        Uploaded by {doc.uploaded_by} · {new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="d-flex gap-2 flex-shrink-0">
                      <a href={doc.file_url} target="_blank" rel="noreferrer"
                        className="btn btn-sm rounded-pill fw-bold"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', fontSize: '12px', padding: '5px 12px' }}>
                        Download
                      </a>
                      {isAdmin && (
                        <button onClick={() => handleDeleteDoc(doc.document_id)}
                          className="btn btn-sm rounded-pill d-flex align-items-center justify-content-center"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '5px 10px' }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setDocsModal(false)} className="btn w-100 py-2 fw-bold rounded-pill mt-4"
              style={{ background: inputBg, color: textSub, border: `1px solid ${inputBorder}` }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && isAdmin && (
        <div className="modal-overlay d-flex align-items-center justify-content-center">
          <div className="p-4" style={{ background: modalBg, color: textMain, width: '480px', borderRadius: '20px', border: `1px solid ${modalBorder}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-2">
                <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.15)' }}>
                  <Briefcase size={18} className="text-warning" />
                </div>
                <h5 className="mb-0 fw-bold" style={{ color: textMain }}>{editMode ? 'Edit Case' : 'New Case'}</h5>
              </div>
              <X style={{ cursor: 'pointer', color: textSub }} onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="small mb-1" style={{ color: textSub }}>Case Title</label>
                <input type="text" required value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`form-control ${inputField}`}
                  style={{ borderRadius: '10px', background: isDark ? '#1f2937' : '#f8fafc', color: textMain }} />
              </div>
              <div className="mb-3">
                <label className="small mb-1" style={{ color: textSub }}>Description</label>
                <textarea rows={3} required value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`form-control ${inputField}`}
                  style={{ borderRadius: '10px', resize: 'none', background: isDark ? '#1f2937' : '#f8fafc', color: textMain }} />
              </div>
              <div className="row g-3 mb-3">
                {[['Client ID', 'client_id'], ['Lawyer ID', 'lawyer_id']].map(([label, key]) => (
                  <div className="col-6" key={key}>
                    <label className="small mb-1" style={{ color: textSub }}>{label}</label>
                    <input type="number" required value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className={`form-control ${inputField}`}
                      style={{ borderRadius: '10px', background: isDark ? '#1f2937' : '#f8fafc', color: textMain }} />
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <label className="small mb-1" style={{ color: textSub }}>Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`form-select ${inputField}`}
                  style={{ borderRadius: '10px', background: isDark ? '#1f2937' : '#f8fafc', color: textMain }}>
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                  <option value="appealed">Appealed</option>
                </select>
              </div>
              <button type="submit" className="btn w-100 py-2 fw-bold rounded-pill"
                style={{ background: '#fbbf24', color: '#0b1220' }}>
                {editMode ? 'Save Changes' : 'Create Case'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; backdrop-filter: blur(5px); }
        .form-control:focus, .form-select:focus { box-shadow: none !important; border-color: rgba(251,191,36,0.4) !important; }
        .form-control::placeholder { color: ${textSub} !important; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
};

export default Cases;