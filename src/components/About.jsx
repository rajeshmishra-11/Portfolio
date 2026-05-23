import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-scroll'
import { FiCode, FiAward, FiBook, FiUsers } from 'react-icons/fi'
import { fetchPortfolioData } from '../portfolioApi'
import './About.css'

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

export default function About({ data }) {
  const [statsList, setStatsList] = useState([
    { icon: <FiCode />, value: 6, label: 'Projects Built', suffix: '', to: 'projects' },
    { icon: <FiAward />, value: 4, label: 'Certificates', suffix: '', to: 'certificates' },
    { icon: <FiBook />, value: 3, label: 'Years Learning', suffix: '', to: 'skills' },
    { icon: <FiUsers />, value: 2, label: 'Team Projects', suffix: '', to: 'projects' },
  ])
  const [profile, setProfile] = useState({
    about_bio_1: "I am a motivated and detail-oriented Software Developer with a strong foundation in Python, full-stack web development, and problem-solving. I have experience building responsive and user-focused applications using technologies such as Python, Flask, React, MySQL, JavaScript, and Bootstrap.",
    about_bio_2: "I am passionate about creating efficient and scalable solutions while continuously improving my technical skills through real-world projects and collaborative learning. Currently in my 4th year of B.Sc AI Honours at Central Tribal University of Andhra Pradesh (CGPA: 7.9), with leadership experience through Campus Mantri at GeeksforGeeks.",
    about_tags: ['Python', 'Flask', 'React', 'MySQL', 'JavaScript', 'Bootstrap', 'Problem Solver', 'Team Player']
  })
  const [resumeUrl, setResumeUrl] = useState('/resume.pdf')
  const sectionRef = useRef(null)

  const [imageTimestamp, setImageTimestamp] = useState(localStorage.getItem('profile_img_ts') || '1')

  useEffect(() => {
    const handleUpdate = () => {
      setImageTimestamp(localStorage.getItem('profile_img_ts') || Date.now().toString())
    }
    window.addEventListener('profile-image-updated', handleUpdate)
    return () => window.removeEventListener('profile-image-updated', handleUpdate)
  }, [])

  useEffect(() => {
    async function load() {
      const finalData = data || await fetchPortfolioData()
      if (finalData) {
        setStatsList([
          { icon: <FiCode />, value: finalData.profile?.projects_built !== undefined ? finalData.profile.projects_built : (finalData.projects?.length || 6), label: 'Projects Built', suffix: '', to: 'projects' },
          { icon: <FiAward />, value: finalData.profile?.certificates_count !== undefined ? finalData.profile.certificates_count : (finalData.certificates?.length || 4), label: 'Certificates', suffix: '', to: 'certificates' },
          { icon: <FiBook />, value: finalData.profile?.years_learning || 3, label: 'Years Learning', suffix: '', to: 'skills' },
          { icon: <FiUsers />, value: finalData.profile?.team_projects || 2, label: 'Team Projects', suffix: '', to: 'projects' },
        ])
        if (finalData.profile) {
          setProfile(finalData.profile)
          if (finalData.profile.resume_url) {
            setResumeUrl(finalData.profile.resume_url)
          }
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
      window.open(resumeUrl, '_blank')
    }
  }, [resumeUrl])

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
                <img src={`/profile.jpg?t=${imageTimestamp}`} alt="Rajesh Mishra" className="about__avatar-img" />
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
              {profile.about_bio_1}
            </p>
            {profile.about_bio_2 && (
              <p className="about__bio">
                {profile.about_bio_2}
              </p>
            )}
            {profile.about_tags && profile.about_tags.length > 0 && (
              <div className="about__tags">
                {profile.about_tags.map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            )}
            <div className="about__actions">
              <button onClick={handleDownload} className="btn btn-primary">
                Download Resume
              </button>
            </div>
          </div>
        </div>

        <div className="about__stats">
          {statsList.map((s, i) => (
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
