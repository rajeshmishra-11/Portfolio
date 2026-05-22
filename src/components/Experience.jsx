import { useState, useEffect } from 'react'
import { FiBriefcase, FiCompass, FiAward, FiBookOpen, FiArrowRight, FiFileText, FiX, FiDownload, FiExternalLink, FiAlertCircle } from 'react-icons/fi'
import { fetchPortfolioData } from '../portfolioApi'
import './Experience.css'

export default function Experience() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProof, setSelectedProof] = useState(null)
  const [docLoadFailed, setDocLoadFailed] = useState(false)
  const [loadingDoc, setLoadingDoc] = useState(false)


  useEffect(() => {
    async function load() {
      try {
        const data = await fetchPortfolioData()
        if (data && data.experiences) {
          setList(data.experiences)
        }
      } catch (err) {
        console.error("Failed to load experiences", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Smart document server check to identify missing files
  useEffect(() => {
    if (selectedProof && selectedProof.proof) {
      const absoluteUrl = selectedProof.proof.startsWith('http') 
        ? selectedProof.proof 
        : `${window.location.origin}${selectedProof.proof}`
      
      setDocLoadFailed(false)
      setLoadingDoc(true)

      fetch(absoluteUrl, { method: 'HEAD' })
        .then((res) => {
          if (!res.ok) {
            setDocLoadFailed(true)
          }
        })
        .catch(() => {
          setDocLoadFailed(true)
        })
        .finally(() => {
          setLoadingDoc(false)
        })
    }
  }, [selectedProof])

  return (
    <section id="experience" className="section experience">
      <div className="container">
        <div className="section-header">
          <p className="section-label">My Career</p>
          <h2 className="section-title">Professional <span>Experience</span></h2>
          <p className="section-subtitle">Milestones of my engineering and professional journey</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-secondary)' }}>
            Loading professional journey...
          </div>
        ) : list.length === 0 ? (
          /* Premium Custom Empty State Placeholder Card */
          <div className="experience-empty glass-card">
            <div className="experience-empty__accent" />
            <div className="experience-empty__icon-container">
              <FiBriefcase className="experience-empty__icon" size={40} />
              <div className="experience-empty__pulse" />
            </div>
            <h3 className="experience-empty__title">Journey is Just Beginning</h3>
            <p className="experience-empty__desc">
              My professional journey is just beginning. Excited to list upcoming milestones soon!
            </p>
            <div className="experience-empty__footer-badge">
              <span>Ready for Opportunities</span>
            </div>
          </div>
        ) : (
          /* Advanced Single-Sided Left-Aligned Timeline Flow */
          <div className="experience-timeline">
            {/* List of experiences */}
            {list.map((exp, idx) => {
              const projectsList = exp.projects_worked
                ? exp.projects_worked.split('\n').filter(p => p.trim() !== '')
                : []
              const learningsList = exp.what_learned
                ? exp.what_learned.split(',').map(l => l.trim()).filter(l => l !== '')
                : []

              const nextExp = list[idx + 1]
              const hasNext = !!nextExp

              return (
                <div
                  key={exp.id}
                  className="timeline-item"
                  style={{ 
                    '--exp-color': exp.color, 
                    '--exp-accent-border': `${exp.color}25`,
                    '--exp-accent-bg': `${exp.color}06`,
                    '--exp-accent-bg-hover': `${exp.color}1a`,
                    '--exp-glow': `${exp.color}33`
                  }}
                >
                  {/* Timeline connector and glowing node */}
                  <div className="timeline-item__node-container">
                    <div className="timeline-item__node" style={{ backgroundColor: exp.color, boxShadow: `0 0 15px ${exp.color}` }}>
                      <FiBriefcase size={16} />
                      <div className="timeline-item__node-pulse" style={{ borderColor: exp.color }} />
                    </div>
                    
                    {/* Vertical line connecting from the current node down to the next node */}
                    {hasNext && (
                      <div 
                        className="timeline-item__connector-vertical" 
                        style={{ 
                          background: `linear-gradient(to bottom, ${exp.color}, ${nextExp.color})` 
                        }} 
                      />
                    )}
                    
                    <div className="timeline-item__connector" />
                  </div>

                  {/* Wide Glassmorphic Card */}
                  <div className="timeline-item__card glass-card">
                    <div className="timeline-item__card-accent" style={{ background: `radial-gradient(circle at top left, ${exp.color}18, transparent 60%)` }} />
                    
                    {/* Inner 2-column Grid Layout for Desktop */}
                    <div className="timeline-item__card-grid">
                      {/* Left Column: Role, Company, Description, and Bullet points */}
                      <div className="timeline-item__main-info">
                        <div className="timeline-item__card-header">
                          <h3 className="timeline-item__role">{exp.role}</h3>
                          <h4 className="timeline-item__company">
                            {exp.company}
                          </h4>
                        </div>
                        
                        <p className="timeline-item__desc">{exp.description}</p>
                        
                        {projectsList.length > 0 && (
                          <div className="timeline-item__section">
                            <h5 className="timeline-item__section-title">
                              <FiCompass size={14} style={{ color: exp.color }} /> Core Contributions & Projects
                            </h5>
                            <ul className="timeline-item__bullets">
                              {projectsList.map((proj, pIdx) => (
                                <li key={pIdx}>
                                  <span className="bullet-dot" style={{ background: exp.color }} />
                                  {proj}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Duration, Tech Stack, and Verification Card */}
                      <div className="timeline-item__side-info">
                        {/* Floating Glowing Duration Capsule */}
                        <div className="timeline-item__duration-badge" style={{ backgroundColor: `${exp.color}18`, border: `1px solid ${exp.color}44`, color: exp.color }}>
                          {exp.duration}
                        </div>

                        {/* Skills and Learnings tag cloud */}
                        {learningsList.length > 0 && (
                          <div className="timeline-item__section">
                            <h5 className="timeline-item__section-title">
                              <FiAward size={14} style={{ color: exp.color }} /> Skills & Technologies
                            </h5>
                            <div className="timeline-item__tags">
                              {learningsList.map((learn, lIdx) => (
                                <span 
                                  key={lIdx} 
                                  className="timeline-tag" 
                                  style={{ 
                                    border: `1px solid ${exp.color}33`, 
                                    background: `${exp.color}0a`,
                                    '--hover-glow': exp.color,
                                    '--hover-bg': `${exp.color}1a`
                                  }}
                                >
                                  {learn}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Verification Card */}
                        {exp.proof && (
                          <div className="timeline-item__verification-panel" style={{ border: `1px solid ${exp.color}25`, background: `${exp.color}05` }}>
                            <div className="timeline-item__verification-status">
                              <span className="verification-status__dot" style={{ backgroundColor: exp.color }} />
                              <span className="verification-status__text">Verification Attached</span>
                            </div>
                            <button 
                              onClick={() => setSelectedProof(exp)}
                              className="timeline-item__verification-btn"
                              style={{ 
                                '--btn-color': exp.color,
                                '--btn-hover-bg': `${exp.color}15`
                              }}
                            >
                              <FiFileText size={15} />
                              <span>View Proof</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Verification Modal Viewer */}
      {selectedProof && (
        <div className="exp-modal-overlay" onClick={() => setSelectedProof(null)}>
          <div className="exp-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="exp-modal__header">
              <div className="exp-modal__header-info">
                <div className="exp-modal__header-icon" style={{ background: `${selectedProof.color}22`, border: `1px solid ${selectedProof.color}44` }}>
                  <FiBriefcase size={20} style={{ color: selectedProof.color }} />
                </div>
                <div>
                  <h3 className="exp-modal__title">Experience Verification</h3>
                  <p className="exp-modal__company">{selectedProof.role} · {selectedProof.company}</p>
                </div>
              </div>
              <div className="exp-modal__header-actions">
                <a
                  href={selectedProof.proof.startsWith('http') ? selectedProof.proof : `${window.location.origin}${selectedProof.proof}`}
                  download
                  className="exp-modal__action-btn"
                  title="Download"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiDownload size={16} />
                </a>
                <a
                  href={selectedProof.proof.startsWith('http') ? selectedProof.proof : `${window.location.origin}${selectedProof.proof}`}
                  target="_blank"
                  rel="noreferrer"
                  className="exp-modal__action-btn"
                  title="Open in new tab"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiExternalLink size={16} />
                </a>
                <button className="exp-modal__close" onClick={() => setSelectedProof(null)}>
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Document Viewer */}
            <div className="exp-modal__viewer">
              {loadingDoc ? (
                <div className="exp-modal__spinner-state">
                  <div className="exp-modal__spinner" style={{ borderTopColor: selectedProof.color }} />
                  <p>Verifying verification certificate...</p>
                </div>
              ) : docLoadFailed || !selectedProof.proof || selectedProof.proof.trim() === '' ? (
                /* Gorgeous, informative custom warning card when file fails to load or 404s */
                <div className="exp-modal__error-state">
                  <div className="exp-modal__error-card">
                    <FiAlertCircle size={48} className="exp-modal__error-icon" />
                    <h4 className="exp-modal__error-title">Verification Document Not Found</h4>
                    <p className="exp-modal__error-desc">
                      The employment verification document or experience certificate for this position is currently unavailable or has not been uploaded yet on the server.
                    </p>
                    <div className="exp-modal__error-details">
                      <span>Status Code: 404 Not Found</span>
                      <span>Target: {selectedProof.proof || 'No proof file path specified'}</span>
                    </div>
                  </div>
                </div>
              ) : selectedProof.proof.toLowerCase().endsWith('.pdf') ? (() => {
                const isMobile = navigator.maxTouchPoints > 0 || /Mobi|Android/i.test(navigator.userAgent)
                const absoluteUrl = selectedProof.proof.startsWith('http') 
                  ? selectedProof.proof 
                  : `${window.location.origin}${selectedProof.proof}`
                
                const pdfUrl = isMobile
                  ? `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`
                  : `${absoluteUrl}#view=FitH`
                return (
                  <iframe
                    src={pdfUrl}
                    title={selectedProof.company}
                    className="exp-modal__iframe"
                  />
                )
              })() : (
                <img
                  src={selectedProof.proof.startsWith('http') ? selectedProof.proof : `${window.location.origin}${selectedProof.proof}`}
                  alt={selectedProof.company}
                  className="exp-modal__img"
                />
              )}
            </div>

            {/* Description */}
            <div className="exp-modal__desc-bar">
              <p>{selectedProof.description || `Verification record for ${selectedProof.role} role at ${selectedProof.company}.`}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
