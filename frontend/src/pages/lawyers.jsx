import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AlexWilliams from '../assets/AlexWilliams.avif';
import AliceJohnson from '../assets/AliceJohnson.avif';
import DanielHardman from '../assets/DanielHardman.avif';
import DonnaPaulsen from '../assets/DonnaPaulsen.avif';
import EmmaBrown from '../assets/EmmaBrown.avif';
import HarveySpecter from '../assets/HarveySpecter.avif';
import JackSoloff from '../assets/JackSoloff.avif';
import LouisLitt from '../assets/LouisLitt.avif';
import MikeRoss from '../assets/MikeRoss.avif';
import RachelZane from '../assets/RachelZane.avif';
import RobertSmith from '../assets/RobertSmith.avif';
import RobertZane from '../assets/RobertZane.avif';
import SamanthaWheeler from '../assets/SamanthaWheeler.avif';
import KatrinaBennett from '../assets/KatrinaBennett.avif';

import {
  Mail,
  Phone,
  Scale,
  ShieldCheck,
  MapPin,
  Award,
  Star,
  Briefcase,
} from 'lucide-react';

/* UNIQUE LAWYER IMAGES */
const lawyerImages = {
  // FEMALE
  'Samantha Wheeler': SamanthaWheeler,
  'Katrina Bennett': KatrinaBennett,
  'Rachel Zane': RachelZane,
  'Donna Paulsen': DonnaPaulsen,
  'Emma Brown': EmmaBrown,
  'Alice Johnson': AliceJohnson,

  // MALE
  'Harvey Specter': HarveySpecter,
  'Mike Ross': MikeRoss,
  'Louis Litt': LouisLitt,
  'Daniel Hardman': DanielHardman,
  'Robert Zane': RobertZane,
  'Jack Soloff': JackSoloff,
  'Robert Smith': RobertSmith,
  'Alex Williams': AlexWilliams,
};


const experiences = [
  '12+',
  '18+',
  '9+',
  '22+',
  '14+',
  '11+',
];

const successRates = [
  '98%',
  '94%',
  '89%',
  '96%',
  '91%',
  '87%',
];

const californiaBranches = [
  'Los Angeles Office, California',
  'Beverly Hills Office, California',
  'San Francisco Office, California',
  'San Diego Office, California',
  'Santa Monica Office, California',
  'Silicon Valley Office, California',
];

