const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('motionlab', {
  status: () => ipcRenderer.invoke('status'),
  installDependencies: () => ipcRenderer.invoke('install-dependencies'),
  setup: () => ipcRenderer.invoke('setup-kit'),
  demo: () => ipcRenderer.invoke('test-demo'),
  openFolder: () => ipcRenderer.invoke('open-folder'),
  installVSCode: () => ipcRenderer.invoke('install-vscode'),
  openVSCode: () => ipcRenderer.invoke('open-vscode'),
  quickCheck: () => ipcRenderer.invoke('quick-check'),
  openGuide: () => ipcRenderer.invoke('open-guide'),
  openClaudeDocs: () => ipcRenderer.invoke('open-claude-docs'),
  openGeminiKeys: () => ipcRenderer.invoke('open-gemini-keys'),
  saveGeminiKey: key => ipcRenderer.invoke('save-gemini-key', key),
  onLog: fn => ipcRenderer.on('log', (_, line) => fn(line))
});
