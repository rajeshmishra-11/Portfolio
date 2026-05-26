import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { HiMenu as MenuIcon, HiX as CloseIcon } from 'react-icons/hi'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../ThemeContext'
import { fetchPortfolioData } from '../portfolioApi'
import './Navbar.css'

export default function Navbar({ data }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)   // controls slide-in animation class
  const [menuVisible, setMenuVisible] = useState(false) // controls DOM presence
  const [showExperience, setShowExperience] = useState(false)
  const [showProjects, setShowProjects] = useState(true)
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const [imageTimestamp, setImageTimestamp] = useState(localStorage.getItem('profile_img_ts') || '1')

  // Open: mount element first, then trigger slide-in animation next frame
  const openMenu = () => {
    setMenuVisible(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setMenuOpen(true))
    })
  }

  // Close: slide out first, then unmount from DOM after animation completes
  const closeMenu = () => {
    setMenuOpen(false)
    setTimeout(() => setMenuVisible(false), 310)
  }

  useEffect(() => {
    const handleUpdate = () => {
      setImageTimestamp(localStorage.getItem('profile_img_ts') || Date.now().toString())
    }
    window.addEventListener('profile-image-updated', handleUpdate)
    return () => window.removeEventListener('profile-image-updated', handleUpdate)
  }, [])

  useEffect(() => {
    async function checkExperienceToggle() {
      try {
        const finalData = data || await fetchPortfolioData()
        if (finalData && finalData.profile) {
          setShowExperience(!!finalData.profile.show_experience)
          setShowProjects(finalData.profile.show_projects !== undefined ? !!finalData.profile.show_projects : true)
        }
      } catch (err) {
        console.error("Navbar failed to fetch portfolio data", err)
      }
    }
    checkExperienceToggle()
  }, [data, location.pathname]) // Refresh on navigation changes or data change


  const navLinks = [
    { label: 'Home', to: 'hero' },
    { label: 'About', to: 'about' },
    { label: 'Skills', to: 'skills' },
    ...(showExperience ? [{ label: 'Experience', to: 'experience' }] : []),
    ...((!showExperience || showProjects) ? [{ label: 'Projects', to: 'projects' }] : []),
    { label: 'Certificates', to: 'certificates' },
    { label: 'Extracurricular Activities', to: 'achievements' },
    { label: 'Education', to: 'resume' },
    { label: 'Contact', to: 'contact' },
  ]

  const isHome = location.pathname === '/'

  const handleNavClick = (to) => {
    closeMenu()
    if (!isHome) {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(to)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        {isHome ? (
          <Link to="hero" smooth duration={500} className="navbar__logo">
            <img src={`/api/uploads/profile.jpg?t=${imageTimestamp}`} alt="Rajesh Mishra" className="navbar__logo-img" />
          </Link>
        ) : (
          <RouterLink to="/" className="navbar__logo">
            <img src={`/api/uploads/profile.jpg?t=${imageTimestamp}`} alt="Rajesh Mishra" className="navbar__logo-img" />
          </RouterLink>
        )}

        {/* Mobile backdrop overlay — only in DOM when menu is visible */}
        {menuVisible && (
          <div
            className={`navbar__overlay${menuOpen ? ' navbar__overlay--visible' : ''}`}
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}

        {/* Mobile drawer — only mounted in DOM when visible, removed after close animation */}
        {menuVisible && (
          <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
            {/* Close button at top-right of the mobile drawer */}
            <button
              className="navbar__menu-close"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <CloseIcon size={18} />
            </button>
            {navLinks.map((link) => (
              <li key={link.to}>
                {isHome ? (
                  <Link
                    to={link.to}
                    smooth
                    duration={500}
                    spy
                    offset={-80}
                    activeClass="navbar__link--active"
                    className="navbar__link"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={`/#${link.to}`}
                    className="navbar__link"
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavClick(link.to)
                    }}
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
            <li>
              {isHome ? (
                <Link to="contact" smooth duration={500} className="btn btn-primary navbar__cta" onClick={closeMenu}>
                  Hire Me
                </Link>
              ) : (
                <a
                  href="/#contact"
                  className="btn btn-primary navbar__cta"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick('contact')
                  }}
                >
                  Hire Me
                </a>
              )}
            </li>
          </ul>
        )}

        <div className="navbar__right">
          {/* Theme Toggle — shows Moon in light mode, Sun in dark mode */}
          <button
            className="navbar__theme-toggle"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>

          <button className="navbar__toggle" onClick={() => menuVisible ? closeMenu() : openMenu()} aria-label="Toggle menu">
            {menuVisible ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>
    </nav>
  )
}
