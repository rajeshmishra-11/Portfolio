import { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import PortfolioPage from './components/PortfolioPage'
import AdminDashboard from './components/AdminDashboard'
import Footer from './components/Footer'
import { ThemeProvider } from './ThemeContext'
import { fetchPortfolioData } from './portfolioApi'
import './App.css'

function AppContent() {
  const [portfolioData, setPortfolioData] = useState(null)

  useEffect(() => {
    async function loadData() {
      const data = await fetchPortfolioData()
      if (data) {
        setPortfolioData(data)
      }
    }
    loadData()
  }, [])

  return (
    <div className="app">
      <Navbar data={portfolioData} />
      <main>
        <Routes>
          <Route path="/" element={<PortfolioPage data={portfolioData} />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}

export default App

