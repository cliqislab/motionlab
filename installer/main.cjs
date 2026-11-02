const { app, BrowserWindow, ipcMain, shell, clipboard } = require('electron');
const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const windows = process.platform === 'win32';
const mac = process.platform === 'darwin';
if (mac) process.env.PATH = `/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ''}`;
let ui;
let guide;
let contentWindow;
let busy = false;
const dest = () => path.join(app.getPath('documents'), 'MotionLab Kit');
const source = () => app.isPackaged ? path.join(process.resourcesPath, 'kit') : path.join(__dirname, 'stage', 'kit');
const executable = name => windows && ['npm', 'claude'].includes(name) ? `${name}.cmd` : name;
function findWinGetFFmpeg() {
  if (!windows || !process.env.LOCALAPPDATA) return null;
  const root = path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Packages');
  if (!fs.existsSync(root)) return null;
  const walk = (dir, depth) => {
    if (depth < 0) return null;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }
    for (const entry of entries) {
      if (entry.isFile() && entry.name.toLowerCase() === 'ffmpeg.exe') return path.join(dir, entry.name);
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const found = walk(path.join(dir, entry.name), depth - 1);
        if (found) return found;
      }
    }
    return null;
  };
  let packageDirs;
  try { packageDirs = fs.readdirSync(root, { withFileTypes: true }); } catch { return null; }
  for (const entry of packageDirs) {
    if (entry.isDirectory() && entry.name.toLowerCase().startsWith('gyan.ffmpeg_')) {
      const found = walk(path.join(root, entry.name), 5);
      if (found) return found;
    }
  }
  return null;
}
function resolved(name) {
  if (windows && name === 'ffmpeg') return findWinGetFFmpeg() || executable(name);
  if (!mac) return executable(name);
  const candidates = [name, `/opt/homebrew/bin/${name}`, `/usr/local/bin/${name}`, path.join(os.homedir(), '.local', 'bin', name)];
  for (const c of candidates) {
    if (c.includes('/') && fs.existsSync(c)) return c;
    if (!c.includes('/') && spawnSync('/usr/bin/which', [c], { timeout: 5000 }).status === 0) return c;
  }
  return name;
}
const log = message => { if (ui && !ui.isDestroyed()) ui.webContents.send('log', String(message)); };
const progress = (done, total, label) => { if (ui && !ui.isDestroyed()) ui.webContents.send('install-progress', { done, total, label }); };

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
  const checkArgs = program === 'ffmpeg' && args[0] === '--version' ? ['-version'] : args;
  const r = spawnSync(cmd, checkArgs, { timeout: 15000, windowsHide: true, shell: windows && /\.cmd$/i.test(cmd) });
  return r.status === 0;
}
function wingetInstalled(packageId) {
  if (!windows) return false;
  const r = spawnSync('winget', ['list', '--id', packageId, '--exact', '--source', 'winget', '--disable-interactivity'], { timeout: 25000, windowsHide: true, encoding: 'utf8' });
  return r.status === 0 && (r.stdout || '').toLowerCase().includes(packageId.toLowerCase());
}
function blenderAvailable() {
  if (has('blender', ['--version'])) return true;
  if (mac) return fs.existsSync('/Applications/Blender.app') || fs.existsSync(path.join(os.homedir(), 'Applications', 'Blender.app'));
  if (windows) {
    const root = process.env.ProgramFiles || 'C:\\Program Files';
    const base = path.join(root, 'Blender Foundation');
    return fs.existsSync(base) && fs.readdirSync(base).some(name => fs.existsSync(path.join(base, name, 'blender.exe')));
  }
  return false;
}
function status() {
  return { system: `${os.type()} ${os.arch()}`,
    node: has('node'), npm: has('npm'),
    python: windows ? has('py', ['-3', '--version']) || has('python') : has('python3'),
    ffmpeg: has('ffmpeg'), blender: blenderAvailable(), claude: has('claude'),
    manager: windows ? has('winget') : mac && has('brew'),
    vscode: editorAvailable(), kit: fs.existsSync(path.join(dest(), 'package.json')),
    prepared: fs.existsSync(path.join(dest(), 'node_modules', 'remotion', 'package.json')),
    gemini: geminiConfigured() };
}

