import { useEffect, useRef, useState } from 'react'
import {
  SiPython, SiFlask, SiReact, SiMysql, SiHtml5, SiCss, SiJavascript, SiGit,
  SiDocker, SiPostman, SiFastapi, SiGooglecloud, SiBootstrap,
  SiTypescript, SiTailwindcss, SiNextdotjs, SiNodedotjs, SiMongodb,
  SiPostgresql, SiFirebase, SiAngular, SiVuedotjs, SiSvelte, SiDjango,
  SiSpring, SiRuby, SiGo, SiRust, SiKotlin, SiSwift, SiPhp, SiLaravel,
  SiRedis, SiNginx, SiLinux, SiFigma, SiNotion, SiSlack,
  SiGraphql, SiElectron, SiFlutter, SiDart,
  SiTensorflow, SiPytorch, SiNumpy, SiPandas, SiScikitlearn,
  SiJupyter, SiVercel, SiNetlify, SiHeroku,
  SiGithub, SiGitlab, SiBitbucket, SiJira, SiConfluence,
  SiSqlite, SiMariadb, SiSupabase, SiPrisma,
  SiExpress, SiNestjs, SiVite, SiWebpack, SiBabel,
  SiCplusplus, SiC, SiDotnet, SiUnity, SiBlender,
  SiKubernetes, SiTerraform, SiJenkins, SiGithubactions,
  SiRabbitmq, SiApachekafka, SiElasticsearch
} from 'react-icons/si'
import { FiCode, FiServer, FiDatabase, FiCloud, FiCpu } from 'react-icons/fi'
import { fetchPortfolioData } from '../portfolioApi'
import './Skills.css'

// Only skills from the resume — Python is strongest
const staticSkillBars = [
  { name: 'Python',       icon: <SiPython />,     color: '#3776ab', level: 90 },
  { name: 'C / C++',     icon: <FiCode />,       color: '#00599c', level: 72 },
  { name: 'JavaScript',  icon: <SiJavascript />, color: '#f7df1e', level: 75 },
  { name: 'HTML / CSS',  icon: <SiHtml5 />,      color: '#e34f26', level: 82 },
  { name: 'React.js',   icon: <SiReact />,      color: '#61dafb', level: 78 },
  { name: 'MySQL / SQL', icon: <SiMysql />,      color: '#00758f', level: 80 },
]

