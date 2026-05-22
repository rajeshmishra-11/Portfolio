import { useState, useEffect } from 'react'
import { fetchPortfolioData } from '../portfolioApi'
import Hero from './Hero'
import About from './About'
import Skills from './Skills'
import Projects from './Projects'
import Experience from './Experience'
import Certificates from './Certificates'
import Achievements from './Achievements'
import Resume from './Resume'
import Contact from './Contact'

export default function PortfolioPage() {
  const [showExperience, setShowExperience] = useState(false)
  const [showProjects, setShowProjects] = useState(true)

  useEffect(() => {
    async function checkExperienceToggle() {
      const data = await fetchPortfolioData()
      if (data && data.profile) {
        setShowExperience(!!data.profile.show_experience)
        setShowProjects(data.profile.show_projects !== undefined ? !!data.profile.show_projects : true)
      }
    }
    checkExperienceToggle()
  }, [])

  return (
    <>
      <Hero />
      <About />
      <Skills />
      {showExperience && <Experience />}
      {(!showExperience || showProjects) && <Projects />}
      <Certificates />
      <Achievements />
      <Resume />
      <Contact />
    </>
  )
}

