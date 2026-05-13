import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'
import { HiMenu, HiX } from 'react-icons/hi'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../ThemeContext'
import './Navbar.css'

const navLinks = [
  { label: 'Home', to: 'hero' },
  { label: 'About', to: 'about' },
  { label: 'Skills', to: 'skills' },
  { label: 'Projects', to: 'projects' },
  { label: 'Certificates', to: 'certificates' },
  { label: 'Extracurricular Activities', to: 'achievements' },
  { label: 'Education', to: 'resume' },
  { label: 'Contact', to: 'contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        <Link to="hero" smooth duration={500} className="navbar__logo">
          <img src="/profile.jpg" alt="Rajesh Mishra" className="navbar__logo-img" />
        </Link>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                smooth
                duration={500}
                spy
                offset={-80}
                activeClass="navbar__link--active"
                className="navbar__link"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="contact" smooth duration={500} className="btn btn-primary navbar__cta" onClick={() => setMenuOpen(false)}>
              Hire Me
            </Link>
          </li>
        </ul>

        <div className="navbar__right">
          {/* Theme Toggle */}
          <button
            className="navbar__theme-toggle"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            <span className={`navbar__theme-icon ${theme === 'dark' ? 'active' : ''}`}>
              <FiMoon size={16} />
            </span>
            <span className="navbar__theme-knob" />
            <span className={`navbar__theme-icon ${theme === 'light' ? 'active' : ''}`}>
              <FiSun size={16} />
            </span>
          </button>

          <button className="navbar__toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  )
}
