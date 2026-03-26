import { useState, useEffect } from 'react'
import { getContacts } from './services/api'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import ContactsPage from './components/ContactsPage'
import TemplatesPage from './components/TemplatesPage'
import CampaignsPage from './components/CampaignsPage'
import ChatPage from './components/ChatPage'
import { ChatProvider } from './context/ChatContext'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data } = await getContacts()
        setContacts(data)
      } catch (err) {
        console.error('Error fetching contacts:', err)
        setError('Backend se connect nahi ho pa raha hai. (Failed to connect to backend)')
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard 
            contacts={contacts} 
            loading={loading} 
            error={error} 
            setActivePage={setActivePage}
          />
        )
      case 'contacts':
        return <ContactsPage />
      case 'templates':
        return <TemplatesPage />
      case 'campaigns':
        return <CampaignsPage />
      case 'chat':
        return <ChatPage />
      default:
        return (
          <Dashboard 
            contacts={contacts} 
            loading={loading} 
            error={error} 
          />
        )
    }
  }

  return (
    <ChatProvider>
      <div className="flex min-h-screen bg-[#07071a]">
        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && window.innerWidth < 1024 && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
        />

        {/* Main Content Area */}
        <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen && window.innerWidth >= 1024 ? 'lg:ml-64' : ''}`}>
          {/* Navbar */}
          <Navbar 
            pageTitle={activePage.charAt(0).toUpperCase() + activePage.slice(1)} 
            toggleSidebar={toggleSidebar}
          />

          {/* Page Content */}
          <div className="flex-1 overflow-hidden">
            {renderPage()}
          </div>
        </main>
      </div>
    </ChatProvider>
  )
}

export default App
