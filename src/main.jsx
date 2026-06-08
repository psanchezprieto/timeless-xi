import React from 'react'
import ReactDOM from 'react-dom/client'
import posthog from 'posthog-js'
import App from './App'

// Initialize PostHog
posthog.init(
  import.meta.env.VITE_POSTHOG_KEY || 'placeholder_key',
  {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.posthog.com',
    enabled: import.meta.env.VITE_POSTHOG_ENABLED !== 'false',
    opt_out_capturing_by_default: true,
  }
)

// Restore consent from previous visit
if (localStorage.getItem('analytics-consent') === 'accepted') {
  posthog.opt_in_capturing()
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
