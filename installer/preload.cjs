const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('motionlab', {
  status: () => ipcRenderer.invoke('status'),
  installDependencies: () => ipcRenderer.invoke('install-dependencies'),
  installBlender: () => ipcRenderer.invoke('install-blender'),
  onProgress: fn => ipcRenderer.on('install-progress', (_, state) => fn(state)),
  setup: () => ipcRenderer.invoke('setup-kit'),
  demo: () => ipcRenderer.invoke('test-demo'),
  openFolder: () => ipcRenderer.invoke('open-folder'),
  installVSCode: () => ipcRenderer.invoke('install-vscode'),
  openVSCode: () => ipcRenderer.invoke('open-vscode'),
  quickCheck: () => ipcRenderer.invoke('quick-check'),
  openGuide: () => ipcRenderer.invoke('open-guide'),
  openTutorials: () => ipcRenderer.invoke('open-tutorials'),
  openLibrary: () => ipcRenderer.invoke('open-library'),
  copyText: value => ipcRenderer.invoke('copy-text', value),
  openClaudeDocs: () => ipcRenderer.invoke('open-claude-docs'),
  openGeminiKeys: () => ipcRenderer.invoke('open-gemini-keys'),
  saveGeminiKey: key => ipcRenderer.invoke('save-gemini-key', key),
  onLog: fn => ipcRenderer.on('log', (_, line) => fn(line))
});
