import { useState, useEffect } from 'react'
import { getContacts } from './services/api'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Page Content */}
        <main className="flex-1">
          <Dashboard 
            contacts={contacts} 
            loading={loading} 
            error={error} 
          />
        </main>

        {/* Footer */}
        <footer className="py-4 px-8 text-center text-sm text-gray-400 border-t border-gray-100 bg-white">
          &copy; {new Date().getFullYear()} WhatsApp AI Automation. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

export default App
