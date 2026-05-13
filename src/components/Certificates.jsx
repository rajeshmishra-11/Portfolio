import { useState } from 'react'
import { FiX, FiAward, FiCalendar, FiDownload, FiExternalLink, FiMaximize2 } from 'react-icons/fi'
import './Certificates.css'

// Your real certificates
const certificates = [
  {
    id: 1,
    title: 'Software Engineer Intern',
    issuer: 'HackerRank',
    date: '2024',
    description: 'Certification for completing the Software Engineer Intern assessment on HackerRank, demonstrating proficiency in core software engineering concepts.',
    file: '/certificates/software_engineer_intern.pdf',
    type: 'pdf',
    color: '#7c3aed',
  },
  {
    id: 2,
    title: 'SQL (Basic)',
    issuer: 'HackerRank',
    date: '2024',
    description: 'Demonstrates foundational knowledge of SQL — covering SELECT queries, filtering, aggregation, and relational database concepts.',
    file: '/certificates/sql_basic.pdf',
    type: 'pdf',
    color: '#00758f',
  },
  {
    id: 3,
    title: 'TechSprint 2k25',
    issuer: 'Tech Competition',
    date: '2025',
    description: 'Participation and achievement certificate from TechSprint 2025, a competitive technical event showcasing problem-solving and innovation skills.',
    file: '/certificates/techsprint_2k25.pdf',
    type: 'pdf',
    color: '#f59e0b',
  },
  {
    id: 4,
    title: 'IIITM Gwalior',
    issuer: 'IIITM Gwalior',
    date: '2026',
    description: 'Certificate from the Indian Institute of Information Technology & Management Gwalior — a prestigious recognition of academic or event participation.',
    file: '/certificates/iiitm_gwalior.jpg',
    type: 'image',
    color: '#06b6d4',
  },
]

export default function Certificates() {
  const [selected, setSelected] = useState(null)

  return (
    <section id="certificates" className="section certificates">
      <div className="container">
        <div className="section-header">
          <p className="section-label">My Credentials</p>
          <h2 className="section-title">Certificates & <span>Achievements</span></h2>
          <p className="section-subtitle">Real credentials earned through hard work and dedication</p>
        </div>

        <div className="certificates__grid">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="cert-card glass-card"
              onClick={() => setSelected(cert)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelected(cert)}
            >
              <div className="cert-card__bar" style={{ background: cert.color }} />
              <div className="cert-card__inner">
                <div className="cert-card__icon-wrap" style={{ background: `${cert.color}22`, border: `1px solid ${cert.color}44` }}>
                  <FiAward size={28} style={{ color: cert.color }} />
                </div>
                <div className="cert-card__body">
                  <h3 className="cert-card__title">{cert.title}</h3>
                  <p className="cert-card__issuer">{cert.issuer}</p>
                  <div className="cert-card__meta">
                    <FiCalendar size={12} />
                    <span>{cert.date}</span>
                  </div>
                </div>
              </div>
              <div className="cert-card__view-hint">Click to view certificate →</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Viewer */}
      {selected && (
        <div className="cert-modal-overlay" onClick={() => setSelected(null)}>
          <div className="cert-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="cert-modal__header">
              <div className="cert-modal__header-info">
                <div className="cert-modal__header-icon" style={{ background: `${selected.color}22`, border: `1px solid ${selected.color}44` }}>
                  <FiAward size={20} style={{ color: selected.color }} />
                </div>
                <div>
                  <h3 className="cert-modal__title">{selected.title}</h3>
                  <p className="cert-modal__issuer">{selected.issuer} · {selected.date}</p>
                </div>
              </div>
              <div className="cert-modal__header-actions">
                <a
                  href={selected.file}
                  download
                  className="cert-modal__action-btn"
                  title="Download"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiDownload size={16} />
                </a>
                <a
                  href={selected.file}
                  target="_blank"
                  rel="noreferrer"
                  className="cert-modal__action-btn"
                  title="Open in new tab"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiExternalLink size={16} />
                </a>
                <button className="cert-modal__close" onClick={() => setSelected(null)}>
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Certificate Viewer */}
            <div className="cert-modal__viewer">
              {selected.type === 'pdf' ? (
                <iframe
                  src={`${selected.file}#view=FitH`}
                  title={selected.title}
                  className="cert-modal__iframe"
                />
              ) : (
                <img
                  src={selected.file}
                  alt={selected.title}
                  className="cert-modal__img"
                />
              )}
            </div>

            {/* Description */}
            <div className="cert-modal__desc-bar">
              <p>{selected.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
