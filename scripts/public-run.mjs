import { spawn } from 'node:child_process'
import net from 'node:net'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'
import { assertStableConfig, DEFAULT_PUBLIC_PORT, getPublicConfig } from './public-utils.mjs'

const HEALTH_TIMEOUT_MS = 20_000
const TUNNEL_TIMEOUT_MS = 30_000
const SERVER_BOOTSTRAP = "import './server/index.js'; setInterval(() => {}, 1_000_000)"

function parseArgs(argv) {
  return {
    mode: argv.includes('--stable') ? 'stable' : argv.includes('--quick') ? 'quick' : 'auto',
    shouldBuild: !argv.includes('--no-build'),
  }
}

function commandExists(command, args = ['--version']) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'ignore' })
    child.on('error', () => resolve(false))
    child.on('exit', code => resolve(code === 0))
  })
}

function runOrFail(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options })
    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0) resolve()
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'null'}`))
    })
  })
}

function canListen(port) {
  return new Promise(resolve => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port, '127.0.0.1')
  })
}

async function findFreePort(startPort) {
  for (let port = startPort; port < startPort + 50; port += 1) {
    if (await canListen(port)) return port
  }
  throw new Error(`No free port found near ${startPort}`)
}

async function assertPortAvailable(port) {
  if (!await canListen(port)) {
    throw new Error(`PUBLIC_PORT ${port} is already in use. Stable mode requires a fixed free port that matches the Cloudflare route.`)
  }
}

async function waitForHealth(port) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < HEALTH_TIMEOUT_MS) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health`)
      if (res.ok) return
    } catch {}
    await delay(300)
  }
  throw new Error(`Server did not become healthy within ${HEALTH_TIMEOUT_MS}ms`)
}

async function waitForPublicHealth(baseUrl, timeoutMs = TUNNEL_TIMEOUT_MS) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/api/health`)
      if (res.ok) return
    } catch {}
    await delay(500)
  }
  throw new Error(`Public URL did not become healthy within ${timeoutMs}ms: ${baseUrl}`)
}

function stripAnsi(text) {
  return text.replace(/\x1B\[[0-9;]*[A-Za-z]/g, '')
}

function pipeWithPrefix(stream, prefix, onLine) {
  let buffer = ''
  stream.on('data', chunk => {
    buffer += chunk.toString()
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const clean = stripAnsi(line)
      if (!clean.trim()) continue
      console.log(`${prefix} ${clean}`)
      onLine?.(clean)
    }
  })
}

function waitForQuickTunnelUrl(child) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now()
    let url = null
    const finish = (fn, value) => {
      clearInterval(timer)
      fn(value)
    }

    const onLine = line => {
      const match = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i)
      if (match && !url) {
        url = match[0]
        finish(resolve, url)
      }
    }

    pipeWithPrefix(child.stdout, '[tunnel]', onLine)
    pipeWithPrefix(child.stderr, '[tunnel]', onLine)

    child.on('error', reject)
    child.on('exit', code => {
      if (!url) finish(reject, new Error(`cloudflared exited before returning a URL (code ${code ?? 'null'})`))
    })

    const timer = setInterval(() => {
      if (Date.now() - startedAt >= TUNNEL_TIMEOUT_MS) {
        if (!url) finish(reject, new Error(`Tunnel URL was not received within ${TUNNEL_TIMEOUT_MS}ms`))
      }
    }, 250)
  })
}

function spawnManaged(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  })
  child.on('error', error => {
    console.error(`[process] ${command} failed: ${error.message}`)
  })
  return child
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const config = getPublicConfig()
  const stableMode = args.mode === 'stable' || (args.mode === 'auto' && Boolean(config.tunnelToken && config.publicHostname))

  if (!await commandExists('cloudflared')) {
    throw new Error('cloudflared is not installed. Install it first to expose the app publicly.')
  }

  if (stableMode) {
    assertStableConfig(config)
  }

  console.log(`[public] Mode: ${stableMode ? 'stable tunnel' : 'quick tunnel'}`)

  if (args.shouldBuild) {
    console.log('[public] Building frontend...')
    await runOrFail(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
      cwd: config.cwd,
      env: config.env,
    })
  } else {
    console.log('[public] Skipping frontend build (--no-build)')
  }

  const port = stableMode
    ? (await assertPortAvailable(config.localPort || DEFAULT_PUBLIC_PORT), config.localPort || DEFAULT_PUBLIC_PORT)
    : await findFreePort(config.localPort || DEFAULT_PUBLIC_PORT)
  const server = spawnManaged('node', ['--experimental-strip-types', '--input-type=module', '-e', SERVER_BOOTSTRAP], {
    cwd: config.cwd,
    env: { ...config.env, PORT: String(port) },
  })
  pipeWithPrefix(server.stdout, '[server]')
  pipeWithPrefix(server.stderr, '[server]')

  let shuttingDown = false
  let tunnel = null
  const shutdown = (code = 0) => {
    if (shuttingDown) return
    shuttingDown = true
    server.kill('SIGTERM')
    tunnel?.kill('SIGTERM')
    setTimeout(() => process.exit(code), 200)
  }

  process.on('SIGINT', () => shutdown(0))
  process.on('SIGTERM', () => shutdown(0))

  server.on('exit', code => {
    if (!shuttingDown) {
      console.error(`[server] exited unexpectedly with code ${code ?? 'null'}`)
      shutdown(1)
    }
  })

  await waitForHealth(port)
  console.log(`[public] Server is healthy on http://127.0.0.1:${port}`)
  if (!config.env.JWT_SECRET) {
    console.warn('[public] JWT_SECRET is not set. The server is using the built-in dev secret.')
  }

  const tunnelArgs = stableMode
    ? ['tunnel', 'run', '--token', config.tunnelToken, '--no-autoupdate']
    : ['tunnel', '--url', `http://127.0.0.1:${port}`, '--no-autoupdate']

  tunnel = spawnManaged('cloudflared', tunnelArgs, {
    cwd: config.cwd,
    env: config.env,
  })
  tunnel.on('exit', code => {
    if (!shuttingDown) {
      console.error(`[tunnel] exited unexpectedly with code ${code ?? 'null'}`)
      shutdown(1)
    }
  })

  const url = stableMode
    ? (await waitForPublicHealth(config.publicUrl), config.publicUrl)
    : await waitForQuickTunnelUrl(tunnel)
  console.log('')
  console.log(`[public] App is reachable on the internet: ${url}`)
  console.log('[public] Press Ctrl+C to stop the server and tunnel.')
}

main().catch(error => {
  console.error(`[public] ${error.message}`)
  process.exit(1)
})
