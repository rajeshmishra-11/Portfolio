import { useState, useEffect } from 'react'
import { FiGithub, FiLinkedin, FiMail, FiHeart, FiCode } from 'react-icons/fi'
import { Link } from 'react-scroll'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()
  const [imageTimestamp, setImageTimestamp] = useState(localStorage.getItem('profile_img_ts') || '1')

  useEffect(() => {
    const handleUpdate = () => {
      setImageTimestamp(localStorage.getItem('profile_img_ts') || Date.now().toString())
    }
    window.addEventListener('profile-image-updated', handleUpdate)
    return () => window.removeEventListener('profile-image-updated', handleUpdate)
  }, [])
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <Link to="hero" smooth duration={500} className="footer__logo">
          <img src={`/api/uploads/profile.jpg?t=${imageTimestamp}`} alt="Rajesh Mishra" className="footer__logo-img" />
        </Link>
        <p className="footer__copy">
          Made with <FiHeart className="footer__heart" /> by Rajesh Mishra · {year}
        </p>
        <div className="footer__socials">
          <a href="https://github.com/rajeshmishra-11" target="_blank" rel="noreferrer" aria-label="GitHub" className="footer__social"><FiGithub size={18} /></a>
          <a href="https://www.linkedin.com/in/rajesh-mishra-cse" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="footer__social"><FiLinkedin size={18} /></a>
          <a href="https://www.geeksforgeeks.org/profile/rajeshmishhica" target="_blank" rel="noreferrer" aria-label="GeeksforGeeks" className="footer__social" title="GeeksforGeeks"><FiCode size={18} /></a>
          <a href="https://mail.google.com/mail/?view=cm&to=rajeshmishra847410@gmail.com" target="_blank" rel="noreferrer" aria-label="Email" className="footer__social"><FiMail size={18} /></a>
        </div>
      </div>
    </footer>
  )
}
