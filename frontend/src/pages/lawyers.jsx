import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import AlexWilliams   from '../assets/AlexWilliams.avif';
import AliceJohnson   from '../assets/AliceJohnson.avif';
import DanielHardman  from '../assets/DanielHardman.avif';
import DonnaPaulsen   from '../assets/DonnaPaulsen.avif';
import EmmaBrown      from '../assets/EmmaBrown.avif';
import HarveySpecter  from '../assets/HarveySpecter.avif';
import JackSoloff     from '../assets/JackSoloff.avif';
import LouisLitt      from '../assets/LouisLitt.avif';
import MikeRoss       from '../assets/MikeRoss.avif';
import RachelZane     from '../assets/RachelZane.avif';
import RobertSmith    from '../assets/RobertSmith.avif';
import RobertZane     from '../assets/RobertZane.avif';
import SamanthaWheeler from '../assets/SamanthaWheeler.avif';
import KatrinaBennett from '../assets/KatrinaBennett.avif';
import { Mail, Phone, Scale, ShieldCheck, MapPin, Award, Star, Briefcase, Hash } from 'lucide-react';

const lawyerImages = {
  'Samantha Wheeler': SamanthaWheeler, 'Katrina Bennett': KatrinaBennett,
  'Rachel Zane': RachelZane,           'Donna Paulsen':  DonnaPaulsen,
  'Emma Brown':  EmmaBrown,            'Alice Johnson':  AliceJohnson,
  'Harvey Specter': HarveySpecter,     'Mike Ross':      MikeRoss,
  'Louis Litt':  LouisLitt,            'Daniel Hardman': DanielHardman,
  'Robert Zane': RobertZane,           'Jack Soloff':    JackSoloff,
  'Robert Smith': RobertSmith,         'Alex Williams':  AlexWilliams,
};

const experiences    = ['12+', '18+', '9+', '22+', '14+', '11+'];
const successRates   = ['98%', '94%', '89%', '96%', '91%', '87%'];
const californiaBranches = [
  'Los Angeles Office, California', 'Beverly Hills Office, California',
  'San Francisco Office, California', 'San Diego Office, California',
  'Santa Monica Office, California', 'Silicon Valley Office, California',
];

