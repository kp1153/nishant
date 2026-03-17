const { spawn } = require('child_process')
const http = require('http')

function checkServer(resolve) {
  http.get('http://localhost:3000', () => resolve())
    .on('error', () => setTimeout(() => checkServer(resolve), 1000))
}

const next = spawn('npm', ['run', 'dev'], { shell: true, stdio: 'inherit' })

new Promise(resolve => setTimeout(() => checkServer(resolve), 3000)).then(() => {
  spawn('electron', ['.'], { shell: true, stdio: 'inherit' })
})