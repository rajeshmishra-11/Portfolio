import { useEffect, useRef } from 'react'
import { SiPython, SiFlask, SiReact, SiMysql, SiHtml5, SiCss, SiJavascript, SiGit, SiDocker, SiPostman, SiFastapi, SiGooglecloud, SiBootstrap } from 'react-icons/si'
import { FiCode, FiServer, FiDatabase, FiCloud } from 'react-icons/fi'
import './Skills.css'

// Only skills from the resume — Python is strongest
const skillBars = [
  { name: 'Python',       icon: <SiPython />,     color: '#3776ab', level: 90 },
  { name: 'C / C++',     icon: <FiCode />,       color: '#00599c', level: 72 },
  { name: 'JavaScript',  icon: <SiJavascript />, color: '#f7df1e', level: 75 },
  { name: 'HTML / CSS',  icon: <SiHtml5 />,      color: '#e34f26', level: 82 },
  { name: 'React.js',   icon: <SiReact />,      color: '#61dafb', level: 78 },
  { name: 'MySQL / SQL', icon: <SiMysql />,      color: '#00758f', level: 80 },
]

const techCategories = [
  {
    label: 'Frameworks',
    color: '#06b6d4',
    items: [
      { icon: <SiFlask />, name: 'Flask', color: '#ffffff' },
      { icon: <SiReact />, name: 'React', color: '#61dafb' },
      { icon: <SiFastapi />, name: 'FastAPI', color: '#009688' },
      { icon: <FiServer />, name: 'REST API', color: '#06b6d4' },
      { icon: <SiBootstrap />, name: 'Bootstrap', color: '#7952b3' },
    ],
  },
  {
    label: 'Cloud & Tools',
    color: '#f59e0b',
    items: [
      { icon: <FiCloud />, name: 'AWS', color: '#ff9900' },
      { icon: <SiGooglecloud />, name: 'GCP', color: '#4285f4' },
      { icon: <SiDocker />, name: 'Docker', color: '#2496ed' },
      { icon: <SiGit />, name: 'Git', color: '#f05032' },
      { icon: <SiPostman />, name: 'Postman', color: '#ff6c37' },
      { icon: <SiMysql />, name: 'MySQL', color: '#00758f' },
      { icon: <FiCloud />, name: 'Render', color: '#46e3b7' },
    ],
  },
]

export default function Skills() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.skill-bar__fill').forEach(bar => {
            bar.style.width = bar.dataset.level + '%'
          })
        }
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="skills" className="section skills" ref={sectionRef}>
      <div className="container">
        <div className="section-header">
          <p className="section-label">What I Know</p>
          <h2 className="section-title">My <span>Tech Stack</span></h2>
          <p className="section-subtitle">Technologies and tools from my resume — Python is my strongest language</p>
        </div>

        <div className="skills__top">
          {/* Proficiency Bars */}
          <div className="skills__bars glass-card">
            <h3 className="skills__subtitle">
              <span className="skills__subtitle-dot" style={{ background: '#7c3aed' }} />
              Language Proficiency
            </h3>
            <div className="skills__bar-list">
              {skillBars.map((s) => (
                <div key={s.name} className="skill-bar">
                  <div className="skill-bar__header">
                    <span className="skill-bar__name">
                      <span className="skill-bar__lang-icon" style={{ color: s.color }}>{s.icon}</span>
                      {s.name}
                      {s.name === 'Python' && <span className="skill-bar__badge">★ Strongest</span>}
                    </span>
                    <span className="skill-bar__pct">{s.level}%</span>
                  </div>
                  <div className="skill-bar__track">
                    <div className="skill-bar__fill" data-level={s.level} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SE Principles */}
          <div className="skills__principles glass-card">
            <h3 className="skills__subtitle">
              <span className="skills__subtitle-dot" style={{ background: '#06b6d4' }} />
              Software Engineering
            </h3>
            <div className="skills__principles-list">
              {['SDLC', 'Agile Methodology', 'Software Design Principles', 'RESTful APIs', 'JWT Authentication', 'Cloud Deployment'].map(p => (
                <div key={p} className="principle-tag">
                  <span className="principle-tag__dot" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Category Grid */}
        <div className="skills__categories">
          {techCategories.map((cat) => (
            <div key={cat.label} className="skills__category glass-card">
              <h4 className="skills__category-title" style={{ color: cat.color }}>
                <span className="skills__subtitle-dot" style={{ background: cat.color }} />
                {cat.label}
              </h4>
              <div className="skills__category-items">
                {cat.items.map((t) => (
                  <div key={t.name} className="tech-badge glass-card">
                    <div className="tech-badge__icon" style={{ color: t.color }}>{t.icon}</div>
                    <span className="tech-badge__name">{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
