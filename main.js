import { app, BrowserWindow, Menu, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

// Permite autoplay do leitor sem gesto adicional do utilizador
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#17111b',
    title: 'IRADU Filmes & Séries',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  Menu.setApplicationMenu(null);

  // Links externos (ex.: externalUrl de fontes) abrem no navegador do sistema
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  await win.loadFile(path.join(dir, 'index.html'));
}

app.whenReady().then(async () => {
  // Servidor de torrents embutido (127.0.0.1:11471), o mesmo endereço por defeito da app
  try {
    await import('./server.js');
  } catch (e) {
    console.error('Servidor de torrents não arrancou:', e);
  }
  await createWindow();
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());
