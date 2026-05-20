import { useState, useCallback } from 'react'
import { FiDownload, FiExternalLink, FiBook, FiMaximize2, FiX } from 'react-icons/fi'
import './Resume.css'

const experience = [
  {
    type: 'education',
    icon: <FiBook />,
    title: 'B.Sc Artificial Intelligence Honours with Research',
    org: 'Central Tribal University of Andhra Pradesh',
    period: '2023 – 2027 (4th Year)',
    desc: 'Pursuing a 4-year B.Sc AI Honours with Research programme. Currently in the 4th year with a CGPA of 7.9. Specializing in AI, machine learning, and full-stack development.',
  },
  {
    type: 'education',
    icon: <FiBook />,
    title: 'Class 12th — MPC (Math, Physics, Chemistry)',
    org: 'Atal Aadarsh Vidyalaya, Lodi Estate, Delhi — CBSE Board',
    period: '2022 – 2023',
    desc: 'Completed higher secondary education with Mathematics, Physics, and Chemistry as core subjects from Atal Aadarsh Vidyalaya under CBSE Board. Scored 70% marks.',
  },
]

// Mobile browsers (Android/iOS) cannot render PDFs natively in iframes —
// they show a download/open prompt instead of the actual content.
// Google Docs Viewer converts the PDF to renderable HTML on-the-fly,
// so the resume appears visually on phones just like on desktop.
function getPdfSrc(fullscreen = false) {
  const isMobile =
    typeof navigator !== 'undefined' &&
    (navigator.maxTouchPoints > 0 || /Mobi|Android/i.test(navigator.userAgent))

  const absoluteUrl = `${window.location.origin}/resume.pdf`

  if (isMobile) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`
  }

  // Desktop — native browser PDF rendering
  return fullscreen
    ? '/resume.pdf#toolbar=1&view=FitH&zoom=page-width'
    : '/resume.pdf#toolbar=0&view=FitH'
}

export default function Resume() {
  const [fullscreen, setFullscreen] = useState(false)

  const handleDownload = useCallback(async () => {
    try {
      const res = await fetch('/resume.pdf')
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      const forceBlob = new Blob([blob], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(forceBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Rajesh_Mishra_Resume.pdf'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 200)
    } catch {
      window.open('/resume.pdf', '_blank')
    }
  }, [])

  return (
    <section id="resume" className="section resume">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Academic Background</p>
          <h2 className="section-title">My <span>Education</span></h2>
          <p className="section-subtitle">My academic journey from school to university</p>
        </div>

        <div className="resume__layout">
          {/* Timeline */}
          <div className="resume__timeline">
            {experience.map((item, i) => (
              <div key={i} className={`timeline-item timeline-item--${item.type}`}>
                <div className="timeline-item__icon">{item.icon}</div>
                <div className="timeline-item__line" />
                <div className="timeline-item__card glass-card">
                  <div className="timeline-item__header">
                    <span className="timeline-item__period">{item.period}</span>
                    <span className={`tag ${item.type === 'education' ? 'tag-cyan' : ''}`}>
                      {item.type === 'education' ? 'Education' : item.type === 'project' ? 'Project' : 'Achievement'}
                    </span>
                  </div>
                  <h3 className="timeline-item__title">{item.title}</h3>
                  <p className="timeline-item__org">{item.org}</p>
                  <p className="timeline-item__desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Resume PDF Panel */}
          <div className="resume__pdf-panel">
            <div className="resume__pdf-header">
              <h3 className="resume__pdf-title">📄 My Resume</h3>
              <div className="resume__pdf-actions">
                <button
                  className="resume__pdf-btn"
                  onClick={() => setFullscreen(true)}
                  title="Fullscreen"
                >
                  <FiMaximize2 size={16} />
                </button>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="resume__pdf-btn"
                  title="Open in new tab"
                >
                  <FiExternalLink size={16} />
                </a>
                <button
                  onClick={handleDownload}
                  className="resume__pdf-btn resume__pdf-btn--primary"
                  title="Download Resume"
                >
                  <FiDownload size={16} /> Download
                </button>
              </div>
            </div>

            <div className="resume__pdf-embed-wrap glass-card">
              <iframe
                src={getPdfSrc(false)}
                title="Rajesh Mishra Resume"
                className="resume__pdf-iframe"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreen && (
        <div className="resume__fullscreen-overlay" onClick={() => setFullscreen(false)}>
          <div className="resume__fullscreen-modal" onClick={e => e.stopPropagation()}>
            <div className="resume__fullscreen-header">
              <span className="resume__fullscreen-title">Rajesh Mishra — Resume</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleDownload}
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  <FiDownload size={15} /> Download
                </button>
                <button className="resume__fullscreen-close" onClick={() => setFullscreen(false)}>
                  <FiX size={20} />
                </button>
              </div>
            </div>
            <iframe
              src={getPdfSrc(true)}
              title="Resume Fullscreen"
              className="resume__fullscreen-iframe"
            />
          </div>
        </div>
      )}
    </section>
  )
}
