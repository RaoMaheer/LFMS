import React, { useEffect, useState } from 'react';
import {
  Briefcase, Users, DollarSign, Clock,
  Gavel, ShieldCheck, Calendar, TrendingUp, Scale
} from 'lucide-react';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

// ── constants OUTSIDE component ─────────────────────────────────────────────

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

// ── component ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0, open: 0, pending: 0, closed: 0,
    revenue: 0, totalClients: 0, appointments: 0, courtDates: 12
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/law/dashboard');
        setStats(prev => ({ ...prev, ...res.data }));
      } catch (err) {
        console.error('Error loading dashboard data', err);
      }
    };
    fetchStats();
  }, []);

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue',
      data: stats.revenueTrend || [12000, 19000, 15000, 25000, 22000, 30000],
      borderColor: '#fbbf24',
      backgroundColor: 'rgba(251,191,36,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#fbbf24',
      pointBorderColor: '#0b1220',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }]
  };

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#fbbf24',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 12,
        callbacks: { label: (ctx) => ` $${ctx.parsed.y.toLocaleString()}` }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 12 } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: 'rgba(255,255,255,0.4)',
          font: { size: 12 },
          callback: (v) => `$${(v / 1000).toFixed(0)}k`
        }
      }
    }
  };

  const domainData = {
    labels: ['Corporate', 'Criminal', 'Family', 'Real Estate'],
    datasets: [{
      data: [40, 25, 20, 27],
      backgroundColor: ['#fbbf24', '#60a5fa', '#22c55e', '#f87171'],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255,255,255,0.6)',
          padding: 16,
          font: { size: 12 },
          usePointStyle: true,
          pointStyleWidth: 8,
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#fbbf24',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 12,
      }
    }
  };

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
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid rgba(255,255,255,0.07)`,
              }}
            >
              {/* BIG GHOST ICON */}
              <Icon
                size={80}
                style={{
                  position: 'absolute', right: '-12px', bottom: '-12px',
                  color, opacity: 0.06, pointerEvents: 'none'
                }}
              />

              <div
                className="d-inline-flex p-2 rounded-3 mb-3"
                style={{ background: bg }}
              >
                <Icon size={18} style={{ color }} />
              </div>

              <div className="text-white-50 small mb-1" style={{ fontSize: '12px' }}>
                {title}
              </div>
              <div className="fw-bold" style={{ fontSize: '22px', color }}>
                {format(stats[key] ?? 0)}
              </div>

              {/* BOTTOM ACCENT LINE */}
              <div
                className="position-absolute bottom-0 start-0"
                style={{ height: '2px', width: '40%', background: color, opacity: 0.5, borderRadius: '0 2px 0 0' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="row g-4">

        {/* LINE CHART */}
        <div className="col-lg-8">
          <div
            className="rounded-4 p-4 h-100"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)'
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-0">Revenue Growth</h5>
                <small className="text-white-50">Monthly billing trend</small>
              </div>
              <div
                className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', fontSize: '13px' }}
              >
                <TrendingUp size={15} />
                <span className="fw-bold">+18.4%</span>
              </div>
            </div>
            <div style={{ height: '300px' }}>
              <Line data={revenueData} options={revenueOptions} />
            </div>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="col-lg-4">
          <div
            className="rounded-4 p-4 h-100"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)'
            }}
          >
            <div className="mb-4">
              <h5 className="fw-bold mb-0">Case Distribution</h5>
              <small className="text-white-50">By practice area</small>
            </div>
            <div style={{ height: '280px' }}>
              <Pie data={domainData} options={pieOptions} />
            </div>
          </div>
        </div>

      </div>

      {/* CASE STATUS SUMMARY BAR */}
      <div
        className="rounded-4 p-4 mt-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)'
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Case Status Overview</h5>
          <small className="text-white-50">Total: {stats.total} cases</small>
        </div>

        {/* PROGRESS BAR */}
        <div className="rounded-pill overflow-hidden mb-3" style={{ height: '10px', background: 'rgba(255,255,255,0.06)' }}>
          {stats.total > 0 && (
            <div className="d-flex h-100">
              <div style={{ width: `${(stats.open    / stats.total) * 100}%`, background: '#22c55e' }} />
              <div style={{ width: `${(stats.pending / stats.total) * 100}%`, background: '#fbbf24' }} />
              <div style={{ width: `${(stats.closed  / stats.total) * 100}%`, background: '#f87171' }} />
            </div>
          )}
        </div>

        <div className="d-flex flex-wrap gap-4">
          {[
            { label: 'Active',  value: stats.open,    color: '#22c55e' },
            { label: 'Pending', value: stats.pending,  color: '#fbbf24' },
            { label: 'Closed',  value: stats.closed,   color: '#f87171' },
          ].map((s) => (
            <div key={s.label} className="d-flex align-items-center gap-2">
              <div className="rounded-circle" style={{ width: 10, height: 10, background: s.color }} />
              <span className="text-white-50 small">{s.label}</span>
              <span className="fw-bold small" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;