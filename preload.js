const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  saveData: (filename, data) => ipcRenderer.invoke('save-data', filename, data),
  loadData: (filename) => ipcRenderer.invoke('load-data', filename)
});
