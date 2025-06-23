import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CreatorsPage from './pages/CreatorsPage'
import GeneratePage from './pages/GeneratePage'
import PreviewPage from './pages/PreviewPage'
import Layout from './components/Layout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        
        <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/creators" element={<CreatorsPage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/preview" element={<PreviewPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App