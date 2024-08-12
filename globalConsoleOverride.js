// globalConsoleOverride.js

// Save the original console.log function
const originalConsoleLog = console.log;

// Override console.log to do nothing
console.log = function() {};

// Optionally, provide a way to restore the original console.log
window.restoreConsoleLog = function() {
  console.log = originalConsoleLog;
};