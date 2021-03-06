require('./prelaunch')
const { TrestleAPI } = require('@whiskeedev/trestle')

const titleCard = '[index.js]'.magenta

// Check if we should be running in secureMode or not
const secureMode = String(process.env.API_SECURE).toLowerCase() === 'true'

// Create a new TrestleAPI instance
const api = new TrestleAPI({ port: process.env.API_PORT })
api.secureMode = secureMode

if (secureMode && (process.env.SSL_KEY && process.env.SSL_CERT)) {
  // If we are in secure mode, attempt to set the SSL key and cert
  const key = fs.readFileSync(process.env.SSL_KEY).toString()
  const cert = fs.readFileSync(process.env.SSL_CERT).toString()

  api.setSSL(key, cert)
} else if (secureMode) {
  // If we can't set the SSL key and cert, but we are still attempting to run in secure mode, throw an error
  throw new Error('SSL Creds missing')
}

require('./database').then(() => {
  console.log(titleCard, 'Database successfully initialized'.green);

  // Incorporate the routes
  const { routes } = require('./routes')
  routes.forEach(route => api.addRoute(route))

  // Start the API
  api.init()
})