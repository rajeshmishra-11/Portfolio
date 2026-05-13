import { useEffect, useRef } from 'react'
import { TypeAnimation } from 'react-type-animation'
import { Link } from 'react-scroll'
import { FiGithub, FiLinkedin, FiMail, FiArrowDown, FiCode } from 'react-icons/fi'
import './Hero.css'

export default function Hero() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(20,184,166,${p.opacity})`
        ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      animationId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <section id="hero" className="hero">
      <canvas ref={canvasRef} className="hero__canvas" />
      <div className="hero__glow hero__glow--left" />
      <div className="hero__glow hero__glow--right" />

      <div className="container hero__container">
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          Available for opportunities
        </div>

        <h1 className="hero__name">
          Hi, I'm <span className="hero__name-highlight">Rajesh Mishra</span>
        </h1>

        <div className="hero__role">
          <TypeAnimation
            sequence={[
              'Full Stack Developer', 2000,
              'Python Developer', 2000,
              'Flask & React Developer', 2000,
              'Problem Solver', 2000,
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
          />
        </div>

        <p className="hero__bio">
          Passionate developer crafting scalable, user-centric web applications.
          I love turning complex problems into elegant solutions with clean code and modern technologies.
        </p>

        <div className="hero__actions">
          <Link to="projects" smooth duration={500} offset={-80} className="btn btn-primary">
            View My Work
          </Link>
          <Link to="contact" smooth duration={500} offset={-80} className="btn btn-outline">
            Contact Me
          </Link>
        </div>

        <div className="hero__socials">
          <a href="https://github.com/rajeshmishra-11" target="_blank" rel="noreferrer" className="hero__social" aria-label="GitHub">
            <FiGithub size={20} />
          </a>
          <a href="https://www.geeksforgeeks.org/profile/rajeshmishhica" target="_blank" rel="noreferrer" className="hero__social" aria-label="GeeksforGeeks" title="GeeksforGeeks">
            <FiCode size={20} />
          </a>
          <a href="https://www.linkedin.com/in/rajesh-mishra-cse" target="_blank" rel="noreferrer" className="hero__social" aria-label="LinkedIn">
            <FiLinkedin size={20} />
          </a>
          <a href="https://mail.google.com/mail/?view=cm&to=rajeshmishra847410@gmail.com" target="_blank" rel="noreferrer" className="hero__social" aria-label="Email">
            <FiMail size={20} />
          </a>
        </div>
      </div>

      <Link to="about" smooth duration={500} offset={-80} className="hero__scroll-hint">
        <FiArrowDown size={20} />
        <span>Scroll to explore</span>
      </Link>
    </section>
  )
}
