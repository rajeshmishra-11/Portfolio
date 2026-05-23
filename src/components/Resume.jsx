import { useState, useEffect, useCallback } from 'react'
import { FiDownload, FiExternalLink, FiBook, FiMaximize2, FiX } from 'react-icons/fi'
import { fetchPortfolioData } from '../portfolioApi'
import './Resume.css'

const staticEducation = [
  {
    title: 'B.Sc Artificial Intelligence Honours with Research',
    org: 'Central Tribal University of Andhra Pradesh',
    period: '2023 – 2027 (4th Year)',
    desc: 'Pursuing a 4-year B.Sc AI Honours with Research programme. Currently in the 4th year with a CGPA of 7.9. Specializing in AI, machine learning, and full-stack development.',
  },
  {
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
function getPdfSrc(url, fullscreen = false) {
  const isMobile =
    typeof navigator !== 'undefined' &&
    (navigator.maxTouchPoints > 0 || /Mobi|Android/i.test(navigator.userAgent))

  // If it's a Google Drive link, use the preview URL directly
  if (url.includes('drive.google.com')) {
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    const fileId = fileDMatch ? fileDMatch[1] : (idMatch ? idMatch[1] : '')
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`
    }
  }

  const absoluteUrl = url.startsWith('http') 
    ? url 
    : `${window.location.origin}${url}`

  if (isMobile) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`
  }

  // Desktop — native browser PDF rendering
  return fullscreen
    ? `${url}#toolbar=1&view=FitH&zoom=page-width`
    : `${url}#toolbar=0&view=FitH`
}

const COLORS = ['#7c3aed', '#00758f', '#f59e0b', '#06b6d4', '#22c55e', '#e11d48']

export default function Resume({ data }) {
  const [fullscreen, setFullscreen] = useState(false)
  const [resumeUrl, setResumeUrl] = useState('/resume.pdf')
  const [list, setList] = useState(() => 
    staticEducation.map((e, idx) => ({
      ...e,
      color: COLORS[idx % COLORS.length]
    }))
  )

  useEffect(() => {
    async function load() {
      const finalData = data || await fetchPortfolioData()
      if (finalData) {
        if (finalData.education && finalData.education.length > 0) {
          const processed = finalData.education.map((e, idx) => ({
            ...e,
            color: (e.color && e.color !== '#06b6d4') ? e.color : COLORS[idx % COLORS.length]
          }))
          setList(processed)
        }
        if (finalData.profile && finalData.profile.resume_url) {
          setResumeUrl(finalData.profile.resume_url)
        }
      }
    }
    load()
  }, [data])

  const handleDownload = useCallback(async () => {
    if (resumeUrl.startsWith('http')) {
      window.open(resumeUrl, '_blank')
      return
    }
    try {
      const res = await fetch(resumeUrl)
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
      window.open(resumeUrl, '_blank')
    }
  }, [resumeUrl])

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
            {list.map((item, i) => (
              <div key={item.id || i} className="timeline-item timeline-item--education">
                <div 
                  className="timeline-item__icon"
                  style={{ 
                    background: `linear-gradient(135deg, ${item.color}, ${item.color}bb)`,
                    boxShadow: `0 0 20px ${item.color}66`
                  }}
                >
                  <FiBook />
                </div>
                <div className="timeline-item__line" />
                <div 
                  className="timeline-item__card glass-card"
                  style={{ 
                    borderLeft: `4px solid ${item.color}`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div 
                    className="timeline-item__glow" 
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      background: `radial-gradient(circle at top right, ${item.color}0c, transparent 60%)`,
                      pointerEvents: 'none' 
                    }} 
                  />
                  <div className="timeline-item__header">
                    <span className="timeline-item__period">{item.period}</span>
                    <span 
                      className="tag"
                      style={{
                        background: `${item.color}15`,
                        color: item.color,
                        border: `1px solid ${item.color}33`
                      }}
                    >
                      Education
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
                  href={resumeUrl}
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
                src={getPdfSrc(resumeUrl, false)}
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
              src={getPdfSrc(resumeUrl, true)}
              title="Resume Fullscreen"
              className="resume__fullscreen-iframe"
            />
          </div>
        </div>
      )}
    </section>
  )
}
