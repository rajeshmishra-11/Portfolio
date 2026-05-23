import { useState, useEffect } from 'react'
import {
  FiLock, FiUnlock, FiFolder, FiAward, FiCompass,
  FiTool, FiFileText, FiPlus, FiEdit, FiTrash,
  FiUpload, FiChevronRight, FiLogOut, FiCheckCircle, FiImage,
  FiBook, FiBriefcase
} from 'react-icons/fi'
import './AdminDashboard.css'
import { clearPortfolioCache } from '../portfolioApi'

const API_BASE_URL = '/api'

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [otpRequired, setOtpRequired] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpAttempts, setOtpAttempts] = useState(0)
  const [verificationLoading, setVerificationLoading] = useState(false)

  // Dashboard view
  const [activeTab, setActiveTab] = useState('projects')
  const [loading, setLoading] = useState(false)
  const [portfolioData, setPortfolioData] = useState({
    projects: [],
    certificates: [],
    achievements: [],
    skills: [],
    education: [],
    experiences: []
  })

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('project') // project, certificate, achievement, skill
  const [editingItem, setEditingItem] = useState(null) // null for Add, item object for Edit

  // Form States
  const [projectForm, setProjectForm] = useState({
    title: '', description: '', points: '', tags: '',
    github: '', live: '', featured: false, color: '#7c3aed',
    accentColor: 'rgba(124, 58, 237, 0.1)', order: 0
  })

  const [certificateForm, setCertificateForm] = useState({
    title: '', issuer: '', date: '', image: '', link: '', featured: true, order: 0, color: '#06b6d4'
  })

  const [achievementForm, setAchievementForm] = useState({
    title: '', subtitle: '', description: '', image: '', proof_link: '', date: '', order: 0, color: '#f59e0b'
  })

  const [skillForm, setSkillForm] = useState({
    name: '', category: 'Languages', percentage: 80, order: 0
  })

  const [educationForm, setEducationForm] = useState({
    title: '', org: '', period: '', desc: '', order: 0, color: '#06b6d4'
  })

  const [experienceForm, setExperienceForm] = useState({
    company: '', role: '', duration: '', description: '',
    projects_worked: '', what_learned: '', proof: '', order: 0, color: '#e11d48'
  })

  const [profileForm, setProfileForm] = useState({
    name: '', roles: '', hero_bio: '', about_bio_1: '', about_bio_2: '',
    about_tags: '', github: '', linkedin: '', geeksforgeeks: '', email: '',
    years_learning: 3, team_projects: 2, projects_built: 6, certificates_count: 4,
    show_experience: false,
    show_projects: true,
    resume_url: '/resume.pdf'
  })
  const [showLayoutModal, setShowLayoutModal] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Resume File Upload State
  const [resumeFile, setResumeFile] = useState(null)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [resumeSuccess, setResumeSuccess] = useState(false)

  // Certificate & Achievement Image Upload State
  const [certFile, setCertFile] = useState(null)
  const [uploadingCert, setUploadingCert] = useState(false)
  const [certUploadSuccess, setCertUploadSuccess] = useState(false)
  const [achFile, setAchFile] = useState(null)
  const [uploadingAch, setUploadingAch] = useState(false)
  const [achUploadSuccess, setAchUploadSuccess] = useState(false)
  
  // Experience Proof Upload State
  const [expFile, setExpFile] = useState(null)
  const [uploadingExp, setUploadingExp] = useState(false)
  const [expUploadSuccess, setExpUploadSuccess] = useState(false)

  // Profile Picture Upload State
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false)
  const [profileImageSuccess, setProfileImageSuccess] = useState(false)
  const [profileImageTimestamp, setProfileImageTimestamp] = useState(localStorage.getItem('profile_img_ts') || '1')

  useEffect(() => {
    const handleUpdate = () => {
      setProfileImageTimestamp(localStorage.getItem('profile_img_ts') || Date.now().toString())
    }
    window.addEventListener('profile-image-updated', handleUpdate)
    return () => window.removeEventListener('profile-image-updated', handleUpdate)
  }, [])

  // Fetch all portfolio data
  const fetchPortfolioData = async () => {
    clearPortfolioCache()
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/portfolio`)
      if (res.ok) {
        const data = await res.json()
        setPortfolioData(data)
        if (data.profile) {
          setProfileForm({
            name: data.profile.name || '',
            roles: data.profile.roles ? data.profile.roles.join(', ') : '',
            hero_bio: data.profile.hero_bio || '',
            about_bio_1: data.profile.about_bio_1 || '',
            about_bio_2: data.profile.about_bio_2 || '',
            about_tags: data.profile.about_tags ? data.profile.about_tags.join(', ') : '',
            github: data.profile.github || '',
            linkedin: data.profile.linkedin || '',
            geeksforgeeks: data.profile.geeksforgeeks || '',
            email: data.profile.email || '',
            years_learning: data.profile.years_learning !== undefined ? data.profile.years_learning : 3,
            team_projects: data.profile.team_projects !== undefined ? data.profile.team_projects : 2,
            projects_built: data.profile.projects_built !== undefined ? data.profile.projects_built : 6,
            certificates_count: data.profile.certificates_count !== undefined ? data.profile.certificates_count : 4,
            show_experience: data.profile.show_experience !== undefined ? !!data.profile.show_experience : false,
            show_projects: data.profile.show_projects !== undefined ? !!data.profile.show_projects : true,
            resume_url: data.profile.resume_url || '/resume.pdf'
          })
        }
      }
    } catch (err) {
      console.error('Failed to load portfolio data', err)
    } finally {
      setLoading(false)
    }
  }

  const verifyTokenValidity = async (currentToken) => {
    if (!currentToken) return
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      })
      if (!res.ok) {
        handleLogout()
      }
    } catch (err) {
      console.error('Failed to verify token validity with backend', err)
    }
  }

  useEffect(() => {
    fetchPortfolioData()
    if (token) {
      verifyTokenValidity(token)
    }
  }, [token])

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login-json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'otp_required') {
          setOtpRequired(true)
          setOtpError('')
        } else {
          setToken(data.access_token)
          localStorage.setItem('admin_token', data.access_token)
        }
      } else {
        const err = await res.json()
        setLoginError(err.detail || 'Incorrect username or password')
      }
    } catch {
      setLoginError('Connection to backend failed')
    }
  }

  // Handle OTP Verification Submit
  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setOtpError('')
    setVerificationLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otp: otpCode })
      })
      if (res.ok) {
        const data = await res.json()
        setToken(data.access_token)
        localStorage.setItem('admin_token', data.access_token)
        setOtpRequired(false)
        setOtpCode('')
        setOtpAttempts(0)
      } else {
        const newAttempts = otpAttempts + 1
        const err = await res.json()
        // 403 = locked out (backend cleared the session after 3 attempts)
        if (res.status === 403 || newAttempts >= 3) {
          setOtpAttempts(0)
          setOtpRequired(false)
          setOtpCode('')
          setLoginError('Too many incorrect codes. Please log in again.')
          return
        }
        setOtpAttempts(newAttempts)
        setOtpError(err.detail || 'Failed to verify verification code.')
      }
    } catch {
      setOtpError('Connection to server failed')
    } finally {
      setVerificationLoading(false)
    }
  }

  // Handle Logout
  const handleLogout = () => {
    setToken('')
    localStorage.removeItem('admin_token')
  }

  // Handle Certificate Image Upload
  const handleCertFileUpload = async (file) => {
    if (!file) return
    setCertFile(file)
    setUploadingCert(true)
    setCertUploadSuccess(false)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE_URL}/upload/certificate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      if (res.ok) {
        const data = await res.json()
        setCertificateForm(prev => ({ ...prev, image: data.path }))
        setCertUploadSuccess(true)
      } else {
        if (res.status === 401) {
          alert('Your session has expired. Please log in again.')
          handleLogout()
          return
        }
        const err = await res.json()
        alert(`Upload failed: ${err.detail || 'Unknown error'}`)
      }
    } catch {
      alert('Connection to server failed')
    } finally {
      setUploadingCert(false)
    }
  }

  // Handle Achievement Image Upload
  const handleAchFileUpload = async (file) => {
    if (!file) return
    setAchFile(file)
    setUploadingAch(true)
    setAchUploadSuccess(false)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE_URL}/upload/achievement`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      if (res.ok) {
        const data = await res.json()
        setAchievementForm(prev => ({ ...prev, image: data.path }))
        setAchUploadSuccess(true)
      } else {
        if (res.status === 401) {
          alert('Your session has expired. Please log in again.')
          handleLogout()
          return
        }
        const err = await res.json()
        alert(`Upload failed: ${err.detail || 'Unknown error'}`)
      }
    } catch {
      alert('Connection to server failed')
    } finally {
      setUploadingAch(false)
    }
  }

  // Handle Experience Proof Document Upload
  const handleExpFileUpload = async (file) => {
    if (!file) return
    setExpFile(file)
    setUploadingExp(true)
    setExpUploadSuccess(false)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE_URL}/upload/experience`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      if (res.ok) {
        const data = await res.json()
        setExperienceForm(prev => ({ ...prev, proof: data.path }))
        setExpUploadSuccess(true)
      } else {
        if (res.status === 401) {
          alert('Your session has expired. Please log in again.')
          handleLogout()
          return
        }
        const err = await res.json()
        alert(`Upload failed: ${err.detail || 'Unknown error'}`)
      }
    } catch {
      alert('Connection to server failed')
    } finally {
      setUploadingExp(false)
    }
  }

  // Handle Modal Open
  const openModal = (type, item = null) => {
    setModalType(type)
    setEditingItem(item)

    // Reset upload states
    setCertFile(null)
    setCertUploadSuccess(false)
    setAchFile(null)
    setAchUploadSuccess(false)
    setExpFile(null)
    setExpUploadSuccess(false)

    if (type === 'project') {
      setProjectForm(item ? {
        title: item.title,
        description: item.description,
        points: item.points.join('\n'),
        tags: item.tags.join(', '),
        github: item.github || '',
        live: item.live || '',
        featured: item.featured,
        color: item.color,
        accentColor: item.accentColor,
        order: item.order
      } : {
        title: '', description: '', points: '', tags: '',
        github: '', live: '', featured: false, color: '#7c3aed',
        accentColor: 'rgba(124, 58, 237, 0.1)', order: 0
      })
    } else if (type === 'certificate') {
      setCertificateForm(item ? {
        title: item.title, issuer: item.issuer, date: item.date,
        image: item.image, link: item.link || '', featured: item.featured, order: item.order,
        color: item.color || '#06b6d4'
      } : {
        title: '', issuer: '', date: '', image: '', link: '', featured: true, order: 0, color: '#06b6d4'
      })
    } else if (type === 'achievement') {
      setAchievementForm(item ? {
        title: item.title, subtitle: item.subtitle || '', description: item.description,
        image: item.image || '', proof_link: item.proof_link || '', date: item.date || '', order: item.order,
        color: item.color || '#f59e0b'
      } : {
        title: '', subtitle: '', description: '', image: '', proof_link: '', date: '', order: 0, color: '#f59e0b'
      })
    } else if (type === 'skill') {
      setSkillForm(item ? {
        name: item.name, category: item.category, percentage: item.percentage, order: item.order
      } : {
        name: '', category: 'Languages', percentage: 80, order: 0
      })
    } else if (type === 'education') {
      setEducationForm(item ? {
        title: item.title, org: item.org, period: item.period, desc: item.desc, order: item.order, color: item.color || '#06b6d4'
      } : {
        title: '', org: '', period: '', desc: '', order: 0, color: '#06b6d4'
      })
    } else if (type === 'experience') {
      setExperienceForm(item ? {
        company: item.company, role: item.role, duration: item.duration,
        description: item.description, projects_worked: item.projects_worked || '',
        what_learned: item.what_learned || '', proof: item.proof || '',
        order: item.order, color: item.color || '#e11d48'
      } : {
        company: '', role: '', duration: '', description: '',
        projects_worked: '', what_learned: '', proof: '', order: 0, color: '#e11d48'
      })
    }

    setModalOpen(true)
  }

  // Handle Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault()

    let url = modalType === 'education'
      ? `${API_BASE_URL}/education`
      : `${API_BASE_URL}/${modalType}s`
    let method = 'POST'
    let payload = {}

    if (editingItem) {
      url += `/${editingItem.id}`
      method = 'PUT'
    }

    if (modalType === 'project') {
      payload = {
        ...projectForm,
        points: projectForm.points.split('\n').filter(p => p.trim() !== ''),
        tags: projectForm.tags.split(',').map(t => t.trim()).filter(t => t !== '')
      }
    } else if (modalType === 'certificate') {
      payload = certificateForm
    } else if (modalType === 'achievement') {
      payload = achievementForm
    } else if (modalType === 'skill') {
      const isDuplicate = portfolioData.skills.some(
        s => s.name.trim().toLowerCase() === skillForm.name.trim().toLowerCase() &&
          (!editingItem || s.id !== editingItem.id)
      )
      if (isDuplicate) {
        alert(`Skill "${skillForm.name.trim()}" already exists! Please do not add duplicate skills.`)
        return
      }
      payload = {
        ...skillForm,
        percentage: parseInt(skillForm.percentage)
      }
    } else if (modalType === 'education') {
      payload = educationForm
    } else if (modalType === 'experience') {
      payload = experienceForm
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setModalOpen(false)
        fetchPortfolioData()
      } else {
        if (res.status === 401) {
          alert('Your session has expired. Please log in again.')
          handleLogout()
          return
        }
        const err = await res.json()
        alert(`Action failed: ${err.detail || 'Unknown error'}`)
      }
    } catch {
      alert('Network request failed')
    }
  }

  // Handle Profile Picture Upload
  const handleProfileImageUpload = async (file) => {
    if (!file) return

    setUploadingProfileImage(true)
    setProfileImageSuccess(false)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE_URL}/profile/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      if (res.ok) {
        const timestamp = Date.now().toString()
        localStorage.setItem('profile_img_ts', timestamp)
        setProfileImageSuccess(true)
        window.dispatchEvent(new Event('profile-image-updated'))
        setTimeout(() => setProfileImageSuccess(false), 3000)
      } else {
        if (res.status === 401) {
          alert('Your session has expired. Please log in again.')
          handleLogout()
          return
        }
        const err = await res.json()
        alert(`Upload failed: ${err.detail || 'Unknown error'}`)
      }
    } catch {
      alert('Connection to server failed')
    } finally {
      setUploadingProfileImage(false)
    }
  }

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileSuccess(false)

    const payload = {
      name: profileForm.name,
      roles: profileForm.roles.split(',').map(r => r.trim()).filter(r => r !== ''),
      hero_bio: profileForm.hero_bio,
      about_bio_1: profileForm.about_bio_1,
      about_bio_2: profileForm.about_bio_2,
      about_tags: profileForm.about_tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      github: profileForm.github || null,
      linkedin: profileForm.linkedin || null,
      geeksforgeeks: profileForm.geeksforgeeks || null,
      email: profileForm.email || null,
      years_learning: parseInt(profileForm.years_learning) || 0,
      team_projects: parseInt(profileForm.team_projects) || 0,
      projects_built: parseInt(profileForm.projects_built) || 0,
      certificates_count: parseInt(profileForm.certificates_count) || 0,
      show_experience: !!profileForm.show_experience,
      show_projects: !!profileForm.show_projects,
      resume_url: profileForm.resume_url || '/resume.pdf'
    }

    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setProfileSuccess(true)
        fetchPortfolioData()
        setTimeout(() => setProfileSuccess(false), 3000)
      } else {
        if (res.status === 401) {
          alert('Your session has expired. Please log in again.')
          handleLogout()
          return
        }
        const err = await res.json()
        alert(`Failed to save profile: ${err.detail || 'Unknown error'}`)
      }
    } catch {
      alert('Network request failed')
    } finally {
      setSavingProfile(false)
    }
  }

  // Handle Delete
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      const url = type === 'education'
        ? `${API_BASE_URL}/education/${id}`
        : `${API_BASE_URL}/${type}s/${id}`
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        fetchPortfolioData()
      } else {
        if (res.status === 401) {
          alert('Your session has expired. Please log in again.')
          handleLogout()
          return
        }
        alert('Failed to delete item')
      }
    } catch {
      alert('Network request failed')
    }
  }

  // Handle Resume Upload
  const handleResumeUpload = async (e) => {
    e.preventDefault()
    if (!resumeFile) return

    setUploadingResume(true)
    setResumeSuccess(false)

    const formData = new FormData()
    formData.append('file', resumeFile)

    try {
      const res = await fetch(`${API_BASE_URL}/resume/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      if (res.ok) {
        setResumeSuccess(true)
        setResumeFile(null)
      } else {
        if (res.status === 401) {
          alert('Your session has expired. Please log in again.')
          handleLogout()
          return
        }
        const err = await res.json()
        alert(`Upload failed: ${err.detail || 'Unknown error'}`)
      }
    } catch {
      alert('Connection to server failed')
    } finally {
      setUploadingResume(false)
    }
  }

  if (!token) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="admin-login glass-card">
            {otpRequired ? (
              <>
                <div className="admin-login__title">
                  <FiUnlock style={{ marginBottom: 8, color: 'var(--primary)' }} size={28} />
                  <br />
                  Two-Step Verification
                </div>
                <p className="admin-login__subtitle">
                  We sent a 6-digit verification code to your pre-configured email. Please check your inbox (and spam).
                </p>

                {otpError && <div className="admin-login__error">{otpError}</div>}

                <form onSubmit={handleOtpSubmit}>
                  <div className="form-group">
                    <label>Verification Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      required
                      style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.25rem', fontWeight: 'bold' }}
                    />
                  </div>
                  {otpAttempts > 0 && (
                    <p style={{ fontSize: '0.8rem', color: '#f59e0b', textAlign: 'center', marginBottom: 8 }}>
                      ⚠️ Attempt {otpAttempts} of 3 — {3 - otpAttempts} remaining before lockout
                    </p>
                  )}
                  <button type="submit" className="btn btn-primary admin-login__btn" disabled={verificationLoading}>
                    {verificationLoading ? 'Verifying...' : 'Verify & Enter'} <FiCheckCircle size={16} />
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
                    onClick={() => {
                      setOtpRequired(false)
                      setOtpCode('')
                      setOtpError('')
                      setOtpAttempts(0)
                    }}
                  >
                    Back to Login
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="admin-login__title">
                  <FiLock style={{ marginBottom: 8, color: 'var(--primary)' }} size={28} />
                  <br />
                  Admin Portal
                </div>
                <p className="admin-login__subtitle">Enter credentials to manage portfolio contents</p>

                {loginError && <div className="admin-login__error">{loginError}</div>}

                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary admin-login__btn">
                    Log In <FiUnlock size={16} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-dashboard">

          <div className="admin-header">
            <div className="admin-header__info">
              <h2>Dashboard</h2>
              <p>Welcome back, Admin! Manage your live portfolio items dynamically.</p>
            </div>
            <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
              Logout <FiLogOut size={16} />
            </button>
          </div>

          {/* Navigation tabs */}
          <div className="admin-nav">
            <button
              className={`admin-nav__btn ${activeTab === 'projects' ? 'admin-nav__btn--active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              <FiFolder size={16} style={{ marginRight: 6 }} /> Projects
            </button>
            <button
              className={`admin-nav__btn ${activeTab === 'certificates' ? 'admin-nav__btn--active' : ''}`}
              onClick={() => setActiveTab('certificates')}
            >
              <FiAward size={16} style={{ marginRight: 6 }} /> Certificates
            </button>
            <button
              className={`admin-nav__btn ${activeTab === 'skills' ? 'admin-nav__btn--active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              <FiTool size={16} style={{ marginRight: 6 }} /> Skills
            </button>
            <button
              className={`admin-nav__btn ${activeTab === 'achievements' ? 'admin-nav__btn--active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              <FiCompass size={16} style={{ marginRight: 6 }} /> Achievements
            </button>
            <button
              className={`admin-nav__btn ${activeTab === 'education' ? 'admin-nav__btn--active' : ''}`}
              onClick={() => setActiveTab('education')}
            >
              <FiBook size={16} style={{ marginRight: 6 }} /> Education
            </button>
            <button
              className={`admin-nav__btn ${activeTab === 'experience' ? 'admin-nav__btn--active' : ''}`}
              onClick={() => setActiveTab('experience')}
            >
              <FiBriefcase size={16} style={{ marginRight: 6 }} /> Experience
            </button>
            <button
              className={`admin-nav__btn ${activeTab === 'profile' ? 'admin-nav__btn--active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FiUnlock size={16} style={{ marginRight: 6 }} /> Profile / Info
            </button>
            <button
              className={`admin-nav__btn ${activeTab === 'resume' ? 'admin-nav__btn--active' : ''}`}
              onClick={() => setActiveTab('resume')}
            >
              <FiFileText size={16} style={{ marginRight: 6 }} /> Resume
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 50, color: 'var(--text-secondary)' }}>
              Loading portfolio contents...
            </div>
          ) : (
            <>
              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <div className="admin-section">
                  <div className="admin-section__header">
                    <h3 className="admin-section__title">Projects ({portfolioData.projects.length})</h3>
                    <button className="btn btn-primary" onClick={() => openModal('project')}>
                      Add Project <FiPlus size={16} />
                    </button>
                  </div>
                  <div className="admin-list">
                    {portfolioData.projects.map(p => (
                      <div key={p.id} className="admin-item">
                        <div className="admin-item__info">
                          <span className="admin-item__title">{p.title}</span>
                          <span className="admin-item__subtitle">{p.tags.join(', ')}</span>
                        </div>
                        <div className="admin-item__actions">
                          <button className="admin-btn admin-btn--edit" onClick={() => openModal('project', p)}>
                            <FiEdit size={14} /> Edit
                          </button>
                          <button className="admin-btn admin-btn--delete" onClick={() => handleDelete('project', p.id)}>
                            <FiTrash size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificates Tab */}
              {activeTab === 'certificates' && (
                <div className="admin-section">
                  <div className="admin-section__header">
                    <h3 className="admin-section__title">Certificates ({portfolioData.certificates.length})</h3>
                    <button className="btn btn-primary" onClick={() => openModal('certificate')}>
                      Add Certificate <FiPlus size={16} />
                    </button>
                  </div>
                  <div className="admin-list">
                    {portfolioData.certificates.map(c => (
                      <div key={c.id} className="admin-item">
                        <div className="admin-item__info">
                          <span className="admin-item__title">{c.title}</span>
                          <span className="admin-item__subtitle">{c.issuer}</span>
                        </div>
                        <div className="admin-item__actions">
                          <button className="admin-btn admin-btn--edit" onClick={() => openModal('certificate', c)}>
                            <FiEdit size={14} /> Edit
                          </button>
                          <button className="admin-btn admin-btn--delete" onClick={() => handleDelete('certificate', c.id)}>
                            <FiTrash size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === 'skills' && (
                <div className="admin-section">
                  <div className="admin-section__header">
                    <h3 className="admin-section__title">Skills ({portfolioData.skills.length})</h3>
                    <button className="btn btn-primary" onClick={() => openModal('skill')}>
                      Add Skill <FiPlus size={16} />
                    </button>
                  </div>
                  <div className="admin-list">
                    {portfolioData.skills.map(s => (
                      <div key={s.id} className="admin-item">
                        <div className="admin-item__info">
                          <span className="admin-item__title">{s.name}</span>
                          <span className="admin-item__subtitle">{s.category} · {s.percentage}%</span>
                        </div>
                        <div className="admin-item__actions">
                          <button className="admin-btn admin-btn--edit" onClick={() => openModal('skill', s)}>
                            <FiEdit size={14} /> Edit
                          </button>
                          <button className="admin-btn admin-btn--delete" onClick={() => handleDelete('skill', s.id)}>
                            <FiTrash size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div className="admin-section">
                  <div className="admin-section__header">
                    <h3 className="admin-section__title">Achievements ({portfolioData.achievements.length})</h3>
                    <button className="btn btn-primary" onClick={() => openModal('achievement')}>
                      Add Achievement <FiPlus size={16} />
                    </button>
                  </div>
                  <div className="admin-list">
                    {portfolioData.achievements.map(a => (
                      <div key={a.id} className="admin-item">
                        <div className="admin-item__info">
                          <span className="admin-item__title">{a.title}</span>
                          <span className="admin-item__subtitle">{a.subtitle || a.date}</span>
                        </div>
                        <div className="admin-item__actions">
                          <button className="admin-btn admin-btn--edit" onClick={() => openModal('achievement', a)}>
                            <FiEdit size={14} /> Edit
                          </button>
                          <button className="admin-btn admin-btn--delete" onClick={() => handleDelete('achievement', a.id)}>
                            <FiTrash size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume Tab */}
              {activeTab === 'resume' && (
                <div className="admin-section">
                  <h3 className="admin-section__title" style={{ marginBottom: 24 }}>Upload / Replace Resume PDF</h3>

                  <div className="glass-card" style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
                    <form onSubmit={handleResumeUpload}>
                      <div className="form-group" style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', marginBottom: 12 }}>Select Resume PDF</label>
                        <div className="admin-uploader" onClick={() => document.getElementById('resume-input').click()}>
                          <FiUpload className="admin-uploader__icon" size={32} />
                          <p>Click to browse and choose a PDF file</p>
                          <input
                            id="resume-input"
                            type="file"
                            accept=".pdf"
                            style={{ display: 'none' }}
                            onChange={e => {
                              if (e.target.files.length > 0) {
                                setResumeFile(e.target.files[0])
                                setResumeSuccess(false)
                              }
                            }}
                          />
                          {resumeFile && (
                            <div className="admin-uploader__filename">
                              📄 {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
                            </div>
                          )}
                        </div>
                      </div>

                      {resumeSuccess && (
                        <div className="admin-uploader__success" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                          <FiCheckCircle size={16} /> Resume PDF has been successfully uploaded and replaced!
                        </div>
                      )}

                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        disabled={!resumeFile || uploadingResume}
                      >
                        {uploadingResume ? 'Uploading...' : 'Upload & Replace Resume'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Education Tab */}
              {activeTab === 'education' && (
                <div className="admin-section">
                  <div className="admin-section__header">
                    <h3 className="admin-section__title">Education Timeline ({portfolioData.education?.length || 0})</h3>
                    <button className="btn btn-primary" onClick={() => openModal('education')}>
                      Add Education <FiPlus size={16} />
                    </button>
                  </div>
                  <div className="admin-list">
                    {(portfolioData.education || []).map(e => (
                      <div key={e.id} className="admin-item">
                        <div className="admin-item__info">
                          <span className="admin-item__title">{e.title}</span>
                          <span className="admin-item__subtitle">{e.org} · {e.period}</span>
                        </div>
                        <div className="admin-item__actions">
                          <button className="admin-btn admin-btn--edit" onClick={() => openModal('education', e)}>
                            <FiEdit size={14} /> Edit
                          </button>
                          <button className="admin-btn admin-btn--delete" onClick={() => handleDelete('education', e.id)}>
                            <FiTrash size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience Tab */}
              {activeTab === 'experience' && (
                <div className="admin-section">
                  <div className="admin-section__header">
                    <h3 className="admin-section__title">Professional Experience ({portfolioData.experiences?.length || 0})</h3>
                    <button className="btn btn-primary" onClick={() => openModal('experience')}>
                      Add Experience <FiPlus size={16} />
                    </button>
                  </div>
                  <div className="admin-list">
                    {(portfolioData.experiences || []).map(exp => (
                      <div key={exp.id} className="admin-item">
                        <div className="admin-item__info">
                          <span className="admin-item__title">{exp.company}</span>
                          <span className="admin-item__subtitle">{exp.role} · {exp.duration}</span>
                        </div>
                        <div className="admin-item__actions">
                          <button className="admin-btn admin-btn--edit" onClick={() => openModal('experience', exp)}>
                            <FiEdit size={14} /> Edit
                          </button>
                          <button className="admin-btn admin-btn--delete" onClick={() => handleDelete('experience', exp.id)}>
                            <FiTrash size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile Settings Tab */}
              {activeTab === 'profile' && (
                <div className="admin-section">
                  <h3 className="admin-section__title" style={{ marginBottom: 24 }}>Update Home & About Contents</h3>

                  <div className="glass-card" style={{ padding: '30px 40px', maxWidth: 800, margin: '0 auto' }}>
                    <form onSubmit={handleProfileSubmit}>

                      <h4 style={{ color: 'var(--primary)', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
                        🖼️ Profile Photo
                      </h4>
                      <div className="form-group" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                        <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)', boxShadow: '0 0 15px rgba(225, 29, 72, 0.3)', background: '#111' }}>
                          <img
                            src={`${API_BASE_URL}/uploads/profile.jpg?t=${profileImageTimestamp}`}
                            alt="Profile Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ flex: '1', minWidth: '200px' }}>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>
                            Upload New Profile Photo
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            id="profile-img-input"
                            style={{ display: 'none' }}
                            onChange={e => {
                              if (e.target.files.length > 0) {
                                handleProfileImageUpload(e.target.files[0])
                              }
                            }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button
                              type="button"
                              className="btn btn-outline"
                              onClick={() => document.getElementById('profile-img-input').click()}
                              disabled={uploadingProfileImage}
                            >
                              {uploadingProfileImage ? 'Uploading...' : 'Choose Image'}
                            </button>
                            {profileImageSuccess && (
                              <span style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FiCheckCircle /> Updated successfully!
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                            Supports JPG, PNG, or WEBP. Uploading a new photo will automatically update the profile photo and logo globally.
                          </p>
                        </div>
                      </div>

                      <h4 style={{ color: 'var(--primary)', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
                        ⚙️ Homepage Layout Toggle
                      </h4>
                      <div className="form-group" style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <input
                            type="checkbox"
                            id="show_experience"
                            checked={profileForm.show_experience}
                            onChange={e => {
                              const val = e.target.checked
                              if (val) {
                                // Open layout choice modal to ask user for their preference
                                setShowLayoutModal(true)
                              } else {
                                // Turning experience off means projects must be shown
                                setProfileForm({ ...profileForm, show_experience: false, show_projects: true })
                              }
                            }}
                            style={{ width: 18, height: 18, cursor: 'pointer' }}
                          />
                          <label htmlFor="show_experience" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Enable Experience Timeline (Replaces or stacks with Projects section)
                          </label>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 6, marginLeft: 30 }}>
                          {profileForm.show_experience 
                            ? (profileForm.show_projects 
                                ? "Active: Showing both Professional Experience and Projects sections on the homepage." 
                                : "Active: Showing Only Experience Timeline (Projects are hidden).")
                            : "Active: Showing Featured Projects Section (Default)."}
                        </p>
                      </div>

                      <h4 style={{ color: 'var(--primary)', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8, marginTop: 24 }}>
                        👤 Home (Hero) Section
                      </h4>
                      <div className="form-group">
                        <label>Your Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={profileForm.name}
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Typed Roles (Comma-separated, for typing animation)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Full Stack Developer, Python Developer, Problem Solver"
                          value={profileForm.roles}
                          onChange={e => setProfileForm({ ...profileForm, roles: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Hero Short Bio</label>
                        <textarea
                          rows="3"
                          className="form-control"
                          value={profileForm.hero_bio}
                          onChange={e => setProfileForm({ ...profileForm, hero_bio: e.target.value })}
                          required
                        />
                      </div>

                      <h4 style={{ color: 'var(--primary)', marginTop: 32, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
                        ℹ️ About Section
                      </h4>

                      <div className="form-group">
                        <label>About Paragraph 1</label>
                        <textarea
                          rows="4"
                          className="form-control"
                          value={profileForm.about_bio_1}
                          onChange={e => setProfileForm({ ...profileForm, about_bio_1: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>About Paragraph 2 (Optional)</label>
                        <textarea
                          rows="4"
                          className="form-control"
                          value={profileForm.about_bio_2}
                          onChange={e => setProfileForm({ ...profileForm, about_bio_2: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>About Skills Tags (Comma-separated labels displayed in About card)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Python, Flask, React, MySQL, Team Player"
                          value={profileForm.about_tags}
                          onChange={e => setProfileForm({ ...profileForm, about_tags: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <label>Projects Built (Stat Counter)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={profileForm.projects_built}
                            onChange={e => setProfileForm({ ...profileForm, projects_built: parseInt(e.target.value) || 0 })}
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <label>Certificates (Stat Counter)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={profileForm.certificates_count}
                            onChange={e => setProfileForm({ ...profileForm, certificates_count: parseInt(e.target.value) || 0 })}
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <label>Years Learning (Stat Counter)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={profileForm.years_learning}
                            onChange={e => setProfileForm({ ...profileForm, years_learning: parseInt(e.target.value) || 0 })}
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <label>Team Projects (Stat Counter)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={profileForm.team_projects}
                            onChange={e => setProfileForm({ ...profileForm, team_projects: parseInt(e.target.value) || 0 })}
                            min="0"
                            required
                          />
                        </div>
                      </div>

                      <h4 style={{ color: 'var(--primary)', marginTop: 32, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
                        🌐 Social Links & Contact Info
                      </h4>

                      <div className="form-group">
                        <label>GitHub Profile URL</label>
                        <input
                          type="url"
                          className="form-control"
                          value={profileForm.github}
                          onChange={e => setProfileForm({ ...profileForm, github: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>LinkedIn Profile URL</label>
                        <input
                          type="url"
                          className="form-control"
                          value={profileForm.linkedin}
                          onChange={e => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>GeeksforGeeks Profile URL</label>
                        <input
                          type="url"
                          className="form-control"
                          value={profileForm.geeksforgeeks}
                          onChange={e => setProfileForm({ ...profileForm, geeksforgeeks: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          value={profileForm.email}
                          onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Resume PDF URL (e.g. Google Drive Link or local path)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. https://drive.google.com/file/d/.../view"
                          value={profileForm.resume_url}
                          onChange={e => setProfileForm({ ...profileForm, resume_url: e.target.value })}
                        />
                      </div>

                      {profileSuccess && (
                        <div className="admin-uploader__success" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                          <FiCheckCircle size={16} /> Home, About, and Socials saved successfully!
                        </div>
                      )}

                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: 24 }}
                        disabled={savingProfile}
                      >
                        {savingProfile ? 'Saving Changes...' : 'Save Settings'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* CRUD MODAL OVERLAY */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal glass-card" onClick={e => e.stopPropagation()}>
            <h3 className="admin-modal__title">
              {editingItem ? 'Edit' : 'Add New'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </h3>

            <form onSubmit={handleSubmit}>

              {/* Project Form Fields */}
              {modalType === 'project' && (
                <>
                  <div className="form-group">
                    <label>Project Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={projectForm.title}
                      onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      value={projectForm.description}
                      onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Key Accomplishments (One per line)</label>
                    <textarea
                      rows="5"
                      className="form-control"
                      value={projectForm.points}
                      placeholder="e.g. Built Chrome Extension&#10;Integrated Pomodoro timer"
                      onChange={e => setProjectForm({ ...projectForm, points: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tags / Technologies (Comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. React, Python, Flask"
                      value={projectForm.tags}
                      onChange={e => setProjectForm({ ...projectForm, tags: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>GitHub Repository URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={projectForm.github}
                      onChange={e => setProjectForm({ ...projectForm, github: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Live Demo URL (Optional)</label>
                    <input
                      type="url"
                      className="form-control"
                      value={projectForm.live}
                      onChange={e => setProjectForm({ ...projectForm, live: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      id="featured"
                      checked={projectForm.featured}
                      onChange={e => setProjectForm({ ...projectForm, featured: e.target.checked })}
                    />
                    <label htmlFor="featured" style={{ margin: 0, cursor: 'pointer' }}>Featured Project</label>
                  </div>
                  <div className="form-group">
                    <label>Card Highlight Color</label>
                    <input
                      type="color"
                      className="form-control"
                      style={{ height: 44, padding: 2, cursor: 'pointer' }}
                      value={projectForm.color}
                      onChange={e => setProjectForm({ ...projectForm, color: e.target.value, accentColor: `${e.target.value}18` })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Display Order (Higher = first)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={projectForm.order}
                      onChange={e => setProjectForm({ ...projectForm, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </>
              )}

              {/* Certificate Form Fields */}
              {modalType === 'certificate' && (
                <>
                  <div className="form-group">
                    <label>Certificate Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={certificateForm.title}
                      onChange={e => setCertificateForm({ ...certificateForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Issuer</label>
                    <input
                      type="text"
                      className="form-control"
                      value={certificateForm.issuer}
                      onChange={e => setCertificateForm({ ...certificateForm, issuer: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Year / Date</label>
                    <input
                      type="text"
                      className="form-control"
                      value={certificateForm.date}
                      placeholder="e.g. 2024"
                      onChange={e => setCertificateForm({ ...certificateForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Certificate File / Image</label>
                    <label
                      htmlFor="cert-image-input"
                      className="admin-uploader"
                      onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('admin-uploader--dragover') }}
                      onDragLeave={e => e.currentTarget.classList.remove('admin-uploader--dragover')}
                      onDrop={e => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('admin-uploader--dragover')
                        if (e.dataTransfer.files.length > 0) handleCertFileUpload(e.dataTransfer.files[0])
                      }}
                      style={{ display: 'block', cursor: 'pointer' }}
                    >
                      <FiUpload className="admin-uploader__icon" size={28} />
                      <p>{uploadingCert ? 'Uploading...' : 'Click or drag & drop to upload image/PDF'}</p>
                      <input
                        id="cert-image-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        style={{ display: 'none' }}
                        onChange={e => {
                          if (e.target.files.length > 0) handleCertFileUpload(e.target.files[0])
                        }}
                      />
                      {certFile && (
                        <div className="admin-uploader__filename">
                          📄 {certFile.name} ({(certFile.size / 1024).toFixed(1)} KB)
                        </div>
                      )}
                      {certUploadSuccess && (
                        <div className="admin-uploader__success" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                          <FiCheckCircle size={14} /> Uploaded successfully!
                        </div>
                      )}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ marginTop: 8 }}
                      placeholder="Or paste Direct Image/PDF URL (e.g. https://i.postimg.cc/xyz/my-cert.png)"
                      value={certificateForm.image}
                      onChange={e => setCertificateForm({ ...certificateForm, image: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Credential Verification URL (Optional)</label>
                    <input
                      type="url"
                      className="form-control"
                      value={certificateForm.link}
                      onChange={e => setCertificateForm({ ...certificateForm, link: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Card Highlight Color</label>
                    <input
                      type="color"
                      className="form-control"
                      style={{ height: 44, padding: 2, cursor: 'pointer' }}
                      value={certificateForm.color}
                      onChange={e => setCertificateForm({ ...certificateForm, color: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Display Order</label>
                    <input
                      type="number"
                      className="form-control"
                      value={certificateForm.order}
                      onChange={e => setCertificateForm({ ...certificateForm, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </>
              )}

              {/* Skill Form Fields */}
              {modalType === 'skill' && (
                <>
                  <div className="form-group">
                    <label>Skill Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={skillForm.name}
                      onChange={e => setSkillForm({ ...skillForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="form-control"
                      value={skillForm.category}
                      onChange={e => setSkillForm({ ...skillForm, category: e.target.value })}
                    >
                      <option value="Languages">Languages (Proficiency Bars)</option>
                      <option value="Frameworks">Frameworks (Badges)</option>
                      <option value="Tools">Cloud & Tools (Badges)</option>
                      <option value="Software Engineering">Software Engineering (Principles / Tags)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Proficiency Level (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="form-control"
                      value={skillForm.percentage}
                      onChange={e => setSkillForm({ ...skillForm, percentage: parseInt(e.target.value) || 80 })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Display Order</label>
                    <input
                      type="number"
                      className="form-control"
                      value={skillForm.order}
                      onChange={e => setSkillForm({ ...skillForm, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </>
              )}

              {/* Achievement Form Fields */}
              {modalType === 'achievement' && (
                <>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={achievementForm.title}
                      onChange={e => setAchievementForm({ ...achievementForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Organization / Subtitle</label>
                    <input
                      type="text"
                      className="form-control"
                      value={achievementForm.subtitle}
                      onChange={e => setAchievementForm({ ...achievementForm, subtitle: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      value={achievementForm.description}
                      onChange={e => setAchievementForm({ ...achievementForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Proof Document / Image (Optional)</label>
                    <label
                      htmlFor="ach-image-input"
                      className="admin-uploader"
                      onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('admin-uploader--dragover') }}
                      onDragLeave={e => e.currentTarget.classList.remove('admin-uploader--dragover')}
                      onDrop={e => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('admin-uploader--dragover')
                        if (e.dataTransfer.files.length > 0) handleAchFileUpload(e.dataTransfer.files[0])
                      }}
                      style={{ display: 'block', cursor: 'pointer' }}
                    >
                      <FiUpload className="admin-uploader__icon" size={28} />
                      <p>{uploadingAch ? 'Uploading...' : 'Click or drag & drop to upload image/PDF'}</p>
                      <input
                        id="ach-image-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        style={{ display: 'none' }}
                        onChange={e => {
                          if (e.target.files.length > 0) handleAchFileUpload(e.target.files[0])
                        }}
                      />
                      {achFile && (
                        <div className="admin-uploader__filename">
                          📄 {achFile.name} ({(achFile.size / 1024).toFixed(1)} KB)
                        </div>
                      )}
                      {achUploadSuccess && (
                        <div className="admin-uploader__success" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                          <FiCheckCircle size={14} /> Uploaded successfully!
                        </div>
                      )}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ marginTop: 8 }}
                      placeholder="Or paste Direct Image/PDF URL (e.g. https://i.postimg.cc/xyz/proof.png)"
                      value={achievementForm.image}
                      onChange={e => setAchievementForm({ ...achievementForm, image: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Proof Verification Link (Optional)</label>
                    <input
                      type="url"
                      className="form-control"
                      value={achievementForm.proof_link}
                      onChange={e => setAchievementForm({ ...achievementForm, proof_link: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Year / Period</label>
                    <input
                      type="text"
                      className="form-control"
                      value={achievementForm.date}
                      placeholder="e.g. Jan 2026 – June 2026"
                      onChange={e => setAchievementForm({ ...achievementForm, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Card Highlight Color</label>
                    <input
                      type="color"
                      className="form-control"
                      style={{ height: 44, padding: 2, cursor: 'pointer' }}
                      value={achievementForm.color}
                      onChange={e => setAchievementForm({ ...achievementForm, color: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Display Order</label>
                    <input
                      type="number"
                      className="form-control"
                      value={achievementForm.order}
                      onChange={e => setAchievementForm({ ...achievementForm, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </>
              )}

              {/* Education Form Fields */}
              {modalType === 'education' && (
                <>
                  <div className="form-group">
                    <label>Degree / Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={educationForm.title}
                      onChange={e => setEducationForm({ ...educationForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>School / University / Organization</label>
                    <input
                      type="text"
                      className="form-control"
                      value={educationForm.org}
                      onChange={e => setEducationForm({ ...educationForm, org: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Time Period</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 2023 – 2027"
                      value={educationForm.period}
                      onChange={e => setEducationForm({ ...educationForm, period: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description / Core Details</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      value={educationForm.desc}
                      onChange={e => setEducationForm({ ...educationForm, desc: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Card Highlight Color</label>
                    <input
                      type="color"
                      className="form-control"
                      style={{ height: 44, padding: 2, cursor: 'pointer' }}
                      value={educationForm.color}
                      onChange={e => setEducationForm({ ...educationForm, color: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Display Order</label>
                    <input
                      type="number"
                      className="form-control"
                      value={educationForm.order}
                      onChange={e => setEducationForm({ ...educationForm, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </>
              )}

              {/* Experience Form Fields */}
              {modalType === 'experience' && (
                <>
                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={experienceForm.company}
                      onChange={e => setExperienceForm({ ...experienceForm, company: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Job Role / Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={experienceForm.role}
                      onChange={e => setExperienceForm({ ...experienceForm, role: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration / Timeframe</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Jan 2026 - Present"
                      value={experienceForm.duration}
                      onChange={e => setExperienceForm({ ...experienceForm, duration: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description / Overview</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      placeholder="Describe the company/team and your primary focus area..."
                      value={experienceForm.description}
                      onChange={e => setExperienceForm({ ...experienceForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Projects Worked On (One project per line)</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      placeholder="e.g. Developed doctor prescription portal&#10;Integrated REST APIs and SQLite DB"
                      value={experienceForm.projects_worked}
                      onChange={e => setExperienceForm({ ...experienceForm, projects_worked: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Key Learnings & Acquired Skills (Comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. API Development, Security, Flask, Teamwork"
                      value={experienceForm.what_learned}
                      onChange={e => setExperienceForm({ ...experienceForm, what_learned: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Verification Proof (Offer Letter / ID Card / Email screenshot) - Optional</label>
                    <label
                      htmlFor="exp-proof-input"
                      className="admin-uploader"
                      onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('admin-uploader--dragover') }}
                      onDragLeave={e => e.currentTarget.classList.remove('admin-uploader--dragover')}
                      onDrop={e => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('admin-uploader--dragover')
                        if (e.dataTransfer.files.length > 0) handleExpFileUpload(e.dataTransfer.files[0])
                      }}
                      style={{ display: 'block', cursor: 'pointer' }}
                    >
                      <FiUpload className="admin-uploader__icon" size={28} />
                      <p>{uploadingExp ? 'Uploading...' : 'Click or drag & drop to upload PDF or Image'}</p>
                      <input
                        id="exp-proof-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        style={{ display: 'none' }}
                        onChange={e => {
                          if (e.target.files.length > 0) handleExpFileUpload(e.target.files[0])
                        }}
                      />
                      {expFile && (
                        <div className="admin-uploader__filename">
                          📄 {expFile.name} ({(expFile.size / 1024).toFixed(1)} KB)
                        </div>
                      )}
                      {expUploadSuccess && (
                        <div className="admin-uploader__success" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                          <FiCheckCircle size={14} /> Uploaded successfully!
                        </div>
                      )}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ marginTop: 8 }}
                      placeholder="Or paste Direct Image/PDF URL (e.g. https://i.postimg.cc/xyz/proof.png)"
                      value={experienceForm.proof}
                      onChange={e => setExperienceForm({ ...experienceForm, proof: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Highlight Accent Color</label>
                    <input
                      type="color"
                      className="form-control"
                      style={{ height: 44, padding: 2, cursor: 'pointer' }}
                      value={experienceForm.color}
                      onChange={e => setExperienceForm({ ...experienceForm, color: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Display Order (Higher = first)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={experienceForm.order}
                      onChange={e => setExperienceForm({ ...experienceForm, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </>
              )}

              <div className="admin-modal__footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* HOMEPAGE SECTION LAYOUT CHOICE MODAL */}
      {showLayoutModal && (
        <div className="admin-modal-overlay" onClick={() => setShowLayoutModal(false)}>
          <div className="admin-modal glass-card layout-choice-modal" onClick={e => e.stopPropagation()}>
            <h3 className="layout-choice-title">Configure Homepage Layout</h3>
            <p className="layout-choice-desc">
              You are enabling the Experience section. Please select how you want to display it alongside your Projects:
            </p>

            <div className="layout-options-container">
              <div 
                className="layout-option-card"
                onClick={() => {
                  setProfileForm({ ...profileForm, show_experience: true, show_projects: false });
                  setShowLayoutModal(false);
                }}
              >
                <div className="layout-option-card__title">
                  <FiBriefcase size={18} style={{ color: 'var(--primary)' }} />
                  Only Experience
                </div>
                <div className="layout-option-card__desc">
                  Show professional experience timeline. The projects section will be hidden on the homepage.
                </div>
              </div>

              <div 
                className="layout-option-card"
                onClick={() => {
                  setProfileForm({ ...profileForm, show_experience: true, show_projects: true });
                  setShowLayoutModal(false);
                }}
              >
                <div className="layout-option-card__title">
                  <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <FiBriefcase size={16} style={{ color: 'var(--primary)' }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>+</span>
                    <FiFolder size={16} style={{ color: '#06b6d4' }} />
                  </span>
                  Experience & Projects
                </div>
                <div className="layout-option-card__desc">
                  Show experience timeline first, with your featured projects listed directly below it on the homepage.
                </div>
              </div>
            </div>

            <button 
              type="button" 
              className="layout-modal-cancel" 
              onClick={() => setShowLayoutModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
