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

export default function PortfolioPage({ data }) {
  const [showExperience, setShowExperience] = useState(false)
  const [showProjects, setShowProjects] = useState(true)

  useEffect(() => {
    async function checkExperienceToggle() {
      const finalData = data || await fetchPortfolioData()
      if (finalData && finalData.profile) {
        setShowExperience(!!finalData.profile.show_experience)
        setShowProjects(finalData.profile.show_projects !== undefined ? !!finalData.profile.show_projects : true)
      }
    }
    checkExperienceToggle()
  }, [data])

  return (
    <>
      <Hero data={data} />
      <About data={data} />
      <Skills data={data} />
      {showExperience && <Experience data={data} />}
      {(!showExperience || showProjects) && <Projects data={data} />}
      <Certificates data={data} />
      <Achievements data={data} />
      <Resume data={data} />
      <Contact />
    </>
  )
}


