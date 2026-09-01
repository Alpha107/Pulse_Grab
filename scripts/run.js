#!/usr/bin/env node
/**
 * One-command launcher for PulseGrab.
 *
 * `npm start` from the repo root:
 *   1. bootstraps the backend venv / frontend node_modules if missing
 *   2. starts the FastAPI backend (0.0.0.0:8000) and the Next.js frontend
 *      (localhost:3000) side by side, with labeled output
 *   3. opens your browser once the frontend responds
 *   4. shuts both down cleanly on Ctrl+C
 */
const { spawn, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const http = require("http");

const ROOT = path.resolve(__dirname, "..");
const BACKEND_DIR = path.join(ROOT, "backend");
const FRONTEND_DIR = path.join(ROOT, "frontend");
const WIN = process.platform === "win32";

const VENV_PYTHON = path.join(BACKEND_DIR, "venv", WIN ? "Scripts\\python.exe" : "bin/python");

const COLORS = { backend: "\x1b[36m", frontend: "\x1b[35m", boot: "\x1b[33m", reset: "\x1b[0m" };

function log(tag, line) {
  const color = COLORS[tag] || "";
  process.stdout.write(`${color}[${tag}]${COLORS.reset} ${line}\n`);
}

function pipeOutput(tag, child) {
  const relay = (buf) => {
    buf
      .toString()
      .split(/\r?\n/)
      .filter((l) => l.length > 0)
      .forEach((line) => log(tag, line));
  };
  child.stdout?.on("data", relay);
  child.stderr?.on("data", relay);
}

function run(cmd, args, opts) {
  const res = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (res.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} failed (exit ${res.status})`);
  }
}

function lanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "127.0.0.1";
}

function waitForHttp(url, timeoutMs) {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;
    (function poll() {
      const req = http.get(url, (res) => {
        res.resume();
        resolve(true);
      });
      req.on("error", () => {
        if (Date.now() > deadline) return resolve(false);
        setTimeout(poll, 400);
      });
      req.setTimeout(1000, () => req.destroy());
    })();
  });
}

function openBrowser(url) {
  const cmd = WIN ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = WIN ? ["/c", "start", "", url] : [url];
  spawn(cmd, args, { stdio: "ignore", detached: true }).unref();
}

async function bootstrap() {
  if (!fs.existsSync(path.join(BACKEND_DIR, "venv"))) {
    log("boot", "no backend/venv found - creating one and installing dependencies (first run only)...");
    run("python", ["-m", "venv", "venv"], { cwd: BACKEND_DIR });
    const pip = path.join(BACKEND_DIR, "venv", WIN ? "Scripts\\pip.exe" : "bin/pip");
    run(pip, ["install", "--quiet", "--disable-pip-version-check", "-r", "requirements.txt"], {
      cwd: BACKEND_DIR,
    });
    log("boot", "backend dependencies installed.");
  }

  if (!fs.existsSync(path.join(FRONTEND_DIR, "node_modules"))) {
    log("boot", "no frontend/node_modules found - running npm install (first run only)...");
    if (WIN) {
      run("npm install --silent", [], { cwd: FRONTEND_DIR, shell: true });
    } else {
      run("npm", ["install", "--silent"], { cwd: FRONTEND_DIR });
    }
    log("boot", "frontend dependencies installed.");
  }

  const ffmpegCheck = spawnSync(WIN ? "where" : "which", ["ffmpeg"]);
  if (ffmpegCheck.status !== 0) {
    log(
      "boot",
      "\x1b[33mwarning:\x1b[0m ffmpeg not found on PATH - mp3 conversion and video muxing will fail until it's installed."
    );
  }
}

async function main() {
  await bootstrap();

  const children = [];
  const killAll = () => {
    for (const c of children) {
      if (!c.killed) {
        try {
          WIN ? spawnSync("taskkill", ["/pid", String(c.pid), "/t", "/f"]) : c.kill("SIGTERM");
        } catch {
          /* already gone */
        }
      }
    }
  };
  process.on("SIGINT", () => {
    log("boot", "shutting down...");
    killAll();
    process.exit(0);
  });
  process.on("SIGTERM", killAll);
  process.on("exit", killAll);

  log("boot", `starting backend  ->  http://0.0.0.0:8000  (LAN: http://${lanIp()}:8000)`);
  const backend = spawn(VENV_PYTHON, ["-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"], {
    cwd: BACKEND_DIR,
  });
  children.push(backend);
  pipeOutput("backend", backend);
  backend.on("exit", (code) => {
    if (code !== null && code !== 0) log("boot", `backend exited with code ${code}`);
  });

  log("boot", "starting frontend ->  http://localhost:3000");
  const frontend = WIN
    ? spawn("npm run dev", { cwd: FRONTEND_DIR, shell: true })
    : spawn("npm", ["run", "dev"], { cwd: FRONTEND_DIR });
  children.push(frontend);
  pipeOutput("frontend", frontend);
  frontend.on("exit", (code) => {
    if (code !== null && code !== 0) log("boot", `frontend exited with code ${code}`);
  });

  const ready = await waitForHttp("http://localhost:3000", 30000);
  if (ready) {
    log("boot", "PulseGrab is up - opening http://localhost:3000");
    openBrowser("http://localhost:3000");
  } else {
    log("boot", "frontend didn't respond within 30s - check the [frontend] logs above.");
  }
  log("boot", "press Ctrl+C to stop both servers.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
