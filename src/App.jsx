import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// 1. Make sure your components and cursor are imported
import Layout from './components/Layout'
import CustomCursor from './components/CustomCursor'

// 2. Make sure your page imports are present
import Home from './pages/Home'
import CardDetail from './pages/CardDetail'
import ItemDetail from './pages/ItemDetail'
import Projects from './pages/Projects'
import Resume from './pages/Resume'
import ExperienceDetail from './pages/ExperienceDetail'

// 3. Admin imports
import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import ProtectedRoute from './admin/ProtectedRoute'

function App() {
  return (
    <Router>
      {/* Moving this here fixes the cursor in Admin */}
      <CustomCursor /> 

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="card/:id" element={<CardDetail />} />
          <Route path="card/:cardId/item/:itemId" element={<ItemDetail />} />
          <Route path="projects" element={<Projects />} />
          <Route path="resume" element={<Resume />} />
          <Route path="experience/:id" element={<ExperienceDetail />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App