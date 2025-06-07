import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // Tailwind CSS base styles
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.tsx'; // Import AuthProvider
import { I18nProvider } from './contexts/I18nContext.tsx'; // Import I18nProvider

// Disabled StrictMode to prevent duplicate renders that might cause duplicate API submissions
ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <I18nProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </I18nProvider>
  </AuthProvider>
)
