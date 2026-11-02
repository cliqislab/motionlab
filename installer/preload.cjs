const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('motionlab', {
  status: () => ipcRenderer.invoke('status'),
  installDependencies: () => ipcRenderer.invoke('install-dependencies'),
  setup: () => ipcRenderer.invoke('setup-kit'),
  demo: () => ipcRenderer.invoke('test-demo'),
  openFolder: () => ipcRenderer.invoke('open-folder'),
  onLog: fn => ipcRenderer.on('log', (_, line) => fn(line))
});