const staticTechCategories = [
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

// Comprehensive icon registry — covers 80+ popular technologies
// Keys are lowercase for case-insensitive lookup
const iconRegistry = {
  // Languages
  'python':       { icon: <SiPython />,       color: '#3776ab' },
  'javascript':   { icon: <SiJavascript />,   color: '#f7df1e' },
  'typescript':   { icon: <SiTypescript />,    color: '#3178c6' },
  'html':         { icon: <SiHtml5 />,        color: '#e34f26' },
  'html5':        { icon: <SiHtml5 />,        color: '#e34f26' },
  'html / css':   { icon: <SiHtml5 />,        color: '#e34f26' },
  'css':          { icon: <SiCss />,          color: '#1572b6' },
  'css3':         { icon: <SiCss />,          color: '#1572b6' },
  'c':            { icon: <SiC />,            color: '#a8b9cc' },
  'c++':          { icon: <SiCplusplus />,    color: '#00599c' },
  'cpp':          { icon: <SiCplusplus />,    color: '#00599c' },
  'c / c++':      { icon: <SiCplusplus />,    color: '#00599c' },
  'c#':           { icon: <FiCode />,         color: '#239120' },
  'csharp':       { icon: <FiCode />,         color: '#239120' },
  'java':         { icon: <FiCode />,         color: '#ed8b00' },
  'ruby':         { icon: <SiRuby />,         color: '#cc342d' },
  'go':           { icon: <SiGo />,           color: '#00add8' },
  'golang':       { icon: <SiGo />,           color: '#00add8' },
  'rust':         { icon: <SiRust />,         color: '#dea584' },
  'kotlin':       { icon: <SiKotlin />,       color: '#7f52ff' },
  'swift':        { icon: <SiSwift />,        color: '#f05138' },
  'php':          { icon: <SiPhp />,          color: '#777bb4' },
  'dart':         { icon: <SiDart />,         color: '#0175c2' },
  'sql':          { icon: <FiDatabase />,     color: '#00758f' },

  // Frontend Frameworks
  'react':        { icon: <SiReact />,        color: '#61dafb' },
  'react.js':     { icon: <SiReact />,        color: '#61dafb' },
  'reactjs':      { icon: <SiReact />,        color: '#61dafb' },
  'react native': { icon: <SiReact />,        color: '#61dafb' },
  'next.js':      { icon: <SiNextdotjs />,    color: '#ffffff' },
  'nextjs':       { icon: <SiNextdotjs />,    color: '#ffffff' },
  'angular':      { icon: <SiAngular />,      color: '#dd0031' },
  'vue':          { icon: <SiVuedotjs />,     color: '#4fc08d' },
  'vue.js':       { icon: <SiVuedotjs />,     color: '#4fc08d' },
  'vuejs':        { icon: <SiVuedotjs />,     color: '#4fc08d' },
  'svelte':       { icon: <SiSvelte />,       color: '#ff3e00' },
  'bootstrap':    { icon: <SiBootstrap />,    color: '#7952b3' },
  'tailwind':     { icon: <SiTailwindcss />,  color: '#06b6d4' },
  'tailwindcss':  { icon: <SiTailwindcss />,  color: '#06b6d4' },
  'tailwind css': { icon: <SiTailwindcss />,  color: '#06b6d4' },
  'flutter':      { icon: <SiFlutter />,      color: '#02569b' },
  'electron':     { icon: <SiElectron />,     color: '#47848f' },

  // Backend Frameworks
  'node.js':      { icon: <SiNodedotjs />,    color: '#339933' },
  'nodejs':       { icon: <SiNodedotjs />,    color: '#339933' },
  'node':         { icon: <SiNodedotjs />,    color: '#339933' },
  'express':      { icon: <SiExpress />,      color: '#ffffff' },
  'express.js':   { icon: <SiExpress />,      color: '#ffffff' },
  'expressjs':    { icon: <SiExpress />,      color: '#ffffff' },
  'nestjs':       { icon: <SiNestjs />,       color: '#e0234e' },
  'nest.js':      { icon: <SiNestjs />,       color: '#e0234e' },
  'flask':        { icon: <SiFlask />,        color: '#ffffff' },
  'django':       { icon: <SiDjango />,       color: '#092e20' },
  'fastapi':      { icon: <SiFastapi />,      color: '#009688' },
  'spring':       { icon: <SiSpring />,       color: '#6db33f' },
  'spring boot':  { icon: <SiSpring />,       color: '#6db33f' },
  'laravel':      { icon: <SiLaravel />,      color: '#ff2d20' },
  '.net':         { icon: <SiDotnet />,       color: '#512bd4' },
  'dotnet':       { icon: <SiDotnet />,       color: '#512bd4' },
  'rest api':     { icon: <FiServer />,       color: '#06b6d4' },
  'restful api':  { icon: <FiServer />,       color: '#06b6d4' },
  'graphql':      { icon: <SiGraphql />,      color: '#e10098' },

  // Databases
  'mysql':        { icon: <SiMysql />,        color: '#00758f' },
  'mysql / sql':  { icon: <SiMysql />,        color: '#00758f' },
  'postgresql':   { icon: <SiPostgresql />,   color: '#4169e1' },
  'postgres':     { icon: <SiPostgresql />,   color: '#4169e1' },
  'mongodb':      { icon: <SiMongodb />,      color: '#47a248' },
  'mongo':        { icon: <SiMongodb />,      color: '#47a248' },
  'sqlite':       { icon: <SiSqlite />,       color: '#003b57' },
  'mariadb':      { icon: <SiMariadb />,      color: '#003545' },
  'redis':        { icon: <SiRedis />,        color: '#dc382d' },
  'firebase':     { icon: <SiFirebase />,     color: '#ffca28' },
  'supabase':     { icon: <SiSupabase />,     color: '#3ecf8e' },
  'prisma':       { icon: <SiPrisma />,       color: '#2d3748' },

  // Cloud & DevOps
  'aws':          { icon: <FiCloud />,        color: '#ff9900' },
  'amazon web services': { icon: <FiCloud />, color: '#ff9900' },
  'gcp':          { icon: <SiGooglecloud />,  color: '#4285f4' },
  'google cloud': { icon: <SiGooglecloud />,  color: '#4285f4' },
  'docker':       { icon: <SiDocker />,       color: '#2496ed' },
  'kubernetes':   { icon: <SiKubernetes />,   color: '#326ce5' },
  'k8s':          { icon: <SiKubernetes />,   color: '#326ce5' },
  'terraform':    { icon: <SiTerraform />,    color: '#7b42bc' },
  'jenkins':      { icon: <SiJenkins />,      color: '#d24939' },
  'github actions': { icon: <SiGithubactions />, color: '#2088ff' },
  'nginx':        { icon: <SiNginx />,        color: '#009639' },
  'vercel':       { icon: <SiVercel />,       color: '#ffffff' },
  'netlify':      { icon: <SiNetlify />,      color: '#00c7b7' },
  'heroku':       { icon: <SiHeroku />,       color: '#430098' },
  'render':       { icon: <FiCloud />,        color: '#46e3b7' },

  // Tools
  'git':          { icon: <SiGit />,          color: '#f05032' },
  'github':       { icon: <SiGithub />,       color: '#ffffff' },
  'gitlab':       { icon: <SiGitlab />,       color: '#fc6d26' },
  'bitbucket':    { icon: <SiBitbucket />,    color: '#0052cc' },
  'postman':      { icon: <SiPostman />,      color: '#ff6c37' },
  'vscode':       { icon: <FiCode />,         color: '#007acc' },
  'vs code':      { icon: <FiCode />,         color: '#007acc' },
  'visual studio code': { icon: <FiCode />,   color: '#007acc' },
  'figma':        { icon: <SiFigma />,        color: '#f24e1e' },
  'notion':       { icon: <SiNotion />,       color: '#ffffff' },
  'slack':        { icon: <SiSlack />,        color: '#4a154b' },
  'jira':         { icon: <SiJira />,         color: '#0052cc' },
  'confluence':   { icon: <SiConfluence />,   color: '#172b4d' },
  'linux':        { icon: <SiLinux />,        color: '#fcc624' },
  'vite':         { icon: <SiVite />,         color: '#646cff' },
  'webpack':      { icon: <SiWebpack />,      color: '#8dd6f9' },
  'babel':        { icon: <SiBabel />,        color: '#f9dc3e' },

  // Data Science / ML
  'tensorflow':   { icon: <SiTensorflow />,   color: '#ff6f00' },
  'pytorch':      { icon: <SiPytorch />,      color: '#ee4c2c' },
  'numpy':        { icon: <SiNumpy />,        color: '#013243' },
  'pandas':       { icon: <SiPandas />,       color: '#150458' },
  'scikit-learn': { icon: <SiScikitlearn />,  color: '#f7931e' },
  'sklearn':      { icon: <SiScikitlearn />,  color: '#f7931e' },
  'jupyter':      { icon: <SiJupyter />,      color: '#f37626' },

  // Other
  'unity':        { icon: <SiUnity />,        color: '#ffffff' },
  'blender':      { icon: <SiBlender />,      color: '#f5792a' },
  'rabbitmq':     { icon: <SiRabbitmq />,     color: '#ff6600' },
  'kafka':        { icon: <SiApachekafka />,  color: '#231f20' },
  'elasticsearch':{ icon: <SiElasticsearch />,color: '#005571' },
}

// Resolve icon and color by skill name with case-insensitive fuzzy matching
function resolveIcon(name) {
  const key = name.toLowerCase().trim()
  // Direct match
  if (iconRegistry[key]) return iconRegistry[key]
  // Partial match — check if registry key is contained in the name or vice versa
  for (const [registryKey, value] of Object.entries(iconRegistry)) {
    if (key.includes(registryKey) || registryKey.includes(key)) return value
  }
  return null
}


export default function Skills() {
  const [bars, setBars] = useState(staticSkillBars)
  const [categories, setCategories] = useState(staticTechCategories)
  const [sePrinciples, setSePrinciples] = useState([
    'SDLC', 'Agile Methodology', 'Software Design Principles', 'RESTful APIs', 'JWT Authentication', 'Cloud Deployment'
  ])
  const [isIntersecting, setIsIntersecting] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    async function load() {
      const data = await fetchPortfolioData()
      if (data && data.skills && data.skills.length > 0) {
        const rawBars = data.skills.filter(s => s.category === 'Languages')
        const rawFrameworks = data.skills.filter(s => s.category === 'Frameworks')
        const rawTools = data.skills.filter(s => s.category === 'Tools' || s.category === 'Cloud & Tools')
        const rawSE = data.skills.filter(s => s.category === 'Software Engineering')

        const mappedBars = rawBars.map(s => {
          const resolved = resolveIcon(s.name)
          return {
            name: s.name,
            icon: resolved?.icon || <FiCode />,
            color: resolved?.color || '#808080',
            level: s.percentage
          }
        })

        const mappedFrameworks = rawFrameworks.map(s => {
          const resolved = resolveIcon(s.name)
          return {
            name: s.name,
            icon: resolved?.icon || <FiServer />,
            color: resolved?.color || '#06b6d4'
          }
        })

        const mappedTools = rawTools.map(s => {
          const resolved = resolveIcon(s.name)
          return {
            name: s.name,
            icon: resolved?.icon || <FiCloud />,
            color: resolved?.color || '#f59e0b'
          }
        })

        setBars(mappedBars)
        setCategories([
          {
            label: 'Frameworks',
            color: '#06b6d4',
            items: mappedFrameworks
          },
          {
            label: 'Cloud & Tools',
            color: '#f59e0b',
            items: mappedTools
          }
        ])

        if (rawSE.length > 0) {
          setSePrinciples(rawSE.map(s => s.name))
        } else {
          setSePrinciples([
            'SDLC', 'Agile Methodology', 'Software Design Principles', 'RESTful APIs', 'JWT Authentication', 'Cloud Deployment'
          ])
        }
      }
    }
    load()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
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
              {bars.map((s) => (
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
                    <div 
                      className="skill-bar__fill" 
                      style={{ width: isIntersecting ? `${s.level}%` : '0%' }} 
                    />
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
              {sePrinciples.map(p => (
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
          {categories.map((cat) => (
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
