import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CardDetail from './pages/CardDetail'
import ItemDetail from './pages/ItemDetail'
import Projects from './pages/Projects'
import Resume from './pages/Resume'
import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import ProtectedRoute from './admin/ProtectedRoute'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="card/:id" element={<CardDetail />} />

          {/* ⭐ ITEM DETAIL ROUTE */}
          <Route path="card/:cardId/item/:itemId" element={<ItemDetail />} />

          <Route path="projects" element={<Projects />} />
          <Route path="resume" element={<Resume />} />
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
