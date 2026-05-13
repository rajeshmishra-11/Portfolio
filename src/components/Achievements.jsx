import { useState } from 'react'
import { FiStar, FiCode, FiUsers, FiTrendingUp, FiZap, FiX, FiExternalLink, FiDownload } from 'react-icons/fi'
import './Achievements.css'

const achievements = [
  {
    id: 1,
    icon: <FiUsers />,
    color: '#7c3aed',
    title: 'Campus Mantri',
    org: 'GeeksforGeeks',
    year: '2026',
    desc: 'Selected as Campus Mantri for my college — an official campus representative role at GeeksforGeeks, driving student engagement and opportunities on campus.',
    image: '/achievements/campus-mantri-offerletter.jpeg',
    hasProof: true,
    proofLabel: 'View Offer Letter',
  },
  {
    id: 2,
    icon: <FiTrendingUp />,
    color: '#06b6d4',
    title: 'Learning Record — GeeksforGeeks',
    org: 'GeeksforGeeks',
    year: '2026',
    desc: 'Solved 300+ coding problems on GeeksforGeeks, consistently ranked among active learners. Strong focus on Data Structures, Algorithms, and Python programming.',
    image: '/achievements/lro-gfg.png',
    hasProof: true,
    proofLabel: 'View Record',
    link: 'https://www.geeksforgeeks.org/profile/rajeshmishhica',
  },
  {
    id: 3,
    icon: <FiCode />,
    color: '#f59e0b',
    title: 'Smart Study System — Minor Project',
    org: 'Academic Project',
    year: '2026',
    desc: 'Led full-stack development of an AI-assisted study system for tribal students, praised by faculty for its real-world social impact.',
    image: null,
    hasProof: false,
    proofLabel: null,
  },
  {
    id: 4,
    icon: <FiStar />,
    color: '#22c55e',
    title: '5+ Projects Completed',
    org: 'Personal & Academic',
    year: '2023–26',
    desc: 'Built and deployed 5+ end-to-end projects spanning healthcare, education, and productivity — including HealthConnect and Expense Tracker.',
    image: null,
    hasProof: false,
    proofLabel: null,
    link: 'https://github.com/rajeshmishra-11',
  },
  {
    id: 5,
    icon: <FiZap />,
    color: '#f89820',
    title: '300+ Problems Solved',
    org: 'GeeksforGeeks / LeetCode',
    year: '2024–26',
    desc: 'Solved 300+ coding problems on GeeksforGeeks and LeetCode, continuously strengthening Data Structures and Algorithm skills in Python.',
    image: null,
    hasProof: false,
    proofLabel: null,
    link: 'https://www.geeksforgeeks.org/profile/rajeshmishhica',
  },
  {
    id: 6,
    icon: <FiUsers />,
    color: '#ec4899',
    title: 'TechSprint 2k25 Participant',
    org: 'Tech Competition',
    year: '2025',
    desc: 'Competed in TechSprint 2025, a competitive technical event showcasing problem-solving skills, rapid development, and innovative thinking.',
    image: '/certificates/techsprint_2k25.pdf',
    hasProof: true,
    proofLabel: 'View Certificate',
  },
]

export default function Achievements() {
  const [selected, setSelected] = useState(null)

  return (
    <section id="achievements" className="section achievements">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Highlights</p>
          <h2 className="section-title">Extracurricular <span>Activities</span></h2>
          <p className="section-subtitle">Key accomplishments that define my journey</p>
        </div>

        <div className="achievements__grid">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`achievement-card glass-card ${a.hasProof ? 'achievement-card--clickable' : ''}`}
              onClick={() => a.hasProof && setSelected(a)}
              role={a.hasProof ? 'button' : undefined}
              tabIndex={a.hasProof ? 0 : undefined}
              onKeyDown={(e) => a.hasProof && e.key === 'Enter' && setSelected(a)}
            >
              <div className="achievement-card__glow" style={{ background: `radial-gradient(circle at bottom right, ${a.color}18, transparent 60%)` }} />

              <div className="achievement-card__header">
                <div className="achievement-card__icon" style={{ background: `${a.color}22`, color: a.color, border: `1px solid ${a.color}44` }}>
                  {a.icon}
                </div>
                <div className="achievement-card__meta">
                  <span className="achievement-card__year">{a.year}</span>
                  {a.hasProof && (
                     <span className="achievement-card__proof-badge">
                       📎 Proof
                     </span>
                  )}
                </div>
              </div>

              <h3 className="achievement-card__title">{a.title}</h3>
              <p className="achievement-card__org">{a.org}</p>
              <p className="achievement-card__desc">{a.desc}</p>

              {a.hasProof && (
                <div className="achievement-card__view-hint">
                  {a.proofLabel} →
                </div>
              )}
              {a.link && !a.hasProof && (
                <a href={a.link} target="_blank" rel="noreferrer" className="achievement-card__view-hint" style={{ color: a.color, zIndex: 10, position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                  View Profile →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selected && (
        <div className="achievement-modal-overlay" onClick={() => setSelected(null)}>
          <div className="achievement-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="achievement-modal__header">
              <div className="achievement-modal__header-info">
                <div className="achievement-modal__header-icon" style={{ background: `${selected.color}22`, border: `1px solid ${selected.color}44`, color: selected.color }}>
                  {selected.icon}
                </div>
                <div>
                  <h3 className="achievement-modal__title">{selected.title}</h3>
                  <p className="achievement-modal__org">{selected.org} · {selected.year}</p>
                </div>
              </div>
              <div className="achievement-modal__actions">
                <a
                  href={selected.image}
                  download
                  className="achievement-modal__btn"
                  title="Download"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiDownload size={16} />
                </a>
                <a
                  href={selected.image}
                  target="_blank"
                  rel="noreferrer"
                  className="achievement-modal__btn"
                  title="Open in new tab"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiExternalLink size={16} />
                </a>
                <button className="achievement-modal__close" onClick={() => setSelected(null)}>
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Document / Image Viewer */}
            <div className="achievement-modal__viewer">
              {selected.image?.endsWith('.pdf') ? (
                <iframe
                  src={`${selected.image}#view=FitH`}
                  title={selected.title}
                  style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'var(--radius-sm)' }}
                />
              ) : (
                <img
                  src={selected.image}
                  alt={selected.title}
                  className="achievement-modal__img"
                />
              )}
            </div>

            <div className="achievement-modal__desc-bar">
              <p>{selected.desc}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
