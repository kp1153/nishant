const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

let mainWindow;
let nextProcess;

function waitForServer(url, retries, callback) {
  http.get(url, () => callback()).on("error", () => {
    if (retries === 0) return;
    setTimeout(() => waitForServer(url, retries - 1, callback), 1000);
  });
}

function startNextServer() {
  const nextPath = path.join(__dirname, "node_modules", ".bin", "next");
  nextProcess = spawn(nextPath, ["start", "-p", "3000"], {
    cwd: __dirname,
    shell: true,
    stdio: "ignore",
    env: { ...process.env, NODE_ENV: "production" },
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "निशांत - हार्डवेयर प्रबंधन",
    autoHideMenuBar: true,
    show: false,
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("closed", () => {
    mainWindow = null;
    if (nextProcess) nextProcess.kill();
    app.quit();
  });

  startNextServer();
  waitForServer("http://localhost:3000", 30, () => {
    mainWindow.loadURL("http://localhost:3000");
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (nextProcess) nextProcess.kill();
  app.quit();
});