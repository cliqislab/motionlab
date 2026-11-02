const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const windows = process.platform === 'win32';
const mac = process.platform === 'darwin';
if (mac) process.env.PATH = `/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ''}`;
let ui;
let busy = false;
const dest = () => path.join(app.getPath('documents'), 'MotionLab Kit');
const source = () => app.isPackaged ? path.join(process.resourcesPath, 'kit') : path.join(__dirname, 'stage', 'kit');
const executable = name => windows && ['npm', 'claude'].includes(name) ? `${name}.cmd` : name;
function resolved(name) {
  if (!mac) return executable(name);
  const candidates = [name, `/opt/homebrew/bin/${name}`, `/usr/local/bin/${name}`];
  for (const c of candidates) {
    if (c.includes('/') && fs.existsSync(c)) return c;
    if (!c.includes('/') && spawnSync('/usr/bin/which', [c], { timeout: 5000 }).status === 0) return c;
  }
  return name;
}
const log = message => { if (ui && !ui.isDestroyed()) ui.webContents.send('log', String(message)); };

function run(program, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(program, args, { cwd, windowsHide: true,
      shell: windows && /\.cmd$/i.test(program) });
    child.stdout.on('data', b => log(b));
    child.stderr.on('data', b => log(b));
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`${program} terminou com código ${code}`)));
  });
}
function has(program, args = ['--version']) {
  const cmd = resolved(program);
  const r = spawnSync(cmd, args, { timeout: 15000, windowsHide: true, shell: windows && /\.cmd$/i.test(cmd) });
  return r.status === 0;
}
function status() {
  return { system: `${os.type()} ${os.arch()}`,
    node: has('node'), npm: has('npm'),
    python: windows ? has('py', ['-3', '--version']) || has('python') : has('python3'),
    ffmpeg: has('ffmpeg'), claude: has('claude'),
    manager: windows ? has('winget') : mac && has('brew') };
}
function copyKit() {
  const target = dest();
  if (!fs.existsSync(path.join(source(), 'package.json'))) throw new Error('Kit não foi incluído no instalador.');
  // Nunca sobrescrever arquivos de projetos de uma instalação anterior.
  if (fs.existsSync(path.join(target, 'package.json'))) return target;
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(source(), target, { recursive: true, force: false, errorOnExist: true });
  return target;
}
async function exclusive(fn) {
  if (busy) return { error: 'Já existe uma operação em andamento.' };
  busy = true;
  try { return await fn(); }
  catch (e) { return { error: e.message }; }
  finally { busy = false; }
}

app.whenReady().then(() => {
  ui = new BrowserWindow({ width: 760, height: 720, minWidth: 610, minHeight: 550,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  ui.setMenuBarVisibility(false);
  ui.loadFile(path.join(__dirname, 'index.html'));
  ui.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
});
app.on('window-all-closed', () => app.quit());
ipcMain.handle('status', () => status());
ipcMain.handle('open-folder', () => shell.openPath(dest()));
ipcMain.handle('install-dependencies', () => exclusive(async () => {
  const s = status();
  if (!s.manager) throw new Error(windows
    ? 'winget indisponível. Instale/atualize o App Installer pela Microsoft Store.'
    : 'Homebrew não detectado. Instale pelo site oficial brew.sh e abra este instalador novamente.');
  if (windows) {
    const packages = [['node', 'OpenJS.NodeJS.LTS'], ['python', 'Python.Python.3.11'], ['ffmpeg', 'Gyan.FFmpeg']];
    for (const [name, id] of packages) if (!s[name]) {
      log(`\nInstalando ${name}... O Windows pode pedir sua autorização.\n`);
      await run('winget', ['install', '--id', id, '--exact', '--source', 'winget', '--accept-package-agreements', '--accept-source-agreements'], app.getPath('documents'));
    }
  } else if (mac) {
    const needed = [!s.node && 'node', !s.python && 'python@3.11', !s.ffmpeg && 'ffmpeg'].filter(Boolean);
    if (needed.length) await run(resolved('brew'), ['install', ...needed], app.getPath('documents'));
  } else throw new Error('Este instalador suporta Windows x64 e macOS.');
  log('\nInstalação das dependências solicitada. Reinicie o instalador se ainda não forem reconhecidas.\n');
  return { ok: true };
}));
ipcMain.handle('setup-kit', () => exclusive(async () => {
  const target = copyKit();
  const s = status();
  if (!s.node || !s.npm || !s.python || !s.ffmpeg)
    throw new Error('Instale primeiro Node.js, Python e FFmpeg. Reinicie este programa após a instalação.');
  log(`\nPreparando o kit em ${target}\n`);
  await run(resolved('npm'), ['run', 'setup', '--', '--sim'], target);
  log('\nInstalação concluída! Para criar vídeos por conversa, é necessário instalar e autenticar o Claude Code.\n');
  return { ok: true };
}));
ipcMain.handle('test-demo', () => exclusive(async () => {
  if (!fs.existsSync(path.join(dest(), 'node_modules'))) throw new Error('Prepare o kit primeiro.');
  await run(resolved('npm'), ['run', 'demo'], dest());
  log('\nDemonstração finalizada. Abra a pasta do kit para ver seu MP4.\n');
  return { ok: true };
}));