function editorPath() {
  if (mac) {
    const apps = ['/Applications/Visual Studio Code.app', path.join(os.homedir(), 'Applications', 'Visual Studio Code.app')];
    return apps.find(p => fs.existsSync(p)) || null;
  }
  if (windows) {
    const roots = [process.env.LOCALAPPDATA, process.env.ProgramFiles, process.env['ProgramFiles(x86)']].filter(Boolean);
    return roots.map(p => path.join(p, 'Programs', 'Microsoft VS Code', 'Code.exe'))
      .concat(roots.map(p => path.join(p, 'Microsoft VS Code', 'Code.exe')))
      .find(p => fs.existsSync(p)) || null;
  }
  return null;
}
function editorAvailable() { return Boolean(editorPath()) || has('code'); }
function floatGuide() {
  if (guide && !guide.isDestroyed()) { guide.show(); guide.focus(); return; }
  guide = new BrowserWindow({
    width: 430, height: 650, minWidth: 380, minHeight: 560,
    alwaysOnTop: true, autoHideMenuBar: true,
    title: 'MotionLab — Guia flutuante',
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  guide.loadFile(path.join(__dirname, 'guide.html'));
  guide.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}
function openContentWindow(kind) {
  const tutorials = kind === 'tutorials';
  if (!contentWindow || contentWindow.isDestroyed()) {
    contentWindow = new BrowserWindow({ width: 1060, height: 780, minWidth: 700, minHeight: 570,
      autoHideMenuBar: true, title: 'MotionLab — Tutoriais e Biblioteca',
      webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
    contentWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  }
  const target = tutorials ? 'tutorials.html' : 'library.html';
  if (!contentWindow.webContents.getURL().endsWith('/' + target)) contentWindow.loadFile(path.join(__dirname, target));
  contentWindow.show(); contentWindow.focus();
}
function launchEditor() {
  const target = dest();
  if (!fs.existsSync(path.join(target, 'package.json')))
    throw new Error('Prepare a pasta do MotionLab antes de abrir o VS Code.');
  if (!editorAvailable()) throw new Error('VS Code ainda não encontrado. Instale na etapa 2.');
  const exe = mac ? '/usr/bin/open' : editorPath() || 'code';
  const args = mac ? ['-a', editorPath() || 'Visual Studio Code', target] : [target];
  return new Promise((resolve, reject) => {
    const child = spawn(exe, args, { detached: true, stdio: 'ignore', windowsHide: true, shell: windows && exe === 'code' });
    child.once('error', reject);
    child.once('spawn', () => { child.unref(); floatGuide(); resolve({ ok: true, target }); });
  });
}

function geminiEnvPath() { return path.join(dest(), '.env'); }
function geminiConfigured() {
  const file = geminiEnvPath();
  if (!fs.existsSync(file)) return false;
  const match = fs.readFileSync(file, 'utf8').match(/^GEMINI_API_KEY=(.*)$/m);
  return Boolean(match && match[1].trim());
}
function normalizeGeminiKey(value) {
  if (typeof value !== 'string') throw new Error('Informe uma chave de API válida.');
  // O AI Studio pode ser copiado como valor puro ou como GEMINI_API_KEY="...".
  let key = value.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  const assignment = key.match(/^(?:export\s+)?(?:GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*(.+)$/i);
  if (assignment) key = assignment[1].trim();
  if (/^["'`]/.test(key) && key[0] === key[key.length - 1]) key = key.slice(1, -1).trim();
  if (key.length < 20 || key.length > 512 || !/^[A-Za-z0-9_.-]+$/.test(key))
    throw new Error('Formato não reconhecido. No Google AI Studio, copie apenas o valor da chave (geralmente começa com AIza), sem texto adicional.');
  return key;
}
function saveGeminiKey(value) {
  const key = normalizeGeminiKey(value);
  const target = dest();
  if (!fs.existsSync(path.join(target, 'package.json')))
    throw new Error('Prepare os arquivos do MotionLab na etapa 3 antes de salvar a chave.');
  const envFile = geminiEnvPath();
  let content = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf8') : '';
  if (!content && fs.existsSync(path.join(target, '.env.example')))
    content = fs.readFileSync(path.join(target, '.env.example'), 'utf8');
  const line = 'GEMINI_API_KEY=' + key;
  content = /^GEMINI_API_KEY=.*$/m.test(content)
    ? content.replace(/^GEMINI_API_KEY=.*$/m, line)
    : content.replace(/\s*$/, '\n') + line + '\n';
  fs.writeFileSync(envFile, content, { mode: 0o600 });
  if (!windows) fs.chmodSync(envFile, 0o600);
  return { ok: true, configured: true };
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
  ui = new BrowserWindow({ width: 850, height: 760, minWidth: 690, minHeight: 600,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  ui.setMenuBarVisibility(false);
  ui.loadFile(path.join(__dirname, 'index.html'));
  ui.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
});
app.on('window-all-closed', () => app.quit());
ipcMain.handle('status', () => status());
ipcMain.handle('open-folder', () => shell.openPath(dest()));
ipcMain.handle('open-guide', () => { floatGuide(); return { ok: true }; });
ipcMain.handle('open-tutorials', () => { openContentWindow('tutorials'); return { ok: true }; });
ipcMain.handle('open-library', () => { openContentWindow('library'); return { ok: true }; });
ipcMain.handle('copy-text', (_event, value) => { if (typeof value !== 'string' || value.length > 16000) throw new Error('Texto inválido'); clipboard.writeText(value); return { ok: true }; });
ipcMain.handle('open-claude-docs', () => shell.openExternal('https://docs.anthropic.com/en/docs/claude-code/setup'));
ipcMain.handle('open-gemini-keys', () => shell.openExternal('https://aistudio.google.com/api-keys'));
ipcMain.handle('save-gemini-key', (_event, key) => exclusive(() => saveGeminiKey(key)));
ipcMain.handle('open-vscode', () => exclusive(launchEditor));
ipcMain.handle('quick-check', () => exclusive(async () => {
  if (!fs.existsSync(path.join(dest(), 'node_modules'))) throw new Error('Prepare o kit antes de verificar.');
  log('\nVerificando a instalação, sem renderizar vídeo completo...\n');
  await run(resolved('npm'), ['run', 'doctor'], dest());
  return { ok: true };
}));
ipcMain.handle('install-vscode', () => exclusive(async () => {
  if (editorAvailable()) return { ok: true, alreadyInstalled: true };
  if (!status().manager) throw new Error(mac ? 'Instale o Homebrew (brew.sh) antes de instalar VS Code.' : 'Instale o App Installer pela Microsoft Store antes de instalar VS Code.');
  log('\nInstalando Visual Studio Code. O sistema pode solicitar confirmação...\n');
  if (mac) await run(resolved('brew'), ['install', '--cask', 'visual-studio-code'], app.getPath('documents'));
  else if (windows) await run('winget', ['install', '--id', 'Microsoft.VisualStudioCode', '--exact', '--source', 'winget', '--accept-package-agreements', '--accept-source-agreements'], app.getPath('documents'));
  else throw new Error('Sistema não suportado.');
  return { ok: true, detected: editorAvailable() };
}));
ipcMain.handle('install-blender', () => exclusive(async () => {
  if (blenderAvailable()) return { ok: true, alreadyInstalled: true };
  if (!status().manager) throw new Error(mac ? 'Homebrew indisponível. Instale pelo site brew.sh.' : 'winget indisponível. Instale App Installer pela Microsoft Store.');
  progress(0, 1, 'Instalando Blender (opcional para 3D real)...');
  if (mac) await run(resolved('brew'), ['install', '--cask', 'blender'], app.getPath('documents'));
  else if (windows) await run('winget', ['install', '--id', 'BlenderFoundation.Blender', '--exact', '--source', 'winget', '--accept-package-agreements', '--accept-source-agreements'], app.getPath('documents'));
  else throw new Error('Sistema não suportado.');
  const detected = blenderAvailable();
  progress(1, 1, detected ? 'Blender instalado.' : 'Instalação terminou; reinicie para detectar o Blender.');
  return { ok: true, detected };
}));
ipcMain.handle('install-dependencies', () => exclusive(async () => {
  const s = status();
  if (!s.manager) throw new Error(windows
    ? 'winget indisponível. Instale/atualize o App Installer pela Microsoft Store.'
    : 'Homebrew não detectado. Instale pelo site oficial brew.sh e abra este instalador novamente.');
  const tasks = windows
    ? [['node', 'OpenJS.NodeJS.LTS'], ['python', 'Python.Python.3.11'], ['ffmpeg', 'Gyan.FFmpeg']].filter(([name]) => !s[name])
    : [['node', 'node'], ['python', 'python@3.11'], ['ffmpeg', 'ffmpeg']].filter(([name]) => !s[name]);
  let done = 0;
  progress(done, tasks.length || 1, tasks.length ? 'Preparando instalação...' : 'Dependências já encontradas.');
  for (const [name, id] of tasks) {
    progress(done, tasks.length, `Instalando ${name} (${done + 1} de ${tasks.length})...`);
    log(`\nInstalando ${name}... O sistema pode solicitar autorização.\n`);
    if (windows) {
      if (wingetInstalled(id)) {
        log(`\n${name} já consta como instalado no winget. Evitando instalar/atualizar novamente.\n`);
      } else {
        try {
          await run('winget', ['install', '--id', id, '--exact', '--source', 'winget', '--accept-package-agreements', '--accept-source-agreements'], app.getPath('documents'));
        } catch (error) {
          if (!wingetInstalled(id)) throw error;
          log(`\n${name} está instalado segundo o winget. Prosseguindo sem tentar atualizar novamente.\n`);
        }
      }
    } else if (mac) await run(resolved('brew'), ['install', id], app.getPath('documents'));
    else throw new Error('Este instalador suporta Windows x64 e macOS.');
    done++;
    progress(done, tasks.length || 1, `${name} concluído (${done} de ${tasks.length}).`);
  }
  if (!tasks.length) progress(1, 1, 'Dependências já instaladas.');
  const after = status();
  const missing = ['node', 'npm', 'python', 'ffmpeg'].filter(name => !after[name]);
  if (missing.length) log(`\nInstalação finalizada, mas não foi possível reconhecer: ${missing.join(', ')}. Reinicie o MotionLab para atualizar o PATH; caso persista, confira o diretório do executável.\n`);
  else log('\nDependências essenciais reconhecidas. Você já pode preparar o kit.\n');
  if (!after.claude) log('Claude Code é opcional nesta etapa: instale separadamente e faça login para criar vídeos por conversa.\n');
  return { ok: true, missing, claude: after.claude };
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
