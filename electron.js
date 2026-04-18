const { app, BrowserWindow } = require("electron");

const VERCEL_URL = "https://nishant-ten.vercel.app";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
    title: "निशांत - हार्डवेयर प्रबंधन",
    autoHideMenuBar: true,
    show: false,
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("closed", () => {
    mainWindow = null;
    app.quit();
  });

  mainWindow.loadURL(VERCEL_URL);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});