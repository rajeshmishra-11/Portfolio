import { useState, useEffect } from 'react'
import { FiX, FiAward, FiCalendar, FiDownload, FiExternalLink, FiMaximize2 } from 'react-icons/fi'
import { fetchPortfolioData } from '../portfolioApi'
import './Certificates.css'

// Your real certificates
const staticCertificates = [
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

const COLORS = ['#7c3aed', '#00758f', '#f59e0b', '#06b6d4', '#22c55e', '#e11d48']

export default function Certificates({ data }) {
  const [list, setList] = useState(staticCertificates)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    async function load() {
      const finalData = data || await fetchPortfolioData()
      if (finalData && finalData.certificates && finalData.certificates.length > 0) {
        const processed = finalData.certificates.map((c, i) => {
          const file = c.file || c.image || ''
          return {
            ...c,
            color: (c.color && c.color !== '#06b6d4') ? c.color : COLORS[i % COLORS.length],
            file: file,
            type: c.type || (file.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'),
            description: c.description || `Certificate from ${c.issuer}`
          }
        })
        setList(processed)
      }
    }
    load()
  }, [data])


  return (
    <section id="certificates" className="section certificates">
      <div className="container">
        <div className="section-header">
          <p className="section-label">My Credentials</p>
          <h2 className="section-title">Certificates & <span>Achievements</span></h2>
          <p className="section-subtitle">Real credentials earned through hard work and dedication</p>
        </div>

        <div className="certificates__grid">
          {list.map((cert) => (
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
              {selected.file && selected.file.includes('drive.google.com') ? (() => {
                const fileDMatch = selected.file.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
                const idMatch = selected.file.match(/[?&]id=([a-zA-Z0-9_-]+)/)
                const fileId = fileDMatch ? fileDMatch[1] : (idMatch ? idMatch[1] : '')
                const previewUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : selected.file
                return (
                  <iframe
                    src={previewUrl}
                    title={selected.title}
                    className="cert-modal__iframe"
                  />
                )
              })() : selected.type === 'pdf' ? (() => {
                const isMobile = navigator.maxTouchPoints > 0 || /Mobi|Android/i.test(navigator.userAgent)
                const pdfUrl = isMobile
                  ? `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + selected.file)}&embedded=true`
                  : `${selected.file}#view=FitH`
                return (
                  <iframe
                    src={pdfUrl}
                    title={selected.title}
                    className="cert-modal__iframe"
                  />
                )
              })() : (
                <img
                  src={selected.file.includes('drive.google.com') ? `https://drive.google.com/uc?export=download&id=${selected.file.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] || selected.file.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1] || ''}` : selected.file}
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
