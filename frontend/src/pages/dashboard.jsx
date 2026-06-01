import React, { useEffect, useState } from 'react';
import {
  Briefcase, Users, DollarSign, Clock,
  Gavel, ShieldCheck, Calendar, Scale,
  CreditCard, UserPlus, Activity
} from 'lucide-react';
import axios from 'axios';

const BASE = 'https://lfms-backend-dgpk.onrender.com/api/law';

const STAT_META = [
  { key: 'revenue',      title: 'Total Revenue',  icon: DollarSign, color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   format: (v) => `$${Number(v).toLocaleString()}` },
  { key: 'totalClients', title: 'Total Clients',  icon: Users,      color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  format: (v) => v },
  { key: 'appointments', title: 'Appointments',   icon: Calendar,   color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  format: (v) => v },
  { key: 'courtDates',   title: 'Court Dates',    icon: Gavel,      color: '#a78bfa', bg: 'rgba(139,92,246,0.12)',  format: (v) => v },
  { key: 'total',        title: 'Total Cases',    icon: Briefcase,  color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', format: (v) => v },
  { key: 'open',         title: 'Active Cases',   icon: Scale,      color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   format: (v) => v },
  { key: 'pending',      title: 'Pending Cases',  icon: Clock,      color: '#fb923c', bg: 'rgba(249,115,22,0.12)',  format: (v) => v },
  { key: 'closed',       title: 'Closed Cases',   icon: ShieldCheck,color: '#f87171', bg: 'rgba(239,68,68,0.12)',   format: (v) => v },
];

const getUrgency = (dateStr) => {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0)   return { label: 'Past',     color: '#64748b', bg: 'rgba(100,116,139,0.12)' };
  if (diff === 0) return { label: 'Today',    color: '#fbbf24', bg: 'rgba(251,191,36,0.15)'  };
  if (diff <= 3)  return { label: `${diff}d`, color: '#f87171', bg: 'rgba(239,68,68,0.12)'   };
  if (diff <= 7)  return { label: `${diff}d`, color: '#fb923c', bg: 'rgba(249,115,22,0.12)'  };
  return               { label: `${diff}d`, color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   };
};

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const timeAgo = (d) => {
  const diff = Math.floor((new Date() - new Date(d)) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const Dashboard = () => {
  const [stats,      setStats]      = useState({
    total: 0, open: 0, pending: 0, closed: 0,
    revenue: 0, totalClients: 0, appointments: 0, courtDates: 0
  });
  const [courtDates, setCourtDates] = useState([]);
  const [activity,   setActivity]   = useState([]);
  const [loadingCD,  setLoadingCD]  = useState(true);
  const [loadingAct, setLoadingAct] = useState(true);

  useEffect(() => {
    axios.get(`${BASE}/dashboard`)
      .then(res => setStats(prev => ({ ...prev, ...res.data })))
      .catch(console.error);
  }, []);

  useEffect(() => {
    axios.get(`${BASE}/courtdates`)
      .then(res => {
        const sorted = res.data
          .filter(d => new Date(d.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 6);
        setCourtDates(sorted);
      })
      .catch(console.error)
      .finally(() => setLoadingCD(false));
  }, []);

  useEffect(() => {
    const buildFeed = async () => {
      try {
        const [casesRes, clientsRes, paymentsRes, apptRes] = await Promise.all([
          axios.get(`${BASE}/cases`),
          axios.get(`${BASE}/clients`),
          axios.get(`${BASE}/payments`),
          axios.get(`${BASE}/appointments`),
        ]);

        const feed = [];

        casesRes.data.slice(-4).forEach(c => feed.push({
          id:    `case-${c.case_id}`,
          icon:  Briefcase,
          color: '#60a5fa',
          bg:    'rgba(59,130,246,0.12)',
          text:  `Case "${c.title}" — ${c.status}`,
          sub:   `Case #${c.case_id}`,
          time:  c.created_at,
        }));

        clientsRes.data.slice(-3).forEach(c => feed.push({
          id:    `client-${c.client_id}`,
          icon:  UserPlus,
          color: '#22c55e',
          bg:    'rgba(34,197,94,0.12)',
          text:  `New client registered: ${c.name}`,
          sub:   c.email,
          time:  c.created_at,
        }));

        paymentsRes.data.slice(-3).forEach(p => feed.push({
          id:    `pay-${p.payment_id}`,
          icon:  CreditCard,
          color: p.payment_status === 'Completed' ? '#22c55e' : '#fbbf24',
          bg:    p.payment_status === 'Completed' ? 'rgba(34,197,94,0.12)' : 'rgba(251,191,36,0.12)',
          text:  `Payment of $${Number(p.amount).toLocaleString()} — ${p.payment_status}`,
          sub:   `Case #${p.case_id} · ${p.payment_method}`,
          time:  p.payment_date,
        }));

        apptRes.data.slice(-3).forEach(a => feed.push({
          id:    `appt-${a.appointment_id}`,
          icon:  Calendar,
          color: '#a78bfa',
          bg:    'rgba(139,92,246,0.12)',
          text:  `Appointment: ${a.purpose}`,
          sub:   `${a.location} · ${a.status}`,
          time:  a.appointment_date,
        }));

        feed.sort((a, b) => new Date(b.time) - new Date(a.time));
        setActivity(feed.slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAct(false);
      }
    };
    buildFeed();
  }, []);

  return (
    <div className="min-vh-100 p-4 p-lg-5 text-white" style={{ background: '#0b1220' }}>

      {/* HEADER */}
      <div className="d-flex align-items-center gap-3 mb-5">
        <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.15)' }}>
          <Scale size={26} className="text-warning" />
        </div>
        <div>
          <h2 className="fw-bold mb-0">Command Center</h2>
          <small className="text-white-50">Specter Litt — core performance metrics</small>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="row g-3 mb-5">
        {STAT_META.map(({ key, title, icon: Icon, color, bg, format }) => (
          <div className="col-6 col-lg-3" key={key}>
            <div
              className="rounded-4 p-3 h-100 position-relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Icon size={80} style={{ position: 'absolute', right: '-12px', bottom: '-12px', color, opacity: 0.06, pointerEvents: 'none' }} />
              <div className="d-inline-flex p-2 rounded-3 mb-3" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="text-white-50 small mb-1" style={{ fontSize: '12px' }}>{title}</div>
              <div className="fw-bold" style={{ fontSize: '22px', color }}>{format(stats[key] ?? 0)}</div>
              <div className="position-absolute bottom-0 start-0"
                style={{ height: '2px', width: '40%', background: color, opacity: 0.5, borderRadius: '0 2px 0 0' }} />
            </div>
          </div>
        ))}
      </div>

      {/* TWO PANELS */}
      <div className="row g-4 mb-4">

        {/* UPCOMING COURT DATES */}
        <div className="col-lg-6">
          <div className="rounded-4 p-4 h-100"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.12)' }}>
                    <Gavel size={16} className="text-warning" />
                  </div>
                  <h5 className="fw-bold mb-0">Upcoming Hearings</h5>
                </div>
                <small className="text-white-50 ms-1">Next scheduled court dates</small>
              </div>
              <span className="px-3 py-1 rounded-pill fw-bold"
                style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', fontSize: '12px' }}>
                {courtDates.length} upcoming
              </span>
            </div>

            {loadingCD ? (
              <div className="text-center py-4 text-white-50 small">Loading...</div>
            ) : courtDates.length === 0 ? (
              <div className="text-center py-4 text-white-50 small">No upcoming court dates</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {courtDates.map((cd) => {
                  const urgency = getUrgency(cd.date);
                  return (
                    <div key={cd.court_date_id}
                      className="d-flex align-items-center gap-3 rounded-3 p-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>

                      {/* DATE BLOCK */}
                      <div className="text-center rounded-3 flex-shrink-0 d-flex flex-column align-items-center justify-content-center"
                        style={{ width: '52px', height: '52px', background: urgency.bg, border: `1px solid ${urgency.color}33` }}>
                        <div className="fw-bold" style={{ fontSize: '18px', color: urgency.color, lineHeight: 1 }}>
                          {new Date(cd.date).getDate()}
                        </div>
                        <div className="text-uppercase" style={{ fontSize: '9px', color: urgency.color, letterSpacing: '1px' }}>
                          {new Date(cd.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>

                      {/* INFO */}
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="fw-semibold text-truncate" style={{ fontSize: '13px' }}>{cd.court_name}</div>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <Clock size={11} className="text-white-50" />
                          <span className="text-white-50" style={{ fontSize: '11px' }}>{fmtTime(cd.date)}</span>
                          <span className="text-white-50" style={{ fontSize: '11px' }}>· Case #{cd.case_id}</span>
                        </div>
                      </div>

                      {/* URGENCY */}
                      <span className="px-2 py-1 rounded-pill fw-bold flex-shrink-0"
                        style={{ fontSize: '11px', background: urgency.bg, color: urgency.color, border: `1px solid ${urgency.color}33` }}>
                        {urgency.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY FEED */}
        <div className="col-lg-6">
          <div className="rounded-4 p-4 h-100"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <div className="p-2 rounded-3" style={{ background: 'rgba(96,165,250,0.12)' }}>
                    <Activity size={16} style={{ color: '#60a5fa' }} />
                  </div>
                  <h5 className="fw-bold mb-0">Recent Activity</h5>
                </div>
                <small className="text-white-50 ms-1">Latest actions across the firm</small>
              </div>
              <span className="px-3 py-1 rounded-pill fw-bold"
                style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', fontSize: '12px' }}>
                Live
              </span>
            </div>

            {loadingAct ? (
              <div className="text-center py-4 text-white-50 small">Loading...</div>
            ) : activity.length === 0 ? (
              <div className="text-center py-4 text-white-50 small">No recent activity</div>
            ) : (
              <div className="d-flex flex-column">
                {activity.map((item, i) => {
                  const Icon   = item.icon;
                  const isLast = i === activity.length - 1;
                  return (
                    <div key={item.id} className="d-flex gap-3 position-relative">
                      {!isLast && (
                        <div className="position-absolute"
                          style={{ left: '19px', top: '36px', width: '2px', height: 'calc(100% - 8px)', background: 'rgba(255,255,255,0.05)' }} />
                      )}
                      <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 position-relative"
                        style={{ width: 38, height: 38, background: item.bg, border: `1px solid ${item.color}33`, zIndex: 1 }}>
                        <Icon size={15} style={{ color: item.color }} />
                      </div>
                      <div className="pb-3 flex-grow-1 overflow-hidden">
                        <div className="text-white fw-medium text-truncate" style={{ fontSize: '13px', lineHeight: 1.3 }}>
                          {item.text}
                        </div>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <span className="text-white-50 text-truncate" style={{ fontSize: '11px' }}>{item.sub}</span>
                          <span className="text-white-50 flex-shrink-0" style={{ fontSize: '10px' }}>· {timeAgo(item.time)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* CASE STATUS BAR */}
      <div className="rounded-4 p-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Case Status Overview</h5>
          <small className="text-white-50">Total: {stats.total} cases</small>
        </div>

        <div className="rounded-pill overflow-hidden mb-3" style={{ height: '10px', background: 'rgba(255,255,255,0.06)' }}>
          {stats.total > 0 && (
            <div className="d-flex h-100">
              <div style={{ width: `${(stats.open    / stats.total) * 100}%`, background: '#22c55e', transition: 'width 0.8s ease' }} />
              <div style={{ width: `${(stats.pending / stats.total) * 100}%`, background: '#fbbf24', transition: 'width 0.8s ease' }} />
              <div style={{ width: `${(stats.closed  / stats.total) * 100}%`, background: '#f87171', transition: 'width 0.8s ease' }} />
            </div>
          )}
        </div>

        <div className="d-flex flex-wrap gap-4">
          {[
            { label: 'Active',  value: stats.open,    color: '#22c55e', pct: stats.total ? Math.round((stats.open    / stats.total) * 100) : 0 },
            { label: 'Pending', value: stats.pending,  color: '#fbbf24', pct: stats.total ? Math.round((stats.pending / stats.total) * 100) : 0 },
            { label: 'Closed',  value: stats.closed,   color: '#f87171', pct: stats.total ? Math.round((stats.closed  / stats.total) * 100) : 0 },
          ].map((s) => (
            <div key={s.label} className="d-flex align-items-center gap-2">
              <div className="rounded-circle" style={{ width: 10, height: 10, background: s.color }} />
              <span className="text-white-50 small">{s.label}</span>
              <span className="fw-bold small" style={{ color: s.color }}>{s.value}</span>
              <span className="text-white-50" style={{ fontSize: '11px' }}>({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;