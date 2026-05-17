import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRevenuePerLawyer } from '../store/revperlawyer';
import { Briefcase, TrendingUp } from 'lucide-react';

const Revenue = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.revperlawyer);

  useEffect(() => {
    dispatch(fetchRevenuePerLawyer());
  }, [dispatch]);

  const maxTotal = items.length > 0 ? Math.max(...items.map(i => i.total)) : 1;

  return (
    <div className="container-fluid min-vh-100 p-5 text-white" style={{ background: '#0b1220' }}>
      
      <div className="mb-5">
        <h2 className="fw-bold mb-0">Revenue Analytics</h2>
        <small className="text-white-50">Financial earnings per Partner</small>
      </div>

      <div className="d-flex flex-column gap-4">
        {loading ? (
          <div className="text-center py-5 text-white-50">Accessing financial records...</div>
        ) : items.map((lawyer, idx) => (
          <div key={idx} className="p-4 rounded-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-1">{lawyer.name}</h5>
                <div className="d-flex gap-3 text-white-50 small">
                  <span className="d-flex align-items-center gap-1"><Briefcase size={14}/> {lawyer.cases} Cases</span>
                  <span className="d-flex align-items-center gap-1 text-success" style={{ fontSize: '11px' }}><TrendingUp size={14}/> Active Partner</span>
                </div>
              </div>
              <h4 className="fw-bold" style={{ color: '#fbbf24' }}>${lawyer.total.toLocaleString()}</h4>
            </div>

            <div className="progress bg-dark rounded-pill" style={{ height: '10px' }}>
              <div 
                className="progress-bar rounded-pill" 
                style={{ 
                  width: `${(lawyer.total / maxTotal) * 100}%`, 
                  background: '#fbbf24',
                  transition: 'width 0.8s ease-in-out'
                }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Revenue;