const Lawyers = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  // light mode uses a soft slate gradient instead of the dark one
  const pageBg = isDark
    ? 'radial-gradient(circle at top right, rgba(251,191,36,0.08), transparent 25%), linear-gradient(135deg, #0f172a, #111827, #020617)'
    : 'radial-gradient(circle at top right, rgba(251,191,36,0.06), transparent 25%), linear-gradient(135deg, #e2e8f0, #f1f5f9, #ffffff)';

  const cardBg = isDark
    ? 'linear-gradient(145deg, rgba(17,24,39,0.98), rgba(15,23,42,0.92))'
    : 'linear-gradient(145deg, #ffffff, #f8fafc)';

  const cardBorder  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const textMain    = isDark ? 'white'                  : '#1e293b';
  const textSub     = isDark ? 'rgba(255,255,255,0.5)'  : 'rgba(0,0,0,0.5)';
  const statBg      = isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9';
  const statBorder  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const contactBg   = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc';
  const contactBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const badgeBorder = isDark ? '3px solid #111827'      : '3px solid #ffffff';

  useEffect(() => {
    axios.get('https://lfms-backend-dgpk.onrender.com/api/law/lawyers')
      .then(res => setLawyers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-fluid min-vh-100 py-4 py-md-5 px-3 px-md-4"
      style={{ background: pageBg, transition: 'all 0.3s ease' }}>

      {/* HEADER */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-end gap-4 mb-5">
        <div>
          <p className="text-uppercase fw-bold mb-2" style={{ letterSpacing: '4px', color: '#fbbf24', fontSize: '12px' }}>
            Specter Litt Law Firm
          </p>
          <h1 className="fw-bolder" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.8rem)', lineHeight: '1', color: textMain }}>
            Legal Dream Team
          </h1>
          <p className="mt-3" style={{ maxWidth: '650px', fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', color: textSub }}>
            Elite attorneys handling corporate, criminal, and high-profile litigation cases with unmatched precision.
          </p>
        </div>

        <div className="px-4 py-3 rounded-4 border border-warning border-opacity-25 w-100 w-lg-auto"
          style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', maxWidth: '320px' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
              style={{ width: '55px', height: '55px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
              <Scale size={26} color="#111827" />
            </div>
            <div>
              <h5 className="fw-bold mb-0" style={{ color: textMain }}>{lawyers.length} Lawyers</h5>
              <small style={{ color: textSub }}>Active Partners</small>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="text-center mt-5" style={{ color: textSub }}>Loading lawyers...</div>}

      {/* CARDS */}
      <div className="row g-4">
        {lawyers.map((lawyer, index) => {
          const selectedImage = lawyer.profilePic || lawyerImages[lawyer.name] ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.name)}&background=fbbf24&color=111827&size=256`;

          return (
            <div className="col-12 col-sm-6 col-xl-4" key={lawyer.lawyer_id || lawyer._id}>
              <div className="position-relative overflow-hidden h-100"
                style={{ borderRadius: '30px', background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(18px)', boxShadow: isDark ? '0 25px 50px rgba(0,0,0,0.45)' : '0 8px 32px rgba(0,0,0,0.1)' }}>

                <div style={{ height: '5px', background: 'linear-gradient(to right, #fbbf24, #f59e0b, transparent)' }} />

                {isDark && (
                  <div className="position-absolute" style={{ width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(251,191,36,0.08)', top: '-100px', right: '-100px', filter: 'blur(50px)' }} />
                )}

                <div className="p-3 p-md-4 position-relative">

                  {/* LAWYER ID */}
                  <div className="d-flex justify-content-end mb-2">
                    <span className="d-flex align-items-center gap-1 px-3 py-1 rounded-pill fw-bold"
                      style={{ fontSize: '11px', background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)', letterSpacing: '0.5px' }}>
                      <Hash size={11} /> ID {lawyer.lawyer_id}
                    </span>
                  </div>

                  {/* TOP SECTION */}
                  <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-4 mb-4 text-center text-sm-start">
                    <div className="position-relative flex-shrink-0">
                      <img src={selectedImage} alt={lawyer.name}
                        style={{ width: '110px', height: '130px', objectFit: 'cover', borderRadius: '24px', border: '2px solid rgba(251,191,36,0.5)', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }} />
                      <div className="position-absolute d-flex justify-content-center align-items-center"
                        style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', bottom: '-10px', right: '-10px', border: badgeBorder }}>
                        <ShieldCheck size={18} color="#111827" />
                      </div>
                    </div>

                    <div className="flex-grow-1 w-100">
                      <div className="d-flex justify-content-center justify-content-sm-start align-items-center gap-2 mb-2">
                        <Star size={15} className="text-warning fill-warning" />
                        <small className="fw-bold" style={{ color: '#fbbf24', letterSpacing: '2px' }}>TOP RATED</small>
                      </div>
                      <h3 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', color: textMain }}>{lawyer.name}</h3>
                      <div className="d-flex justify-content-center justify-content-sm-start align-items-center gap-2 mb-3">
                        <Scale size={15} className="text-warning" />
                        <span className="text-uppercase fw-semibold" style={{ color: isDark ? '#d1d5db' : '#475569', letterSpacing: '1px', fontSize: '13px' }}>
                          {lawyer.specialization}
                        </span>
                      </div>
                      <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                        style={{ background: statBg, border: `1px solid ${statBorder}` }}>
                        <Award size={14} className="text-warning" />
                        <small className="fw-semibold" style={{ color: textMain }}>Senior Partner</small>
                      </div>
                    </div>
                  </div>

                  {/* STATS */}
                  <div className="row g-3 mb-4">
                    {[
                      { icon: Briefcase, value: experiences[index % experiences.length], label: 'Years' },
                      { icon: Award,     value: successRates[index % successRates.length], label: 'Success' },
                    ].map(({ icon: Icon, value, label }) => (
                      <div className="col-6" key={label}>
                        <div className="p-3 rounded-4 text-center h-100" style={{ background: statBg, border: `1px solid ${statBorder}` }}>
                          <Icon size={22} className="text-warning mb-2" />
                          <h5 className="fw-bold mb-0" style={{ color: textMain }}>{value}</h5>
                          <small style={{ color: textSub }}>{label}</small>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CONTACT */}
                  <div className="d-flex flex-column gap-3">
                    {[
                      { icon: Mail,   label: 'Email Address',  value: lawyer.email,  iconColor: 'text-warning' },
                      { icon: Phone,  label: 'Contact Number', value: lawyer.phone,  iconColor: 'text-warning' },
                      { icon: MapPin, label: 'Office Branch',  value: californiaBranches[index % californiaBranches.length], iconColor: 'text-warning' },
                    ].map(({ icon: Icon, label, value, iconColor }) => (
                      <div key={label} className="d-flex align-items-center gap-3 p-3 rounded-4 flex-wrap"
                        style={{ background: contactBg, border: `1px solid ${contactBorder}` }}>
                        <div className="d-flex justify-content-center align-items-center rounded-circle flex-shrink-0"
                          style={{ width: '45px', height: '45px', background: 'rgba(251,191,36,0.12)' }}>
                          <Icon size={18} className={iconColor} />
                        </div>
                        <div className="text-break">
                          <small style={{ color: textSub }}>{label}</small>
                          <p className="mb-0 fw-medium small" style={{ color: textMain }}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Lawyers;