import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRevenuePerLawyer } from '../store/revperlawyer';
import { Briefcase, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Revenue = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.revperlawyer);
  const { isDark } = useTheme();

  const bg         = isDark ? '#0b1220'                    : '#f1f5f9';
  const cardBg     = isDark ? 'rgba(255,255,255,0.03)'     : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.05)'     : 'rgba(0,0,0,0.08)';
  const textMain   = isDark ? 'white'                      : '#1e293b';
  const textSub    = isDark ? 'rgba(255,255,255,0.5)'      : 'rgba(0,0,0,0.45)';

  useEffect(() => { dispatch(fetchRevenuePerLawyer()); }, [dispatch]);

  const maxTotal = items.length > 0 ? Math.max(...items.map(i => i.total)) : 1;

  return (
    <div className="container-fluid min-vh-100 p-5" style={{ background: bg, color: textMain, transition: 'all 0.3s ease' }}>
      <div className="mb-5">
        <h2 className="fw-bold mb-0" style={{ color: textMain }}>Revenue Analytics</h2>
        <small style={{ color: textSub }}>Financial earnings per Partner</small>
      </div>
      <div className="d-flex flex-column gap-4">
        {loading ? (
          <div className="text-center py-5" style={{ color: textSub }}>Accessing financial records...</div>
        ) : items.map((lawyer, idx) => (
          <div key={idx} className="p-4 rounded-4" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.3s ease' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-1" style={{ color: textMain }}>{lawyer.name}</h5>
                <div className="d-flex gap-3 small">
                  <span className="d-flex align-items-center gap-1" style={{ color: textSub }}><Briefcase size={14}/> {lawyer.cases} Cases</span>
                  <span className="d-flex align-items-center gap-1 text-success" style={{ fontSize: '11px' }}><TrendingUp size={14}/> Active Partner</span>
                </div>
              </div>
              <h4 className="fw-bold" style={{ color: '#fbbf24' }}>${lawyer.total.toLocaleString()}</h4>
            </div>
            <div className="rounded-pill overflow-hidden" style={{ height: '10px', background: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }}>
              <div className="rounded-pill h-100"
                style={{ width: `${(lawyer.total / maxTotal) * 100}%`, background: '#fbbf24', transition: 'width 0.8s ease-in-out' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Revenue;