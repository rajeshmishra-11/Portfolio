import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import PortfolioPage from './components/PortfolioPage'
import AdminDashboard from './components/AdminDashboard'
import Footer from './components/Footer'
import { ThemeProvider } from './ThemeContext'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<PortfolioPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
