import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClients, deleteClient, addClient, updateClient
} from '../store/clientSlice';
import {
  UserPlus, Search, Mail, Phone,
  Edit, Trash2, X, Users
} from 'lucide-react';

const EMPTY_FORM = { name: '', email: '', phone: '', address: '' };

const Clients = () => {
  const dispatch = useDispatch();
  const { items: clients, loading, error } = useSelector((s) => s.clients);
  const { role } = useSelector((s) => s.auth);           // ← get role
  const isAdmin = role === 'admin';                       // ← helper

  const [search,          setSearch]          = useState('');
  const [showModal,       setShowModal]       = useState(false);
  const [editMode,        setEditMode]        = useState(false);
  const [currentClientId, setCurrentClientId] = useState(null);
  const [formData,        setFormData]        = useState(EMPTY_FORM);

  useEffect(() => { dispatch(fetchClients()); }, [dispatch]);

  const filteredClients = clients.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (client = null) => {
    if (client) {
      setEditMode(true);
      setCurrentClientId(client.client_id);
      setFormData({
        name:    client.name    || '',
        email:   client.email   || '',
        phone:   client.phone   || '',
        address: client.address || '',
      });
    } else {
      setEditMode(false);
      setCurrentClientId(null);
      setFormData(EMPTY_FORM);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await dispatch(updateClient({ id: currentClientId, data: formData })).unwrap();
      } else {
        await dispatch(addClient(formData)).unwrap();
      }
      setShowModal(false);
      setFormData(EMPTY_FORM);
    } catch (err) {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try { await dispatch(deleteClient(id)).unwrap(); }
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
              <Users size={24} className="text-warning" />
            </div>
            <h2 className="fw-bold mb-0">Client Directory</h2>
          </div>
          <small className="text-white-50 ms-1">Search and manage all clients</small>
        </div>

        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div
            className="d-flex align-items-center px-3 py-2 rounded-pill"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              width: '280px'
            }}
          >
            <Search size={15} className="text-white-50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name..."
              className="form-control bg-transparent border-0 text-white ms-2 shadow-none p-0"
              style={{ fontSize: '14px' }}
            />
          </div>

          {/* ADMIN ONLY */}
          {isAdmin && (
            <button
              onClick={() => openModal()}
              className="btn d-flex align-items-center gap-2 rounded-pill fw-bold"
              style={{ background: '#fbbf24', color: '#0b1220', padding: '10px 20px', border: 'none' }}
            >
              <UserPlus size={18} /> Add Client
            </button>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Clients',    value: clients.length,         color: '#60a5fa', bg: 'rgba(59,130,246,0.1)'  },
          { label: 'Active',           value: clients.length,         color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
          { label: 'Added This Month', value: clients.filter(c => {
              const d = new Date(c.created_at);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length,                                                 color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
          { label: 'Search Results',   value: filteredClients.length, color: '#a78bfa', bg: 'rgba(139,92,246,0.1)'  },
        ].map((s) => (
          <div className="col-6 col-lg-3" key={s.label}>
            <div className="rounded-4 p-3" style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
              <div className="fw-bold fs-4" style={{ color: s.color }}>{s.value}</div>
              <div className="small text-white-50">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* LOADING / ERROR */}
      {loading && <div className="text-center py-5 text-white-50">Loading clients...</div>}
      {error && (
        <div className="alert alert-danger">
          {typeof error === 'string' ? error : 'Something went wrong'}
        </div>
      )}

      {/* TABLE */}
      {!loading && (
        <div
          className="rounded-4 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <table className="table table-borderless text-white mb-0 align-middle">
            <thead>
              <tr style={{
                fontSize: '11px', letterSpacing: '1.5px',
                color: 'rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.02)',
                textTransform: 'uppercase'
              }}>
                <th className="px-4 py-3">Client</th>
                <th className="px-3 py-3">Client ID</th>
                <th className="px-3 py-3">Contact</th>
                <th className="px-3 py-3">Address</th>
                <th className="px-3 py-3 text-center">Status</th>
                {/* ADMIN ONLY column */}
                {isAdmin && <th className="px-4 py-3 text-end">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {filteredClients.length > 0 ? filteredClients.map((client) => (
                <tr
                  key={client.client_id}
                  className="client-row"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=1f2937&color=fbbf24&bold=true`}
                        alt={client.name}
                        style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(251,191,36,0.2)' }}
                      />
                      <div className="fw-semibold">{client.name}</div>
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <span className="px-3 py-1 rounded-pill fw-bold"
                      style={{
                        fontSize: '12px',
                        background: 'rgba(251,191,36,0.1)',
                        color: '#fbbf24',
                        border: '1px solid rgba(251,191,36,0.2)',
                        letterSpacing: '0.5px'
                      }}>
                      #{client.client_id}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    <div className="d-flex align-items-center gap-2 mb-1 small">
                      <Mail size={13} style={{ color: '#60a5fa' }} />
                      <span className="text-black">{client.email}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 small">
                      <Phone size={13} style={{ color: '#22c55e' }} />
                      <span className="text-black">{client.phone}</span>
                    </div>
                  </td>

                  <td className="px-3 py-3 small text-black">{client.address}</td>

                  <td className="px-3 py-3 text-center">
                    <span className="px-3 py-1 rounded-pill"
                      style={{
                        fontSize: '11px', fontWeight: 600,
                        background: 'rgba(34,197,94,0.12)',
                        color: '#22c55e',
                        border: '1px solid rgba(34,197,94,0.2)'
                      }}>
                      Active
                    </span>
                  </td>

                  {/* ADMIN ONLY actions */}
                  {isAdmin && (
                    <td className="px-4 py-3 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button onClick={() => openModal(client)} className="btn btn-sm rounded-pill"
                          style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(client.client_id)} className="btn btn-sm rounded-pill"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="text-center py-5 text-white-50">
                    No clients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL — admin only */}
      {showModal && isAdmin && (
        <div className="clients-overlay d-flex align-items-center justify-content-center">
          <div className="p-4 text-white"
            style={{
              background: '#111827', width: '460px', borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto'
            }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-2">
                <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.15)' }}>
                  <UserPlus size={18} className="text-warning" />
                </div>
                <h5 className="mb-0 fw-bold">{editMode ? 'Edit Client' : 'New Client'}</h5>
              </div>
              <X style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="small text-white-50 mb-1">Full Name</label>
                <input type="text" required value={formData.name}
                  onChange={(e) => field('name', e.target.value)}
                  placeholder="e.g. Harvey Specter"
                  className="form-control bg-dark border-secondary text-white"
                  style={{ borderRadius: '10px' }} />
              </div>
              <div className="mb-3">
                <label className="small text-white-50 mb-1">Email Address</label>
                <input type="email" required value={formData.email}
                  onChange={(e) => field('email', e.target.value)}
                  placeholder="e.g. harvey@specterlitt.com"
                  className="form-control bg-dark border-secondary text-white"
                  style={{ borderRadius: '10px' }} />
              </div>
              <div className="mb-3">
                <label className="small text-white-50 mb-1">Phone Number</label>
                <input type="text" required value={formData.phone}
                  onChange={(e) => field('phone', e.target.value)}
                  placeholder="e.g. +1 212-555-0100"
                  className="form-control bg-dark border-secondary text-white"
                  style={{ borderRadius: '10px' }} />
              </div>
              <div className="mb-4">
                <label className="small text-white-50 mb-1">Address</label>
                <input type="text" required value={formData.address}
                  onChange={(e) => field('address', e.target.value)}
                  placeholder="e.g. 601 Lexington Ave, NY"
                  className="form-control bg-dark border-secondary text-white"
                  style={{ borderRadius: '10px' }} />
              </div>
              <button type="submit" className="btn w-100 py-2 fw-bold rounded-pill"
                style={{ background: '#fbbf24', color: '#0b1220' }}>
                {editMode ? 'Save Changes' : 'Register Client'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .clients-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 2000; backdrop-filter: blur(5px); }
        .client-row:hover { background: rgba(255,255,255,0.02); transition: background 0.2s; }
        .form-control:focus { box-shadow: none; border-color: rgba(251,191,36,0.4) !important; }
        .form-control::placeholder { color: rgba(255,255,255,0.3); }
        .table td, .table th { vertical-align: middle; }
      `}</style>
    </div>
  );
};

export default Clients;