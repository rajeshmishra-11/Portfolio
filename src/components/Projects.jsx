import { useState, useEffect } from 'react'
import { FiGithub, FiExternalLink } from 'react-icons/fi'
import { fetchPortfolioData } from '../portfolioApi'
import './Projects.css'

const staticProjects = [
  {
    title: 'Smart Study Support System',
    description: 'An AI-assisted full-stack study platform built to improve student focus and academic performance.',
    points: [
      'Built Chrome Extension to detect and block distracting websites in real time',
      'Integrated Pomodoro timer and session-based focus tracking for students',
      'Gamification system with XP points, badges, and leaderboard to motivate learners',
      'Teacher analytics dashboard with Recharts graphs for monitoring class-wide performance',
      'Secure JWT-based login with role-based access for students and teachers',
      'Backend built with Java Spring Boot and MySQL; frontend with React.js',
    ],
    tags: ['Java', 'Spring Boot', 'React', 'MySQL', 'Chrome Extension', 'JWT', 'Recharts'],
    github: 'https://github.com/rajeshmishra-11/SmartStudySapportSystem',
    live: null,
    featured: true,
    color: '#7c3aed',
    accentColor: 'rgba(124, 58, 237, 0.1)',
  },
  {
    title: 'HealthConnect – Integrated Healthcare Ecosystem',
    description: 'A healthcare management platform connecting patients and doctors with a clean, modern interface.',
    points: [
      'Collaborated in a team to develop an integrated healthcare ecosystem connecting patients, doctors, and pharmacies.',
      'Independently designed and developed the complete Doctor Portal, including frontend, backend, REST APIs, and database integration using Flask.',
      'Implemented secure prescription management with unique RX code generation, enabling pharmacies to verify and dispatch medicines securely.',
      'Built scalable APIs, appointment management, patient record handling, and responsive dashboards with role-based access control.',
      'Developed a modular healthcare system enabling seamless communication between doctor, patient, and pharmacy services.',
    ],
    tags: ['Python', 'Flask', 'React', 'MySQL', 'REST API', 'JWT'],
    github: 'https://github.com/rajeshmishra-11/HealthConnect',
    live: null,
    featured: true,
    color: '#06b6d4',
    accentColor: 'rgba(6, 182, 212, 0.1)',
  },
  {
    title: 'Expense Tracker Web Application',
    description: 'A full-stack expense tracker with secure authentication and complete CRUD operations for expense management.',
    points: [
      'Developed a full-stack expense tracker with secure authentication and complete CRUD operations for expense management.',
      'Built interactive dashboards with charts and graphs for category-wise expense analysis and reporting.',
      'Added features like monthly expense filtering, month-wise category comparison, and graphical expense visualization.',
      'Implemented smart budget alerts and next-month budget prediction based on the previous three months spending history.',
      'Designed responsive UI using HTML, CSS, JavaScript, and Bootstrap with Flask and MySQL backend integration.',
    ],
    tags: ['Python', 'Flask', 'MySQL', 'HTML', 'CSS', 'JavaScript', 'Bootstrap'],
    github: 'https://github.com/rajeshmishra-11/expense_tracker',
    live: null,
    featured: true,
    color: '#f59e0b',
    accentColor: 'rgba(245, 158, 11, 0.1)',
  },
  {
    title: 'Portfolio Website',
    description: 'This very portfolio — built with React + Vite featuring a teal/amber dark theme, dark/light mode toggle, and animated sections.',
    points: [
      'Dark/Light mode toggle with smooth CSS variable transitions and localStorage persistence',
      'Animated particle background and type-animation in the Hero section',
      'Interactive certificate gallery with PDF/image modal viewer',
      'Achievement proof cards with image lightbox for Campus Mantri and GFG records',
      'EmailJS contact form integration for direct inbox delivery',
      'Deployed on GitHub Pages with Vite optimized production build',
    ],
    tags: ['React', 'Vite', 'CSS', 'EmailJS', 'GitHub Pages'],
    github: 'https://github.com/rajeshmishra-11/Portfolio',
    live: null,
    featured: false,
    color: '#22c55e',
    accentColor: 'rgba(34, 197, 94, 0.1)',
  },
]

export default function Projects() {
  const [list, setList] = useState(staticProjects)

  useEffect(() => {
    async function load() {
      const data = await fetchPortfolioData()
      if (data && data.projects && data.projects.length > 0) {
        setList(data.projects)
      }
    }
    load()
  }, [])

  return (
    <section id="projects" className="section projects">
      <div className="container">
        <div className="section-header">
          <p className="section-label">My Work</p>
          <h2 className="section-title">Featured <span>Projects</span></h2>
          <p className="section-subtitle">Things I've built with passion and purpose</p>
        </div>

        <div className="projects__grid">
          {list.map((p, i) => (
            <div 
              key={i} 
              className={`project-card glass-card ${p.featured ? 'project-card--featured' : ''}`}
              style={{ '--project-color': p.color, '--project-accent': p.accentColor }}
            >
              <div className="project-card__top">
                <div className="project-card__dot" style={{ background: p.color }} />
                {p.featured && <span className="tag" style={{ background: p.accentColor, color: p.color, borderColor: `${p.color}44` }}>Featured</span>}
              </div>
              <div className="project-card__accent" style={{ background: `radial-gradient(circle at top left, ${p.color}22, transparent 60%)` }} />
              <h3 className="project-card__title">{p.title}</h3>
              <p className="project-card__desc">{p.description}</p>

              {/* Bullet Points */}
              <ul className="project-card__points">
                {p.points.map((pt, j) => (
                  <li key={j} className="project-card__point">
                    <span className="project-card__point-dot" style={{ background: p.color }} />
                    {pt}
                  </li>
                ))}
              </ul>

              <div className="project-card__tags">
                {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
              <div className="project-card__links">
                {p.github && (
                  <a href={p.github} target="_blank" rel="noreferrer" className="project-card__link">
                    <FiGithub size={16} /> Link
                  </a>
                )}
                {p.live && (
                  <a href={p.live} target="_blank" rel="noreferrer" className="project-card__link project-card__link--live">
                    <FiExternalLink size={16} /> Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="projects__cta">
          <a href="https://github.com/rajeshmishra-11" target="_blank" rel="noreferrer" className="btn btn-outline">
            <FiGithub size={18} /> View All on GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
