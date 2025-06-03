import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // Tailwind CSS base styles
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.tsx'; // Import AuthProvider

// Disabled StrictMode to prevent duplicate renders that might cause duplicate API submissions
ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider> {/* Wrap BrowserRouter with AuthProvider */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
)
