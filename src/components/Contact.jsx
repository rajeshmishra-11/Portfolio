import { useState, useRef } from 'react'
import emailjs from '@emailjs/browser'
import { FiMail, FiMapPin, FiGithub, FiLinkedin, FiSend, FiCheck, FiAlertCircle, FiCode } from 'react-icons/fi'
import './Contact.css'

// ─── EmailJS Configuration ─────────────────────────────────────────────────
// To activate email sending:
// 1. Go to https://www.emailjs.com/ → Sign up free
// 2. Add a Gmail service → copy the Service ID below
// 3. Create an email template with variables: {{from_name}}, {{from_email}}, {{subject}}, {{message}}
// 4. Copy the Template ID and your Public Key below
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID'   // e.g. 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'  // e.g. 'template_xyz789'
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY'   // e.g. 'aBcDeFgHiJkLmNoP'
// ──────────────────────────────────────────────────────────────────────────

const contactInfo = [
  { icon: <FiMail />, label: 'Email', value: 'rajeshmishra847410@gmail.com', href: 'https://mail.google.com/mail/?view=cm&to=rajeshmishra847410@gmail.com' },
  { icon: <FiMapPin />, label: 'Location', value: 'India 🇮🇳', href: null },
  { icon: <FiGithub />, label: 'GitHub', value: 'github.com/rajeshmishra-11', href: 'https://github.com/rajeshmishra-11' },
  { icon: <FiLinkedin />, label: 'LinkedIn', value: 'linkedin.com/in/rajesh-mishra-cse', href: 'https://www.linkedin.com/in/rajesh-mishra-cse' },
  { icon: <FiCode />, label: 'GeeksforGeeks', value: 'geeksforgeeks.org/profile/rajeshmishhica', href: 'https://www.geeksforgeeks.org/profile/rajeshmishhica' },
]

const EMPTY = { name: '', email: '', subject: '', message: '' }

export default function Contact() {
  const formRef = useRef(null)
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')

    // Check if EmailJS is configured
    if (
      EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' ||
      EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' ||
      EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY'
    ) {
      // Fallback: open Gmail compose with the message pre-filled
      const subject = encodeURIComponent(form.subject || 'Portfolio Contact')
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
      )
      window.open(
        `https://mail.google.com/mail/?view=cm&to=rajeshmishra847410@gmail.com&su=${subject}&body=${body}`,
        '_blank'
      )
      setStatus('success')
      setTimeout(() => { setStatus('idle'); setForm(EMPTY) }, 4000)
      return
    }

    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY
      )
      setStatus('success')
      setForm(EMPTY)
      setTimeout(() => setStatus('idle'), 5000)
    } catch (err) {
      console.error('EmailJS error:', err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <section id="contact" className="section contact">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Get In Touch</p>
          <h2 className="section-title">Let's <span>Connect</span></h2>
          <p className="section-subtitle">Have a project in mind or just want to say hi? My inbox is always open.</p>
        </div>

        <div className="contact__grid">
          <div className="contact__info">
            <h3 className="contact__info-title">Contact Info</h3>
            <p className="contact__info-sub">Feel free to reach out. I typically respond within 24 hours.</p>
            <div className="contact__info-list">
              {contactInfo.map((c, i) => (
                <div key={i} className="contact__info-item glass-card">
                  <div className="contact__info-icon">{c.icon}</div>
                  <div>
                    <p className="contact__info-label">{c.label}</p>
                    {c.href
                      ? <a href={c.href} target="_blank" rel="noreferrer" className="contact__info-value contact__info-value--link">{c.value}</a>
                      : <p className="contact__info-value">{c.value}</p>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form ref={formRef} className="contact__form glass-card" onSubmit={handleSubmit} id="contact-form">
            <h3 className="contact__form-title">Send a Message</h3>

            {status === 'error' && (
              <div className="contact__alert contact__alert--error">
                <FiAlertCircle size={16} /> Failed to send. Please try again or email directly.
              </div>
            )}

            <div className="contact__form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" type="text" placeholder="Your Name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input id="subject" name="subject" type="text" placeholder="What's this about?" value={form.subject} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={5} placeholder="Tell me about your project or idea..." value={form.message} onChange={handleChange} required />
            </div>

            <button
              type="submit"
              className={`btn btn-primary contact__submit ${status === 'success' ? 'contact__submit--sent' : ''}`}
              disabled={status === 'loading' || status === 'success'}
            >
              {status === 'success'
                ? <><FiCheck size={18} /> Message Sent!</>
                : status === 'loading'
                ? <><span className="contact__spinner" /> Sending...</>
                : <><FiSend size={18} /> Send Message</>
              }
            </button>

            <p className="contact__form-note">
              📧 Message goes directly to <strong>rajeshmishra847410@gmail.com</strong>
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
