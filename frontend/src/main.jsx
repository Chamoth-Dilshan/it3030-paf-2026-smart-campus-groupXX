import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import store from './store'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster 
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#0f172a',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.1)',
              },
            }}
          />
          <App />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)