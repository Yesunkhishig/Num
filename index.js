// index.js - Main entry point for the application
// This file loads all required modules and initializes the application

// Load modules
document.addEventListener('DOMContentLoaded', () => {
  // Load QR code library
  loadScript('https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js');
  
  // Load application modules
  loadScript('localStorage.js', () => {
    // Initialize localStorage
    window.localStorageDB = new LocalStorageDB();
    
    // Load other modules after localStorage is initialized
    loadScript('auth.js');
    loadScript('notifications.js');
    loadScript('report.js');
  });
});

/**
 * Load script dynamically
 * @param {string} src - Script source URL
 * @param {Function} callback - Callback function to execute after script is loaded
 */
function loadScript(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  
  if (callback) {
    script.onload = callback;
  }
  
  document.head.appendChild(script);
}

/**
 * Initialize application
 * This function is called after all modules are loaded
 */
function initApp() {
  console.log('Application initialized');
}
