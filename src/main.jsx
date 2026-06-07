import React from 'react'
import ReactDOM from 'react-dom/client'
import posthog from 'posthog-js'
import App from './App'

// Initialize PostHog
posthog.init(
  import.meta.env.VITE_POSTHOG_KEY || 'placeholder_key',
  {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.posthog.com',
    enabled: import.meta.env.VITE_POSTHOG_ENABLED !== 'false',
  }
)

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
