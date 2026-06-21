import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'

import HeroManager from './components/HeroManager'
import AboutManager from './components/AboutManager'
import CardsManager from './components/CardsManager'
import ProjectsManager from './components/ProjectsManager'
import ResumeManager from './components/ResumeManager'
import ContactManager from './components/ContactManager'
import AdminTechStack from './components/AdminTechStack'
import ExperiencesManager from './components/ExperiencesManager'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('hero')
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated')
    navigate('/admin/login')
  }

  // 🔴 Fetch unread messages count
  const fetchUnreadCount = async () => {
    const { count, error } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    if (!error) setUnreadCount(count || 0)
  }

  // 🔥 Realtime listener
  useEffect(() => {
    fetchUnreadCount()

    const channel = supabase
      .channel('contact-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_messages' },
        () => fetchUnreadCount()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const tabs = [
    { id: 'hero', label: 'Hero' },
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'cards', label: 'Cards' },
    { id: 'projects', label: 'Projects' },
    { id: 'resume', label: 'Resume' },
    {
      id: 'contact',
      label: 'Contact Messages',
      badge: unreadCount,
    },
    { id: 'techstack', label: 'Tech Stack' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>

          <div className="flex gap-4">
            <a href="/" target="_blank" className="text-blue-600">View Site</a>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded shadow">
          <nav className="flex gap-2 overflow-x-auto px-2 py-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 text-sm font-medium border-b-2 rounded-t
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:bg-gray-100'
                  }`}
              >
                {tab.label}

                {/* 🔴 Notification badge */}
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded shadow p-6 mt-6">
          {activeTab === 'hero' && <HeroManager />}
          {activeTab === 'about' && <AboutManager />}
          {activeTab === 'experience' && <ExperiencesManager />}
          {activeTab === 'cards' && <CardsManager />}
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'resume' && <ResumeManager />}
          {activeTab === 'contact' && <ContactManager />}
          {activeTab === 'techstack' && <AdminTechStack />}
        </div>
      </div>
    </div>
  )
}
