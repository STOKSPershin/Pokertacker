// src/lib/tauriApi.ts
import { invoke } from '@tauri-apps/api';
import { save, open } from '@tauri-apps/api/dialog';
import { writeBinaryFile, readBinaryFile } from '@tauri-apps/api/fs';
import { WebviewWindow } from '@tauri-apps/api/window';

/**
 * Gets the current system timestamp from the Rust backend.
 * @returns A promise that resolves to an ISO 8601 string.
 */
export const getCurrentTime = async (): Promise<string> => {
  try {
    // This will only work in a Tauri environment
    return await invoke('get_current_timestamp');
  } catch (error) {
    console.error("Failed to get timestamp from Tauri backend, falling back to browser time.", error);
    // Fallback for when not running in Tauri or if the command fails
    return new Date().toISOString();
  }
};

/**
 * Opens a native "Save As..." dialog and saves the provided data to the selected file.
 * @param data The file content as a Uint8Array.
 * @param defaultName The default file name to suggest in the dialog.
 */
export const saveExportFile = async (data: Uint8Array, defaultName: string): Promise<void> => {
  try {
    const filePath = await save({
      defaultPath: defaultName,
      filters: [{
        name: 'Excel Workbook',
        extensions: ['xlsx']
      }]
    });

    if (filePath) {
      await writeBinaryFile(filePath, data);
    }
  } catch (error) {
     console.error("Tauri save dialog failed, falling back to browser download.", error);
     // Fallback for web environment
     // FIX: The Uint8Array from Tauri might be backed by a SharedArrayBuffer,
     // which is incompatible with the Blob constructor. Calling .slice() on the
     // Uint8Array creates a copy with a new, standard ArrayBuffer.
     const blob = new Blob([data.slice()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = defaultName;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(url);
  }
};

/**
 * Opens a native "Open File" dialog and reads the content of the selected file.
 * @returns A promise that resolves to the file content as a Uint8Array, or null if no file was selected.
 */
export const readImportFile = async (): Promise<Uint8Array | null> => {
    try {
        const selected = await open({
            multiple: false,
            filters: [{
            name: 'Excel Workbook',
            extensions: ['xlsx']
            }]
        });

        if (typeof selected === 'string') {
            const data = await readBinaryFile(selected);
            // Ensure we return a Uint8Array with a standard ArrayBuffer
            return new Uint8Array(data);
        }
        return null;
    } catch(error) {
        console.error("Tauri open dialog failed, falling back to browser input.", error);
        // Fallback for web environment
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xlsx';
            input.onchange = (event) => {
                const target = event.target as HTMLInputElement;
                const file = target.files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const arrayBuffer = e.target?.result as ArrayBuffer;
                        if (arrayBuffer) {
                            resolve(new Uint8Array(arrayBuffer));
                        } else {
                            resolve(null);
                        }
                    };
                    reader.readAsArrayBuffer(file);
                } else {
                    resolve(null);
                }
            };
            input.click();
        });
    }
};

// Track the detached window instance
let detachedWindow: WebviewWindow | null = null;

/**
 * Creates a detached session tracker window without decorations.
 * If a window already exists, closes it instead.
 */
export const createDetachedSessionTracker = async (_detachedWindowSize: 'small' | 'large' = 'large'): Promise<void> => {
  // Set window size to match container dimensions
  const width = 211;
  const height = 70;

  try {
    // If window already exists, close it
    if (detachedWindow) {
      try {
        await detachedWindow.close();
        detachedWindow = null;
        console.log('Detached session tracker window closed');
        return;
      } catch (error) {
        console.error('Error closing detached window:', error);
        detachedWindow = null;
      }
    }

    // Create new window
    detachedWindow = new WebviewWindow('session-tracker-detached', {
      url: '/session-tracker-detached',
      title: 'Session Tracker',
      width: width,
      height: height,
      minWidth: 211,
      minHeight: 70,
      maxWidth: 211,
      maxHeight: 70,
      decorations: false,
      resizable: true,
      alwaysOnTop: true,
      skipTaskbar: false,
      center: true,
      transparent: true,
      focus: true,
      // Additional window properties for better resize control
      titleBarStyle: 'overlay',
      hiddenTitle: true
    });

    await detachedWindow.once('tauri://created', () => {
      console.log('Detached session tracker window created');
    });

    await detachedWindow.once('tauri://error', (e) => {
      console.error('Failed to create detached window:', e);
      detachedWindow = null;
    });

    // Listen for window close event to reset the reference
    await detachedWindow.once('tauri://close-requested', () => {
      detachedWindow = null;
      console.log('Detached window closed by user');
    });
  } catch (error) {
    console.error('Failed to create detached session tracker window:', error);
    detachedWindow = null;
    // Fallback: open in new browser window/tab
    window.open('/session-tracker-detached', '_blank', `width=${width},height=${height},toolbar=no,menubar=no,scrollbars=no`);
  }
};


/**
 * Focuses the main application window, bringing it to the foreground.
 */
export const focusMainWindow = async (): Promise<void> => {
  try {
    const mainWindow = WebviewWindow.getByLabel('main');
    if (mainWindow) {
      await mainWindow.unminimize();
      await mainWindow.setFocus();
      console.log('Main window focused and brought to front.');
    } else {
      console.warn('Main window with label "main" not found.');
    }
  } catch (error) {
    console.error('Failed to focus main window:', error);
    // This might fail in a pure web environment, which is expected.
  }
};