const Lawyers = () => {

  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchLawyers = async () => {

      try {

        const res = await axios.get(
          'http://localhost:5000/api/law/lawyers'
        );

        setLawyers(res.data);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

    fetchLawyers();

  }, []);

  return (

    <div
      className="container-fluid min-vh-100 py-4 py-md-5 px-3 px-md-4"
      style={{
        background:
          'radial-gradient(circle at top right, rgba(251,191,36,0.08), transparent 25%), linear-gradient(135deg, #0f172a, #111827, #020617)',
      }}
    >

      {/* HEADER */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-end gap-4 mb-5">

        <div>

          <p
            className="text-uppercase fw-bold mb-2"
            style={{
              letterSpacing: '4px',
              color: '#fbbf24',
              fontSize: '12px',
            }}
          >
            Specter Litt Law Firm
          </p>

          <h1
            className="fw-bolder text-white"
            style={{
              fontSize: 'clamp(2.2rem, 6vw, 3.8rem)',
              lineHeight: '1',
            }}
          >
            Legal Dream Team
          </h1>

          <p
            className="text-white-50 mt-3"
            style={{
              maxWidth: '650px',
              fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
            }}
          >
            Elite attorneys handling corporate, criminal, and high-profile litigation cases with unmatched precision.
          </p>

        </div>

        {/* TOP RIGHT STATS */}
        <div
          className="px-4 py-3 rounded-4 border border-warning border-opacity-25 w-100 w-lg-auto"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(10px)',
            maxWidth: '320px',
          }}
        >

          <div className="d-flex align-items-center gap-3">

            <div
              className="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
              style={{
                width: '55px',
                height: '55px',
                background:
                  'linear-gradient(135deg, #fbbf24, #f59e0b)',
              }}
            >
              <Scale size={26} color="#111827" />
            </div>

            <div>
              <h5 className="text-white fw-bold mb-0">
                {lawyers.length} Lawyers
              </h5>

              <small className="text-white-50">
                Active Partners
              </small>
            </div>

          </div>

        </div>

      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center text-white mt-5">
          Loading lawyers...
        </div>
      )}

      {/* CARDS */}
      <div className="row g-4">

        {lawyers.map((lawyer, index) => {

          const selectedImage =
            lawyer.profilePic ||
            lawyerImages[lawyer.name] ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              lawyer.name
            )}&background=fbbf24&color=111827&size=256`;

          return (

            <div
              className="col-12 col-sm-6 col-xl-4"
              key={lawyer._id}
            >

              <div
                className="position-relative overflow-hidden h-100"
                style={{
                  borderRadius: '30px',
                  background:
                    'linear-gradient(145deg, rgba(17,24,39,0.98), rgba(15,23,42,0.92))',
                  border: '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(18px)',
                  boxShadow:
                    '0 25px 50px rgba(0,0,0,0.45)',
                }}
              >

                {/* GOLD TOP LINE */}
                <div
                  style={{
                    height: '5px',
                    background:
                      'linear-gradient(to right, #fbbf24, #f59e0b, transparent)',
                  }}
                />

                {/* GOLD GLOW */}
                <div
                  className="position-absolute"
                  style={{
                    width: '250px',
                    height: '250px',
                    borderRadius: '50%',
                    background:
                      'rgba(251,191,36,0.08)',
                    top: '-100px',
                    right: '-100px',
                    filter: 'blur(50px)',
                  }}
                />

                <div className="p-3 p-md-4 position-relative">

                  {/* TOP SECTION */}
                  <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-4 mb-4 text-center text-sm-start">

                    {/* PROFILE IMAGE */}
                    <div className="position-relative flex-shrink-0">

                      <img
                        src={selectedImage}
                        alt={lawyer.name}
                        style={{
                          width: '110px',
                          height: '130px',
                          objectFit: 'cover',
                          borderRadius: '24px',
                          border:
                            '2px solid rgba(251,191,36,0.5)',
                          boxShadow:
                            '0 15px 35px rgba(0,0,0,0.4)',
                        }}
                      />

                      {/* VERIFIED BADGE */}
                      <div
                        className="position-absolute d-flex justify-content-center align-items-center"
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background:
                            'linear-gradient(135deg, #fbbf24, #f59e0b)',
                          bottom: '-10px',
                          right: '-10px',
                          border: '3px solid #111827',
                        }}
                      >
                        <ShieldCheck
                          size={18}
                          color="#111827"
                        />
                      </div>

                    </div>

                    {/* LAWYER INFO */}
                    <div className="flex-grow-1 w-100">

                      <div className="d-flex justify-content-center justify-content-sm-start align-items-center gap-2 mb-2">

                        <Star
                          size={15}
                          className="text-warning fill-warning"
                        />

                        <small
                          className="fw-bold"
                          style={{
                            color: '#fbbf24',
                            letterSpacing: '2px',
                          }}
                        >
                          TOP RATED
                        </small>

                      </div>

                      <h3
                        className="fw-bold text-white mb-1"
                        style={{
                          fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
                        }}
                      >
                        {lawyer.name}
                      </h3>

                      <div className="d-flex justify-content-center justify-content-sm-start align-items-center gap-2 mb-3">

                        <Scale
                          size={15}
                          className="text-warning"
                        />

                        <span
                          className="text-uppercase fw-semibold"
                          style={{
                            color: '#d1d5db',
                            letterSpacing: '1px',
                            fontSize: '13px',
                          }}
                        >
                          {lawyer.specialization}
                        </span>

                      </div>

                      <div
                        className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                        style={{
                          background:
                            'rgba(255,255,255,0.05)',
                          border:
                            '1px solid rgba(255,255,255,0.08)',
                        }}
                      >

                        <Award
                          size={14}
                          className="text-warning"
                        />

                        <small className="text-white fw-semibold">
                          Senior Partner
                        </small>

                      </div>

                    </div>

                  </div>

                  {/* STATS */}
                  <div className="row g-3 mb-4">

                    <div className="col-6">

                      <div
                        className="p-3 rounded-4 text-center h-100"
                        style={{
                          background:
                            'rgba(255,255,255,0.04)',
                          border:
                            '1px solid rgba(255,255,255,0.05)',
                        }}
                      >

                        <Briefcase
                          size={22}
                          className="text-warning mb-2"
                        />

                        <h5 className="text-white fw-bold mb-0">
                          {
                            experiences[
                              index % experiences.length
                            ]
                          }
                        </h5>

                        <small className="text-white-50">
                          Years
                        </small>

                      </div>

                    </div>

                    <div className="col-6">

                      <div
                        className="p-3 rounded-4 text-center h-100"
                        style={{
                          background:
                            'rgba(255,255,255,0.04)',
                          border:
                            '1px solid rgba(255,255,255,0.05)',
                        }}
                      >

                        <Award
                          size={22}
                          className="text-warning mb-2"
                        />

                        <h5 className="text-white fw-bold mb-0">
                          {
                            successRates[
                              index % successRates.length
                            ]
                          }
                        </h5>

                        <small className="text-white-50">
                          Success
                        </small>

                      </div>

                    </div>

                  </div>

                  {/* CONTACT SECTION */}
                  <div className="d-flex flex-column gap-3">

                    {/* EMAIL */}
                    <div
                      className="d-flex align-items-center gap-3 p-3 rounded-4 flex-wrap"
                      style={{
                        background:
                          'rgba(255,255,255,0.04)',
                        border:
                          '1px solid rgba(255,255,255,0.05)',
                      }}
                    >

                      <div
                        className="d-flex justify-content-center align-items-center rounded-circle flex-shrink-0"
                        style={{
                          width: '45px',
                          height: '45px',
                          background:
                            'rgba(251,191,36,0.12)',
                        }}
                      >
                        <Mail
                          size={18}
                          className="text-warning"
                        />
                      </div>

                      <div className="text-break">
                        <small className="text-white-50">
                          Email Address
                        </small>

                        <p className="text-white mb-0 fw-medium small">
                          {lawyer.email}
                        </p>
                      </div>

                    </div>

                    {/* PHONE */}
                    <div
                      className="d-flex align-items-center gap-3 p-3 rounded-4 flex-wrap"
                      style={{
                        background:
                          'rgba(255,255,255,0.04)',
                        border:
                          '1px solid rgba(255,255,255,0.05)',
                      }}
                    >

                      <div
                        className="d-flex justify-content-center align-items-center rounded-circle flex-shrink-0"
                        style={{
                          width: '45px',
                          height: '45px',
                          background:
                            'rgba(251,191,36,0.12)',
                        }}
                      >
                        <Phone
                          size={18}
                          className="text-warning"
                        />
                      </div>

                      <div>
                        <small className="text-white-50">
                          Contact Number
                        </small>

                        <p className="text-white mb-0 fw-medium">
                          {lawyer.phone}
                        </p>
                      </div>

                    </div>

                    {/* LOCATION */}
                    <div
                      className="d-flex align-items-center gap-3 p-3 rounded-4 flex-wrap"
                      style={{
                        background:
                          'rgba(255,255,255,0.04)',
                        border:
                          '1px solid rgba(255,255,255,0.05)',
                      }}
                    >

                      <div
                        className="d-flex justify-content-center align-items-center rounded-circle flex-shrink-0"
                        style={{
                          width: '45px',
                          height: '45px',
                          background:
                            'rgba(251,191,36,0.12)',
                        }}
                      >
                        <MapPin
                          size={18}
                          className="text-warning"
                        />
                      </div>

                      <div>
                        <small className="text-white-50">
                          Office Branch
                        </small>

                        <p className="text-white mb-0 fw-medium small">
                          {
                            californiaBranches[
                              index % californiaBranches.length
                            ]
                          }
                        </p>
                      </div>

                    </div>

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