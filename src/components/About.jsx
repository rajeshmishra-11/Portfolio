import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-scroll'
import { FiCode, FiAward, FiBook, FiUsers } from 'react-icons/fi'
import './About.css'

const stats = [
  { icon: <FiCode />, value: 6, label: 'Projects Built', suffix: '', to: 'projects' },
  { icon: <FiAward />, value: 4, label: 'Certificates', suffix: '', to: 'certificates' },
  { icon: <FiBook />, value: 3, label: 'Years Learning', suffix: '', to: 'skills' },
  { icon: <FiUsers />, value: 2, label: 'Team Projects', suffix: '', to: 'projects' },
]

function AnimatedCounter({ value, suffix }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let current = 0
        const step = Math.ceil(value / 40)
        const timer = setInterval(() => {
          current += step
          if (current >= value) { setCount(value); clearInterval(timer) }
          else setCount(current)
        }, 40)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function About() {
  const sectionRef = useRef(null)

  const handleDownload = useCallback(async () => {
    try {
      const res = await fetch('/resume.pdf')
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      // Use octet-stream to force download instead of browser PDF preview
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('in-view') },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className="section about" ref={sectionRef}>
      <div className="container">
        <div className="about__grid">
          <div className="about__image-col reveal-left">
            <div className="about__image-wrap">
              <div className="about__image-blob" />
              <div className="about__avatar">
                <img src="/profile.jpg" alt="Rajesh Mishra" className="about__avatar-img" />
              </div>
              <div className="about__image-ring" />
            </div>
          </div>

          <div className="about__content reveal-right">
            <p className="section-label">About Me</p>
            <h2 className="section-title">
              Crafting Digital <span>Experiences</span>
            </h2>
            <p className="about__bio">
              I am a motivated and detail-oriented Software Developer with a strong foundation
              in Python, full-stack web development, and problem-solving. I have experience
              building responsive and user-focused applications using technologies such as
              Python, Flask, React, MySQL, JavaScript, and Bootstrap.
            </p>
            <p className="about__bio">
              I am passionate about creating efficient and scalable solutions while continuously
              improving my technical skills through real-world projects and collaborative learning.
              Currently in my 4th year of B.Sc AI Honours at Central Tribal University of
              Andhra Pradesh (CGPA: 7.9), with leadership experience through Campus Mantri at GeeksforGeeks.
            </p>
            <div className="about__tags">
              {['Python', 'Flask', 'React', 'MySQL', 'JavaScript', 'Bootstrap', 'Problem Solver', 'Team Player'].map(t => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
            <div className="about__actions">
              <button onClick={() => window.open('/resume.pdf', '_blank')} className="btn btn-primary">
                View / Download Resume
              </button>
            </div>
          </div>
        </div>

        <div className="about__stats">
          {stats.map((s, i) => (
            <Link
              key={i}
              to={s.to}
              smooth
              duration={600}
              offset={-80}
              className="about__stat glass-card about__stat--clickable"
              title={`Go to ${s.label}`}
            >
              <div className="about__stat-icon">{s.icon}</div>
              <div className="about__stat-value">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <p className="about__stat-label">{s.label}</p>
              <span className="about__stat-arrow">↗</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
